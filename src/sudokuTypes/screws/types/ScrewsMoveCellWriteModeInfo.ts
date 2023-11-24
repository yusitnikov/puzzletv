import {CellWriteModeInfo} from "../../../types/sudoku/CellWriteModeInfo";
import {MoveCellWriteModeInfo} from "../../../types/sudoku/cellWriteModes/move";
import {GestureInfo} from "../../../utils/gestures";
import {isCellGestureExtraData} from "../../../types/sudoku/CellGestureExtraData";
import {LanguageCode} from "../../../types/translations/LanguageCode";
import {myClientId} from "../../../hooks/useMultiPlayer";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {CellWriteMode} from "../../../types/sudoku/CellWriteMode";
import {isPointInRect} from "../../../types/layout/Rect";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";
import {ScrewsPTM} from "./ScrewsPTM";
import {Screw} from "./ScrewsPuzzleExtension";
import {GameStateActionCallback} from "../../../types/sudoku/GameStateAction";
import {fieldStateHistoryAddState} from "../../../types/sudoku/FieldStateHistory";

export const ScrewsMoveCellWriteModeInfo = <T extends AnyPTM>(): CellWriteModeInfo<ScrewsPTM<T>> => {
    const base = MoveCellWriteModeInfo<ScrewsPTM<T>>();

    return {
        title: {
            [LanguageCode.en]: "Move the screws",
            [LanguageCode.ru]: "Двигать шурупы",
        },
        mode: CellWriteMode.move,
        isNoSelectionMode: true,
        digitsCount: 0,
        mainButtonContent: base.mainButtonContent,
        hotKeyStr: base.hotKeyStr,
        isValidGesture: base.isValidGesture,
        onMove(props, context) {
            const {gesture, startMetrics, currentMetrics} = props;
            const {id, state: startContext} = gesture;
            const {puzzle, cellSize} = context;
            const {fieldSize: {rowsCount}} = puzzle;

            if (!puzzle.extension) {
                return;
            }

            const screwIndex = getScrewIndexByGesture(startContext, gesture);
            if (screwIndex === undefined) {
                return;
            }
            const screwRect = (puzzle.extension.screws as Screw<T["cell"]>[])[screwIndex].initialPosition;

            context.onStateChange(screwStateChangeAction(
                startContext,
                myClientId,
                `gesture-${id}`,
                screwIndex,
                (offset) => {
                    let newTop = screwRect.top + offset + (currentMetrics.y - startMetrics.y) / cellSize;
                    newTop = Math.max(0, newTop);
                    newTop = Math.min(rowsCount - screwRect.height, newTop);

                    return newTop - screwRect.top;
                },
                false,
            ));
        },
        onGestureEnd(props, context) {
            const {gesture} = props;

            const carIndex = getScrewIndexByGesture(context, gesture);
            if (carIndex === undefined) {
                return;
            }

            context.onStateChange(screwStateChangeAction(
                undefined,
                myClientId,
                `gesture-${gesture.id}`,
                carIndex,
                Math.round,
                true,
            ));
        },
    };
};

const getScrewIndexByGesture = <T extends AnyPTM>(
    context: PuzzleContext<ScrewsPTM<T>>,
    {pointers, state: startContext = context}: GestureInfo<PuzzleContext<ScrewsPTM<T>>>,
) => {
    const index = ((startContext.puzzle.extension?.screws ?? []) as Screw<T["cell"]>[])
        .map(({initialPosition}) => initialPosition)
        .findIndex((rect, index) => pointers.every(({start: {extraData}}) => {
            if (!isCellGestureExtraData(extraData)) {
                return false;
            }
            const {top, left} = extraData.cell;
            const offset = startContext.processedGameStateExtension.screwOffsets[index];
            const offsetCell = {top: top + 0.5 - offset, left: left + 0.5};
            return isPointInRect(rect, offsetCell);
        }));
    return index < 0 ? undefined : index;
};

export const screwStateChangeAction = <T extends AnyPTM>(
    startContext: PuzzleContext<ScrewsPTM<T>> | undefined,
    clientId: string,
    actionId: string,
    screwIndex: number,
    calculatePosition: (prevOffset: number, allOffsets: number[]) => number,
    animate: boolean,
): GameStateActionCallback<ScrewsPTM<T>> => (context) => {
    const {
        stateExtension: {screws: screwStates},
    } = context;

    const startScrewOffset = startContext?.fieldExtension.screwOffsets;

    return {
        fieldStateHistory: fieldStateHistoryAddState(
            context,
            clientId,
            actionId,
            ({extension: {screwOffsets, ...fieldExtension}, ...fieldState}) => ({
                ...fieldState,
                extension: {
                    ...fieldExtension,
                    screwOffsets: [
                        ...screwOffsets.slice(0, screwIndex),
                        calculatePosition((startScrewOffset ?? screwOffsets)[screwIndex], screwOffsets),
                        ...screwOffsets.slice(screwIndex + 1),
                    ],
                },
            })
        ),
        extension: {
            screws: [
                ...screwStates.slice(0, screwIndex),
                {animating: animate},
                ...screwStates.slice(screwIndex + 1),
            ],
        },
    };
};
