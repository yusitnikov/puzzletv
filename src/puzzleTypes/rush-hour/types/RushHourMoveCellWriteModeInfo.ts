import { CellWriteModeInfo } from "../../../types/puzzle/CellWriteModeInfo";
import { MoveCellWriteModeInfo } from "../../../types/puzzle/cellWriteModes/move";
import { rushHourCarStateChangeAction } from "./RushHourGameCarState";
import { GestureInfo } from "../../../utils/gestures";
import { isCellGestureExtraData } from "../../../types/puzzle/CellGestureExtraData";
import { RushHourPTM } from "./RushHourPTM";
import { LanguageCode } from "../../../types/translations/LanguageCode";
import { myClientId } from "../../../hooks/useMultiPlayer";
import { arrayContainsPosition, Position } from "../../../types/layout/Position";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";
import { CellWriteMode } from "../../../types/puzzle/CellWriteMode";
import { Rect } from "../../../types/layout/Rect";
import { carMargin } from "../components/RushHourCar";
import { processCellsMaps } from "../../../types/puzzle/CellsMap";

const base = MoveCellWriteModeInfo<RushHourPTM>();

export const RushHourMoveCellWriteModeInfo = (
    restrictCarCoords?: (car: Rect, isVertical: boolean, context: PuzzleContext<RushHourPTM>) => number,
): CellWriteModeInfo<RushHourPTM> => ({
    title: {
        [LanguageCode.en]: "Move the cars",
        [LanguageCode.ru]: "Двигать машины",
    },
    mode: CellWriteMode.move,
    isNoSelectionMode: true,
    digitsCount: 0,
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

        if (!puzzle.extension) {
            return;
        }

        const carIndex = getRushHourCarIndexByGesture(startContext, gesture);
        if (carIndex === undefined) {
            return;
        }
        const carRects = puzzle.extension.cars.map(({ boundingRect }) => boundingRect);
        const carRect = carRects[carIndex];
        const isVertical = carRect.height > carRect.width;

        context.onStateChange(
            rushHourCarStateChangeAction(
                startContext,
                myClientId,
                `gesture-${id}`,
                carIndex,
                ({ top, left }, prevPositions) => {
                    const offsetRects = carRects.map(
                        ({ top, left, width, height }, index): Rect => ({
                            top: top + prevPositions[index].top,
                            left: left + prevPositions[index].left,
                            width,
                            height,
                        }),
                    );
                    offsetRects.splice(carIndex, 1);

                    if (givenDigitsBlockCars) {
                        processCellsMaps(
                            ([digit], position) => {
                                offsetRects.push({
                                    ...position,
                                    width: 1,
                                    height: 1,
                                });
                            },
                            [puzzle.initialDigits ?? {}],
                        );
                    }

                    const offsetTop = top + carRect.top;
                    const offsetLeft = left + carRect.left;

                    if (isVertical) {
                        let newTop = offsetTop + (currentMetrics.y - startMetrics.y) / cellSize;
                        newTop = Math.max(-carMargin, newTop);
                        newTop = Math.min(gridSize + carMargin - carRect.height, newTop);

                        if (restrictCarCoords) {
                            newTop = restrictCarCoords(
                                {
                                    ...carRect,
                                    top: newTop,
                                    left: offsetLeft,
                                },
                                isVertical,
                                context,
                            );
                        }

                        for (const offsetRect of offsetRects) {
                            if (
                                offsetRect.left + offsetRect.width > offsetLeft &&
                                offsetRect.left < offsetLeft + carRect.width
                            ) {
                                if (offsetRect.top < offsetTop) {
                                    newTop = Math.max(offsetRect.top + offsetRect.height - carMargin * 2, newTop);
                                } else {
                                    newTop = Math.min(offsetRect.top + carMargin * 2 - carRect.height, newTop);
                                }
                            }
                        }

                        return {
                            top: newTop - carRect.top,
                            left,
                        };
                    } else {
                        let newLeft = offsetLeft + (currentMetrics.x - startMetrics.x) / cellSize;
                        newLeft = Math.max(-carMargin, newLeft);
                        newLeft = Math.min(gridSize + carMargin - carRect.width, newLeft);

                        if (restrictCarCoords) {
                            newLeft = restrictCarCoords(
                                {
                                    ...carRect,
                                    top: offsetTop,
                                    left: newLeft,
                                },
                                isVertical,
                                context,
                            );
                        }

                        for (const offsetRect of offsetRects) {
                            if (
                                offsetRect.top + offsetRect.height > offsetTop &&
                                offsetRect.top < offsetTop + carRect.height
                            ) {
                                if (offsetRect.left < offsetLeft) {
                                    newLeft = Math.max(offsetRect.left + offsetRect.width - carMargin * 2, newLeft);
                                } else {
                                    newLeft = Math.min(offsetRect.left + carMargin * 2 - carRect.width, newLeft);
                                }
                            }
                        }

                        return {
                            top,
                            left: newLeft - carRect.left,
                        };
                    }
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
    { puzzle, puzzleIndex }: PuzzleContext<RushHourPTM>,
    { pointers }: GestureInfo<PuzzleContext<RushHourPTM>>,
) => {
    const cars = puzzle.extension?.cars ?? [];

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
