import {cloneConstraint, Constraint, ConstraintProps} from "../../../types/sudoku/Constraint";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";
import {RotatableCluesPTM} from "../types/RotatableCluesPTM";
import {RotatableClue} from "../types/RotatableCluesPuzzleExtension";
import {AutoSvg} from "../../../components/svg/auto-svg/AutoSvg";
import {getLineVector, Position, rotateVectorClockwise} from "../../../types/layout/Position";
import {loop} from "../../../utils/math";
import {FieldLayer} from "../../../types/sudoku/FieldLayer";
import {lightGreyColor, veryDarkGreyColor} from "../../../components/app/globals";

const pivotRadius = 0.15;
const pivotLineWidth = pivotRadius * 0.1;

export const RotatableClueConstraint = <T extends AnyPTM>(
    {clue, pivot}: RotatableClue,
    angle: number,
    animatedAngle: number,
): Constraint<RotatableCluesPTM<T>, any>[] => {
    const roundedAnimatedAngle = loop(Math.round(animatedAngle), 360);
    const pivotDirection = rotateVectorClockwise({top: -pivotRadius, left: 0}, roundedAnimatedAngle);

    const processCellCoords = (cell: Position): Position => {
        const {top, left} = rotateVectorClockwise(getLineVector({start: pivot, end: cell}), angle);

        return {
            top: pivot.top + Math.round(top),
            left: pivot.left + Math.round(left),
        };
    };
    const processedCells = clue.cells.map(processCellCoords);

    return [
        {
            ...clue,
            ...cloneConstraint(clue, {processCellCoords}),
            name: `${clue.name} - validation`,
            component: undefined,
        },
        {
            ...clue,
            name: `${clue.name} - animation`,
            component: Object.fromEntries(Object.entries(clue.component ?? {}).map(([layer, Component]) => [
                layer,
                (props: ConstraintProps<RotatableCluesPTM<T>, any>) => {
                    const cellFixOffset = getLineVector({start: props.cells[0], end: clue.cells[0]});
                    const offsetTop = pivot.top + 0.5 + cellFixOffset.top;
                    const offsetLeft = pivot.left + 0.5 + cellFixOffset.left;

                    return <AutoSvg top={offsetTop} left={offsetLeft} angle={animatedAngle}>
                        <AutoSvg top={-offsetTop} left={-offsetLeft}>
                            <Component {...props}/>
                        </AutoSvg>
                    </AutoSvg>;
                },
            ])),
            isValidCell: undefined,
            isValidPuzzle: undefined,
            getInvalidUserLines: undefined,
        },
        {
            name: "rotatable clue pivot",
            cells: [pivot],
            props: undefined,
            component: {
                [FieldLayer.regular]: ({cells: [{top, left}]}) => <AutoSvg top={top + 0.5} left={left + 0.5}>
                    <circle
                        r={pivotRadius}
                        fill={"#BD8ABB"}
                        stroke={veryDarkGreyColor}
                        strokeWidth={pivotLineWidth}
                    />
                    <path
                        d={[
                            "M", 0, -pivotRadius,
                            "A", pivotRadius, pivotRadius,
                            roundedAnimatedAngle, roundedAnimatedAngle < 180 ? 0 : 1, 1,
                            pivotDirection.left, pivotDirection.top,
                            "L", 0, 0,
                            "z"
                        ].join(" ")}
                        fill={lightGreyColor}
                        stroke={veryDarkGreyColor}
                        strokeWidth={pivotLineWidth}
                    />
                </AutoSvg>,
            },
            renderSingleCellInUserArea: true,
            isObvious: true,
            isValidPuzzle(
                lines,
                digits,
                regionCells,
                {cellsIndex: {allCells}},
            ): boolean {
                // Verify that the rotated cells are still within the grid
                return processedCells.every(({top, left}) => allCells[top]?.[left]);
            },
            isValidCell(cell, digits, regionCells, context, constraints, isFinalCheck): boolean {
                if (!isFinalCheck) {
                    return true;
                }

                const {puzzle: {typeManager: {getDigitByCellData}}} = context;
                const digit = getDigitByCellData(digits[cell.top][cell.left], context, cell);

                const normalizeAngle = (angle: number) => {
                    const normalizedAngle = loop(angle, 360);
                    return normalizedAngle === 270 ? 90 : normalizedAngle;
                };

                return normalizeAngle(angle) === normalizeAngle(digit * 90);
            },
        },
    ];
};
