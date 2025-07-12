import { cloneConstraint, Constraint, ConstraintProps } from "../../../types/puzzle/Constraint";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { RotatableCluesPTM } from "../types/RotatableCluesPTM";
import { RotatableClueItemConstraint, RotatableClue } from "../types/RotatableCluesPuzzleExtension";
import { AutoSvg } from "../../../components/svg/auto-svg/AutoSvg";
import { getLineVector, Position, rotateVectorClockwise } from "../../../types/layout/Position";
import { loop } from "../../../utils/math";
import { GridLayer } from "../../../types/puzzle/GridLayer";
import { lightGreyColor, veryDarkGreyColor } from "../../../components/app/globals";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../utils/profiler";
import { gameStateSetSelectedCells, gameStateToggleSelectedCells } from "../../../types/puzzle/GameState";
import { rgba } from "../../../utils/color";
import { CellHighlightColor } from "../../../components/puzzle/cell/CellHighlight";
import { cancelOutsideClickProps } from "../../../utils/gestures";
import { runInAction } from "mobx";
import { notFinishedResultCheck, successResultCheck } from "../../../types/puzzle/PuzzleResultCheck";

const pivotRadius = 0.15;
const pivotLineWidth = pivotRadius * 0.1;

export const RotatableClueConstraint = <T extends AnyPTM>(
    rotatableClue: RotatableClue,
    angle: number,
    animatedAngle: number,
): Constraint<RotatableCluesPTM<T>, any>[] => {
    const { clues, pivot, coeff = 1 } = rotatableClue;

    const roundedAnimatedAngle = loop(Math.round(animatedAngle), 360);
    const pivotDirection = rotateVectorClockwise({ top: -pivotRadius, left: 0 }, roundedAnimatedAngle);

    const processCellsCoords = (clue: RotatableClueItemConstraint<AnyPTM, any>, cells = clue.cells): Position[] =>
        clue.processRotatableCellsCoords?.(rotatableClue, angle, cells) ??
        cells.map((cell) => {
            if (clue.processRotatableCellCoords) {
                return clue.processRotatableCellCoords(rotatableClue, angle, cell);
            }

            const { top, left } = rotateVectorClockwise(getLineVector({ start: pivot, end: cell }), angle);

            return {
                top: pivot.top + Math.round(top),
                left: pivot.left + Math.round(left),
            };
        });

    const processedCells = clues.flatMap((clue) => processCellsCoords(clue, clue.cells));

    return [
        ...clues.flatMap((clue) => [
            {
                ...cloneConstraint(clue, { processCellsCoords: (cells) => processCellsCoords(clue, cells) }),
                name: `${clue.name} - validation`,
                component: undefined,
                _rotatableClueAngle: angle,
            },
            {
                ...clue,
                name: `${clue.name} - animation`,
                component:
                    clue.component &&
                    Object.fromEntries(
                        Object.entries(clue.component).map(([layer, Component]) => [
                            layer,
                            (props: ConstraintProps<RotatableCluesPTM<T>, any>) => {
                                const Wrapper = clue.rotatableProcessorComponent;
                                if (Wrapper) {
                                    return (
                                        <Wrapper rotatableClue={rotatableClue} animatedAngle={animatedAngle}>
                                            <Component {...props} />
                                        </Wrapper>
                                    );
                                }

                                const offsetTop = pivot.top + 0.5;
                                const offsetLeft = pivot.left + 0.5;

                                return (
                                    <AutoSvg top={offsetTop} left={offsetLeft} angle={animatedAngle}>
                                        <AutoSvg top={-offsetTop} left={-offsetLeft}>
                                            <Component {...props} />
                                        </AutoSvg>
                                    </AutoSvg>
                                );
                            },
                        ]),
                    ),
                renderSingleCellInUserArea: false,
                isValidCell: undefined,
                isValidPuzzle: undefined,
                getInvalidUserLines: undefined,
            },
        ]),
        {
            name: "rotatable clue pivot",
            cells: [pivot],
            props: undefined,
            component: {
                [GridLayer.top]: observer(function RotatableCluePivot({ cells: [{ top, left }], context: { puzzle } }) {
                    profiler.trace();

                    if (puzzle.importOptions?.freeRotation && puzzle.importOptions?.wheels) {
                        return null;
                    }

                    return (
                        <AutoSvg top={top + 0.5} left={left + 0.5}>
                            <circle
                                r={pivotRadius}
                                fill={"#BD8ABB"}
                                stroke={veryDarkGreyColor}
                                strokeWidth={pivotLineWidth}
                            />
                            <path
                                d={[
                                    "M",
                                    0,
                                    -pivotRadius,
                                    "A",
                                    pivotRadius,
                                    pivotRadius,
                                    roundedAnimatedAngle,
                                    // eslint-disable-next-line no-mixed-operators
                                    roundedAnimatedAngle < 180 === coeff > 0 ? 0 : 1,
                                    coeff > 0 ? 1 : 0,
                                    pivotDirection.left,
                                    pivotDirection.top,
                                    "L",
                                    0,
                                    0,
                                    "z",
                                ].join(" ")}
                                fill={lightGreyColor}
                                stroke={veryDarkGreyColor}
                                strokeWidth={pivotLineWidth}
                            />
                        </AutoSvg>
                    );
                }),
                [GridLayer.interactive]: observer(function RotatableCluePivotSelection({ cells: [cell], context }) {
                    profiler.trace();

                    const { top, left } = cell;

                    if (top % 1 === 0 && left % 1 === 0) {
                        return null;
                    }

                    const isSelected = context.isSelectedCell(top, left);

                    return (
                        <AutoSvg top={top + 0.5} left={left + 0.5}>
                            <circle
                                r={0.5}
                                stroke={"none"}
                                strokeWidth={0}
                                fill={isSelected ? rgba(CellHighlightColor.mainCurrent, 0.3) : "none"}
                                style={{
                                    pointerEvents: "all",
                                    cursor: "pointer",
                                }}
                                {...cancelOutsideClickProps}
                                onClick={(ev) =>
                                    runInAction(() =>
                                        context.onStateChange(
                                            ev.ctrlKey ||
                                                ev.metaKey ||
                                                ev.shiftKey ||
                                                (isSelected && context.selectedCellsCount === 1)
                                                ? gameStateToggleSelectedCells(context, [cell])
                                                : gameStateSetSelectedCells(context, [cell]),
                                        ),
                                    )
                                }
                            />
                        </AutoSvg>
                    );
                }),
            },
            renderSingleCellInUserArea: true,
            isObvious: true,
            isValidPuzzle(_lines, _digits, _cells, context) {
                const {
                    puzzleIndex: { allCells },
                } = context;

                // Verify that the rotated cells are still within the grid
                return processedCells.every(({ top, left }) => top % 1 !== 0 || left % 1 !== 0 || allCells[top]?.[left])
                    ? successResultCheck(context.puzzle)
                    : notFinishedResultCheck();
            },
            isValidCell(cell, digits, regionCells, context, constraints, constraint, isFinalCheck): boolean {
                const {
                    puzzle: {
                        typeManager: { getDigitByCellData },
                        importOptions,
                    },
                } = context;

                if (!isFinalCheck || importOptions?.freeRotation) {
                    return true;
                }

                const digit = getDigitByCellData(digits[cell.top][cell.left], context, cell);

                return loop(digit * 90 - angle, 360) === 0;
            },
        },
    ];
};
