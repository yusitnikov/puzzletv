import {Constraint, ConstraintProps} from "../../../types/sudoku/Constraint";
import {FullCubePTM} from "../types/FullCubePTM";
import {FieldLayer} from "../../../types/sudoku/FieldLayer";
import {observer} from "mobx-react-lite";
import {profiler} from "../../../utils/profiler";
import {AutoSvg} from "../../../components/svg/auto-svg/AutoSvg";
import {getRectCenter} from "../../../types/layout/Rect";
import {getVectorLength3D, Position3D, subtractVectors3D} from "../../../types/layout/Position3D";
import {transformFullCubeCoords3D} from "../helpers/fullCubeHelpers";
import {GridRegion} from "../../../types/sudoku/GridRegion";
import {Position} from "../../../types/layout/Position";
import {indexes} from "../../../utils/indexes";
import {CellColorValue, resolveCellColorValue} from "../../../types/sudoku/CellColor";
import {CenteredText} from "../../../components/svg/centered-text/CenteredText";
import {textColor} from "../../../components/app/globals";

const FullCubeJss = {
    [FieldLayer.regular]: observer(function FullCubeJssFc({context, region}: ConstraintProps<FullCubePTM>) {
        profiler.trace();

        if (!region?.noInteraction) {
            return null;
        }

        const {
            puzzle: {
                fieldSize: {fieldSize},
                solution,
                solutionColors,
            },
            regions = [],
        } = context;

        const realFieldSize = fieldSize / 2;
        const radius = realFieldSize / 2;

        const regionsWithPositions = regions
            .filter(({noInteraction}) => !noInteraction)
            .map((region) => ({
                region,
                vector: transformFullCubeCoords3D(getRectCenter(region), context),
            }));

        interface Clue {
            color: CellColorValue;
            sum: number;
        }
        type PositionFn = (position: Position3D) => Position;
        const findRegion = (vector: Position3D) => {
            return regionsWithPositions
                .find((region) => getVectorLength3D(subtractVectors3D(region.vector, vector)) < 0.01)
                ?.region;
        };
        const getRegionData = (region: GridRegion, positionFn: PositionFn) => {
            const result: {digit?: number, color?: CellColorValue}[][] = indexes(realFieldSize).map(() => indexes(realFieldSize).map(() => ({})));

            for (const dx of indexes(realFieldSize)) {
                const left = region.left + dx;
                for (const dy of indexes(realFieldSize)) {
                    const top = region.top + dy;
                    const cluePosition = positionFn(transformFullCubeCoords3D({top: top + 0.5, left: left + 0.5}, context));
                    const clueTop = Math.floor(cluePosition.top) + radius;
                    const clueLeft = Math.floor(cluePosition.left) + radius;
                    if (clueTop in result && clueLeft in result[clueTop]) {
                        result[clueTop][clueLeft] = {
                            digit: Number(solution?.[top]?.[left] ?? 0),
                            color: solutionColors?.[top]?.[left]?.[0],
                        };
                    }
                }
            }

            return result;
        };
        const getClues = (
            vector1: Position3D,
            positionFn1: PositionFn,
            vector2: Position3D,
            positionFn2: PositionFn,
        ): Clue[][] => {
            const region1 = findRegion(vector1);
            const region2 = findRegion(vector2);

            if (!region1 || !region2) {
                return [];
            }

            const data1 = getRegionData(region1, positionFn1);
            const data2 = getRegionData(region2, positionFn2);
            const data = data1.map((row, top) => [...row, ...data2[top]]);

            return data.map((row) => {
                const result: Clue[] = [];
                let lastColor: CellColorValue | undefined = undefined;

                for (const {digit, color} of row) {
                    if (color !== undefined) {
                        if (color !== lastColor) {
                            result.push({
                                color,
                                sum: 0,
                            });
                        }

                        const item = result[result.length - 1];
                        item.sum += digit ?? 0;
                    }

                    lastColor = color;
                }

                return result;
            });
        };

        let clues: Clue[][];
        let switchDirection = false;
        switch (region.left / realFieldSize) {
            case 0:
                clues = getClues(
                    {x: 0, y: 0, z: radius},
                    ({x, y}) => ({top: y, left: x}),
                    {x: radius, y: 0, z: 0},
                    ({y, z}) => ({top: y, left: -z}),
                );
                break;
            case 1:
                // noinspection JSSuspiciousNameCombination
                clues = getClues(
                    {x: 0, y: -radius, z: 0},
                    ({x, z}) => ({top: z, left: x}),
                    {x: radius, y: 0, z: 0},
                    ({y, z}) => ({top: z, left: y}),
                );
                break;
            default:
                switchDirection = true;
                // noinspection JSSuspiciousNameCombination
                clues = getClues(
                    {x: 0, y: -radius, z: 0},
                    ({x, z}) => ({top: x, left: z}),
                    {x: 0, y: 0, z: radius},
                    ({x, y}) => ({top: x, left: y}),
                );
                break;
        }

        return <AutoSvg top={region.top} left={region.left}>
            {clues.flatMap((row, top) => row.map(({color, sum}, left) => {
                // Move the clues to the end of the row
                left += realFieldSize - row.length;

                return <AutoSvg
                    key={`${top}-${left}`}
                    top={switchDirection ? left : top}
                    left={switchDirection ? top : left}
                >
                    <rect
                        width={1}
                        height={1}
                        strokeWidth={0}
                        stroke={"none"}
                        fill={resolveCellColorValue(color)}
                    />

                    <CenteredText
                        top={0.5}
                        left={0.5}
                        size={0.7}
                        fill={textColor}
                    >
                        {sum}
                    </CenteredText>
                </AutoSvg>;
            }))}
        </AutoSvg>;
    }),
};

export const FullCubeJssConstraint: Constraint<FullCubePTM> = {
    name: "full cube JSS",
    cells: [],
    props: undefined,
    component: FullCubeJss,
};
