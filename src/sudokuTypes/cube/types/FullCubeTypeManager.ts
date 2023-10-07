import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {DigitSudokuTypeManager} from "../../default/types/DigitSudokuTypeManager";
import {createRegularRegions, FieldSize} from "../../../types/sudoku/FieldSize";
import {
    getLineVector,
    PositionWithAngle,
    rotateVectorClockwise,
    scaleVector
} from "../../../types/layout/Position";
import {Rect} from "../../../types/layout/Rect";
import {darkGreyColor} from "../../../components/app/globals";
import {indexes} from "../../../utils/indexes";
import {RegionConstraint} from "../../../components/sudoku/constraints/region/Region";
import {Constraint} from "../../../types/sudoku/Constraint";
import {CellTypeProps} from "../../../types/sudoku/CellTypeProps";
import {FullCubePTM} from "./FullCubePTM";
import {FullCubeGameState, ProcessedFullCubeGameState} from "./FullCubeGameState";
import {
    addVectors3D,
    initialCoordsBase3D,
    Position3D,
    scaleVector3D,
    vectorMultiplication3D
} from "../../../types/layout/Position3D";
import {useAnimatedValue} from "../../../hooks/useAnimatedValue";
import {settings} from "../../../types/layout/Settings";
import {GridRegion} from "../../../types/sudoku/GridRegion";
import {FullCubeControls} from "../components/FullCubeControls";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {FullCubeJssConstraint} from "../constraints/FullCubeJss";
import {transformFullCubeCoords3D} from "../helpers/fullCubeHelpers";

export const FullCubeTypeManager = (): SudokuTypeManager<FullCubePTM> => ({
    ...DigitSudokuTypeManager<FullCubePTM>(),

    initialGameStateExtension: {
        coordsBase: initialCoordsBase3D,
    },
    serializeGameState({coordsBase}: Partial<FullCubeGameState>): any {
        return {coordsBase};
    },
    unserializeGameState({coordsBase}: any): Partial<FullCubeGameState> {
        return {coordsBase};
    },
    useProcessedGameStateExtension({stateExtension: {coordsBase}}): ProcessedFullCubeGameState {
        return {
            animatedCoordsBase: useAnimatedValue(
                coordsBase,
                settings.animationSpeed.get(),
                (a, b, coeff) => {
                    // TODO: implement the real rotation of the coords bases
                    const mix = (a: Position3D, b: Position3D) => addVectors3D(
                        scaleVector3D(a, 1 - coeff),
                        scaleVector3D(b, coeff),
                    );
                    return {
                        ox: mix(a.ox, b.ox),
                        oy: mix(a.oy, b.oy),
                        oz: mix(a.oz, b.oz),
                    };
                },
            )
        };
    },
    getProcessedGameStateExtension({stateExtension: {coordsBase}}): ProcessedFullCubeGameState {
        return {animatedCoordsBase: coordsBase};
    },

    fieldControlsComponent: FullCubeControls,

    getCellTypeProps({top}, {fieldSize: {columnsCount}}): CellTypeProps<FullCubePTM> {
        const realFieldSize = columnsCount / 3;
        return {isSelectable: top < realFieldSize * 2};
    },

    processCellDataPosition(
        context,
        basePosition,
        dataSet,
        dataIndex,
        positionFunction,
        cellPosition,
    ): PositionWithAngle | undefined {
        const {
            puzzle: {
                typeManager: {transformCoords},
            },
        } = context;

        if (!basePosition || !cellPosition) {
            return basePosition;
        }

        const [p0, p1, p2] = [
            {top: 0.5, left: 0.5},
            {top: 0.5, left: 0.6},
            {top: 0.6, left: 0.5},
        ]
            .map(({top, left}) => ({
                top: cellPosition.top + top,
                left: cellPosition.left + left,
            }))
            .map((point) => transformCoords?.(point, context) ?? point);
        const v1 = getLineVector({start: p0, end: p1});
        const v2 = getLineVector({start: p0, end: p2});

        const bestAngle = indexes(8)
            .map((index) => {
                const angle = index * 45;

                const {left: c1, top: c2} = rotateVectorClockwise({left: 0, top: 1}, angle);

                return {
                    angle,
                    x: Math.abs(v1.left * c1 + v2.left * c2),
                    y: v1.top * c1 + v2.top * c2,
                };
            })
            .filter(({y}) => y >= 0)
            .sort((a, b) => Math.sign(a.x - b.x))
            [0].angle;

        return {
            ...scaleVector(
                rotateVectorClockwise(basePosition, bestAngle),
                bestAngle % 90 === 0 ? 1 : 0.9
            ),
            angle: basePosition.angle + bestAngle,
        };
    },

    transformCoords(position, context) {
        const {puzzle: {fieldSize: {columnsCount}}} = context;
        const realFieldSize = columnsCount / 3;

        const {x, y, z} = transformFullCubeCoords3D(position, context);

        return {
            left: realFieldSize + x - z,
            top: realFieldSize + y + x / 2 + z / 2,
        };
    },

    getRegionsWithSameCoordsTransformation(context): GridRegion[] {
        const {
            puzzle: {
                typeManager: {transformCoords},
                fieldSize: {columnsCount},
            },
        } = context;

        const realFieldSize = columnsCount / 3;

        return [0, 1, 2].flatMap((left) => [0, 1, 2].map((top): GridRegion => {
            const rect: Rect = {
                left: realFieldSize * left,
                top: realFieldSize * top,
                width: realFieldSize,
                height: realFieldSize,
            };

            // Get projections of the rect points onto the screen
            // (use inner points of the rect because transformCoords may fail on exact region borders)
            const [p0, p1, p2] = [
                {top: 0.1, left: 0.1},
                {top: 0.1, left: 0.9},
                {top: 0.9, left: 0.1},
            ]
                .map(({top, left}) => ({
                    top: rect.top + rect.width * top,
                    left: rect.left + rect.height * left,
                }))
                .map((point) => transformCoords?.(point, context) ?? point);
            const v1 = getLineVector({start: p0, end: p1});
            const v2 = getLineVector({start: p0, end: p2});
            const isVisible = vectorMultiplication3D(
                {
                    x: v1.left,
                    y: v1.top,
                    z: 0,
                },
                {
                    x: v2.left,
                    y: v2.top,
                    z: 0,
                },
            ).z > 0;

            return {
                ...rect,
                opacity: isVisible ? 1 : 0.1,
                zIndex: isVisible ? 2 : 1,
                // noBorders: top === 2,
                noInteraction: top === 2,
            };
        }));
    },

    getRegionsForRowsAndColumns({puzzle: {fieldSize: {columnsCount}}}): Constraint<FullCubePTM, any>[] {
        const realFieldSize = columnsCount / 3;

        return [0, 1, 2].flatMap((left) => [0, 1].flatMap((top) => indexes(realFieldSize).flatMap((i) => [
            RegionConstraint(
                indexes(realFieldSize).map(j => ({
                    left: left * realFieldSize + i,
                    top: top * realFieldSize + j,
                })),
                false,
                "column"
            ),
            RegionConstraint(
                indexes(realFieldSize).map(j => ({
                    left: left * realFieldSize + j,
                    top: top * realFieldSize + i,
                })),
                false,
                "row"
            ),
        ])));
    },

    // getAdditionalNeighbors({top, left}, {fieldSize: {columnsCount}}) {
    //     const realFieldSize = columnsCount / 3;
    //
    //     if (true) {
    //         if (left === realFieldSize - 1 && top < realFieldSize) {
    //             return [{
    //                 top: realFieldSize,
    //                 left: realFieldSize * 2 - 1 - top,
    //             }];
    //         }
    //
    //         if (top === realFieldSize && left >= realFieldSize) {
    //             return [{
    //                 top: realFieldSize * 2 - 1 - left,
    //                 left: realFieldSize - 1,
    //             }];
    //         }
    //     }
    //
    //     return [];
    // },

    borderColor: darkGreyColor,

    mapImportedColors: true,

    postProcessPuzzle(puzzle): PuzzleDefinition<FullCubePTM> {
        const {
            fieldSize: {rowsCount, columnsCount},
            fieldMargin = 0,
            allowDrawing,
            items,
        } = puzzle;

        const realFieldSize = columnsCount / 3;

        const isJss = Array.isArray(items) && items.includes(FullCubeJssConstraint);

        return {
            ...puzzle,
            fieldSize: {
                ...puzzle.fieldSize,
                fieldSize: realFieldSize * 2,
                rowsCount: isJss ? columnsCount : rowsCount,
            },
            fieldMargin: Math.max(fieldMargin, realFieldSize),
            ignoreRowsColumnCountInTheWrapper: true,
            allowDrawing: allowDrawing?.filter((item) => item === "center-mark"),
        };
    }
});

export const createFullCubeFieldSize = (fieldSize: number, withJss = false): FieldSize => ({
    fieldSize: fieldSize * 2,
    rowsCount: fieldSize * (withJss ? 3 : 2),
    columnsCount: fieldSize * 3,
});

export const createFullCubeRegions = (fieldSize: number, regionWidth: number, regionHeight = fieldSize / regionWidth) => {
    const regions = createRegularRegions(fieldSize, fieldSize, regionWidth, regionHeight);
    return [0, 1, 2].flatMap((leftQuad) => [0, 1].flatMap((topQuad) => regions.map(
        (region) => region.map(({top, left}) => ({
            top: topQuad * fieldSize + top,
            left: leftQuad * fieldSize + left,
        }))
    )));
};
