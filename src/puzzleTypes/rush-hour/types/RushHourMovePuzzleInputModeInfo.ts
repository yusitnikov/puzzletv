import { PuzzleInputModeInfo } from "../../../types/puzzle/PuzzleInputModeInfo";
import { MovePuzzleInputModeInfo } from "../../../types/puzzle/inputModes/move";
import { rushHourCarStateChangeAction } from "./RushHourGameCarState";
import { GestureInfo } from "../../../utils/gestures";
import { isCellGestureExtraData } from "../../../types/puzzle/CellGestureExtraData";
import { RushHourPTM } from "./RushHourPTM";
import { LanguageCode } from "../../../types/translations/LanguageCode";
import { myClientId } from "../../../hooks/useMultiPlayer";
import { arrayContainsPosition, Position } from "../../../types/layout/Position";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";
import { PuzzleInputMode } from "../../../types/puzzle/PuzzleInputMode";
import { Rect } from "../../../types/layout/Rect";
import { carMargin } from "../components/RushHourCar";
import { CellsMap, processCellsMaps } from "../../../types/puzzle/CellsMap";

const base = MovePuzzleInputModeInfo<RushHourPTM>();

export const RushHourMovePuzzleInputModeInfo = (
    isCars: boolean,
    restrictCarCoords?: (car: Rect, isVertical: boolean, context: PuzzleContext<RushHourPTM>) => number,
): PuzzleInputModeInfo<RushHourPTM> => ({
    title: {
        [LanguageCode.en]: isCars ? "Move the cars" : "Move the clues",
        [LanguageCode.ru]: isCars ? "Двигать машины" : "Двигать элементы головоломки",
    },
    mode: PuzzleInputMode.move,
    isNoSelectionMode: true,
    maxDigit: 0,
    mainButtonContent: base.mainButtonContent,
    hotKeyStr: base.hotKeyStr,
    isValidGesture: base.isValidGesture,
    onMove(props, context) {
        const { gesture, startMetrics, currentMetrics } = props;
        const { id, state: startContext } = gesture;
        const { puzzle, cellSize } = context;
        const {
            gridSize: { gridSize },
            importOptions: { givenDigitsBlockCars } = {},
        } = puzzle;

        if (!puzzle.extension.cars?.length) {
            return;
        }

        const carIndex = getRushHourCarIndexByGesture(startContext, gesture);
        if (carIndex === undefined) {
            return;
        }
        const carRects = puzzle.extension.cars.map(({ boundingRect }) => boundingRect);
        const carRect = carRects[carIndex];

        const { direction, cells } = puzzle.extension.cars[carIndex];

        context.onStateChange(
            rushHourCarStateChangeAction(
                startContext,
                myClientId,
                `gesture-${id}`,
                carIndex,
                ({ top, left }, prevPositions) => {
                    const blockedCells: CellsMap<boolean> = {};

                    const blockCell = (top: number, left: number) => {
                        blockedCells[top] ??= {};
                        blockedCells[top][left] = true;
                    };

                    for (const [index, position] of prevPositions.entries()) {
                        if (index === carIndex) {
                            continue;
                        }

                        for (const cell of puzzle.extension.cars[index].cells) {
                            blockCell(cell.top + position.top, cell.left + position.left);
                        }
                    }

                    if (givenDigitsBlockCars) {
                        processCellsMaps(
                            (_, position) => blockCell(position.top, position.left),
                            [puzzle.initialDigits ?? {}],
                        );
                    }

                    const offsetTop = top + carRect.top;
                    const offsetLeft = left + carRect.left;

                    let targetTop = offsetTop,
                        targetLeft = offsetLeft;
                    if (direction !== "horizontal") {
                        targetTop = offsetTop + (currentMetrics.y - startMetrics.y) / cellSize;
                        targetTop = Math.max(-carMargin, targetTop);
                        targetTop = Math.min(gridSize + carMargin - carRect.height, targetTop);

                        if (restrictCarCoords) {
                            targetTop = restrictCarCoords(
                                {
                                    ...carRect,
                                    top: targetTop,
                                    left: targetLeft,
                                },
                                true,
                                context,
                            );
                        }
                    }
                    if (direction !== "vertical") {
                        targetLeft = offsetLeft + (currentMetrics.x - startMetrics.x) / cellSize;
                        targetLeft = Math.max(-carMargin, targetLeft);
                        targetLeft = Math.min(gridSize + carMargin - carRect.width, targetLeft);

                        if (restrictCarCoords) {
                            targetLeft = restrictCarCoords(
                                {
                                    ...carRect,
                                    top: targetTop,
                                    left: targetLeft,
                                },
                                false,
                                context,
                            );
                        }
                    }

                    let newTop = Math.round(prevPositions[carIndex].top + carRect.top),
                        newLeft = Math.round(prevPositions[carIndex].left + carRect.left);

                    const canMoveTo = (newTop: number, newLeft: number) =>
                        cells.every(
                            ({ top, left }) =>
                                !blockedCells[top + newTop - carRect.top]?.[left + newLeft - carRect.left],
                        );

                    while (true) {
                        const dx = Math.round(targetLeft) - newLeft;
                        const dy = Math.round(targetTop) - newTop;
                        const newLeft2 = newLeft + Math.sign(dx);
                        const newTop2 = newTop + Math.sign(dy);
                        const canMoveX = Math.abs(dx) >= 1 && canMoveTo(newTop, newLeft2);
                        const canMoveY = Math.abs(dy) >= 1 && canMoveTo(newTop2, newLeft);
                        if (!canMoveX && !canMoveY) {
                            break;
                        }

                        if (!canMoveY || (canMoveX && Math.abs(dx) > Math.abs(dy))) {
                            newLeft = newLeft2;
                        } else {
                            newTop = newTop2;
                        }
                    }

                    const dx = targetLeft - newLeft;
                    const dy = targetTop - newTop;
                    const newLeft2 = newLeft + Math.sign(dx);
                    const newTop2 = newTop + Math.sign(dy);
                    let canMoveX = canMoveTo(newTop, newLeft2);
                    let canMoveY = canMoveTo(newTop2, newLeft);
                    if (canMoveX && canMoveY && canMoveTo(newTop2, newLeft2)) {
                        newTop = targetTop;
                        newLeft = targetLeft;
                    } else {
                        if (canMoveX && canMoveY) {
                            if (Math.abs(dx) > Math.abs(dy)) {
                                canMoveY = false;
                            } else {
                                canMoveX = false;
                            }
                        }

                        newLeft += Math.sign(dx) * Math.min(Math.abs(dx), canMoveX ? 1 : carMargin * 2);
                        newTop += Math.sign(dy) * Math.min(Math.abs(dy), canMoveY ? 1 : carMargin * 2);
                    }

                    return {
                        top: newTop - carRect.top,
                        left: newLeft - carRect.left,
                    };
                },
                false,
            ),
        );
    },
    onGestureEnd(props, context) {
        const { gesture } = props;

        const carIndex = getRushHourCarIndexByGesture(context, gesture);
        if (carIndex === undefined) {
            return;
        }

        context.onStateChange(
            rushHourCarStateChangeAction(
                undefined,
                myClientId,
                `gesture-${gesture.id}`,
                carIndex,
                ({ top, left }) => ({
                    top: Math.round(top),
                    left: Math.round(left),
                }),
                true,
            ),
        );
    },
});

const getRushHourCarIndexByGesture = (
    { puzzle }: PuzzleContext<RushHourPTM>,
    { pointers }: GestureInfo<PuzzleContext<RushHourPTM>>,
) => {
    const cars = puzzle.extension.cars ?? [];

    const cells = pointers
        .map(({ start: { extraData } }) => (isCellGestureExtraData(extraData) ? extraData.cell : undefined))
        .filter(Boolean) as Position[];
    if (cells.length < pointers.length) {
        return undefined;
    }

    const matchingCarIndexes = cells.map((cell) => {
        const index = cars.findIndex(({ cells }) => arrayContainsPosition(cells, cell));
        return index >= 0 ? index : undefined;
    });

    // return the car if it's the same for all pointers
    return matchingCarIndexes.every((index) => index === matchingCarIndexes[0]) ? matchingCarIndexes[0] : undefined;
};
