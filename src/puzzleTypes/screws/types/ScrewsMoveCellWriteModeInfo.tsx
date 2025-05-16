import { CellWriteModeInfo } from "../../../types/puzzle/CellWriteModeInfo";
import { MoveCellWriteModeInfo } from "../../../types/puzzle/cellWriteModes/move";
import { GestureInfo } from "../../../utils/gestures";
import { isCellGestureExtraData } from "../../../types/puzzle/CellGestureExtraData";
import { LanguageCode } from "../../../types/translations/LanguageCode";
import { myClientId } from "../../../hooks/useMultiPlayer";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";
import { CellWriteMode } from "../../../types/puzzle/CellWriteMode";
import { isPointInRect } from "../../../types/layout/Rect";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { ScrewsPTM } from "./ScrewsPTM";
import { Screw } from "./ScrewsPuzzleExtension";
import { GameStateActionCallback } from "../../../types/puzzle/GameStateAction";
import { gridStateHistoryAddState } from "../../../types/puzzle/GridStateHistory";
import {
    ControlButtonItemProps,
    ControlButtonItemPropsGenericFc,
} from "../../../components/puzzle/controls/ControlButtonsManager";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../utils/profiler";
import { CellWriteModeButton } from "../../../components/puzzle/controls/CellWriteModeButton";
import { AutoSvg } from "../../../components/svg/auto-svg/AutoSvg";
import { textColor } from "../../../components/app/globals";
import { ScrewByData } from "../constraints/Screw";
import { translate } from "../../../utils/translate";
import { getAnimatedScrewOffset } from "./ScrewsTypeManager";

const ScrewsMoveButton: ControlButtonItemPropsGenericFc = observer(function ScrewsMoveButton<T extends AnyPTM>({
    context,
    top,
    left,
    info,
}: ControlButtonItemProps<T>) {
    profiler.trace();

    return (
        <>
            <CellWriteModeButton
                top={top}
                left={left}
                cellWriteMode={CellWriteMode.move}
                data={(size) => (
                    <AutoSvg
                        width={size}
                        height={size}
                        viewBox={{
                            top: -1.1,
                            left: -1.1,
                            width: 2.2,
                            height: 2.2,
                        }}
                    >
                        <line x1={-0.6} y1={-1} x2={-0.6} y2={1} stroke={textColor} strokeWidth={0.15} />
                        <polyline points={"-0.3,-0.7 -0.6,-1 -0.9,-0.7"} stroke={textColor} strokeWidth={0.15} />
                        <polyline points={"-0.3,0.7 -0.6,1 -0.9,0.7"} stroke={textColor} strokeWidth={0.15} />
                        <g transform={"scale(0.55)"}>
                            <ScrewByData
                                context={context}
                                position={{ top: -2, left: -0.2, width: 2, height: 4 }}
                                digits={[]}
                                offset={0}
                            />
                        </g>
                    </AutoSvg>
                )}
                noBorders={true}
                title={`${translate(info?.title!)} (${translate("shortcut")}: ${info!.hotKeyStr})`}
                context={context}
            />
        </>
    );
});

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
        mainButtonContent: ScrewsMoveButton,
        hotKeyStr: base.hotKeyStr,
        isValidGesture: base.isValidGesture,
        onMove(props, context) {
            const { gesture, startMetrics, currentMetrics } = props;
            const { id, state: startContext } = gesture;
            const { puzzle, cellSize } = context;
            const {
                gridSize: { rowsCount },
            } = puzzle;

            if (!puzzle.extension.screws) {
                return;
            }

            const screwIndex = getScrewIndexByGesture(startContext, gesture);
            if (screwIndex === undefined) {
                return;
            }
            const screwRect = (puzzle.extension.screws as Screw<T["cell"]>[])[screwIndex].initialPosition;

            context.onStateChange(
                screwStateChangeAction(
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
                ),
            );
        },
        onGestureEnd(props, context) {
            const { gesture } = props;

            const carIndex = getScrewIndexByGesture(context, gesture);
            if (carIndex === undefined) {
                return;
            }

            context.onStateChange(
                screwStateChangeAction(undefined, myClientId, `gesture-${gesture.id}`, carIndex, Math.round, true),
            );
        },
    };
};

const getScrewIndexByGesture = <T extends AnyPTM>(
    context: PuzzleContext<ScrewsPTM<T>>,
    { pointers, state: startContext = context }: GestureInfo<PuzzleContext<ScrewsPTM<T>>>,
) => {
    const index = ((startContext.puzzle.extension.screws ?? []) as Screw<T["cell"]>[])
        .map(({ initialPosition }) => initialPosition)
        .findIndex((rect, index) =>
            pointers.every(({ start: { extraData } }) => {
                if (!isCellGestureExtraData(extraData)) {
                    return false;
                }
                const { top, left } = extraData.cell;
                const offset = getAnimatedScrewOffset(startContext, index);
                const offsetCell = { top: top + 0.5 - offset, left: left + 0.5 };
                return isPointInRect(rect, offsetCell);
            }),
        );
    return index < 0 ? undefined : index;
};

export const screwStateChangeAction =
    <T extends AnyPTM>(
        startContext: PuzzleContext<ScrewsPTM<T>> | undefined,
        clientId: string,
        actionId: string,
        screwIndex: number,
        calculatePosition: (prevOffset: number, allOffsets: number[]) => number,
        animate: boolean,
    ): GameStateActionCallback<ScrewsPTM<T>> =>
    (context) => {
        const {
            stateExtension: { screws: screwStates },
        } = context;

        const startScrewOffset = startContext?.gridExtension.screwOffsets;

        return {
            gridStateHistory: gridStateHistoryAddState(
                context,
                clientId,
                actionId,
                ({ extension: { screwOffsets, ...fieldExtension }, ...gridState }) => ({
                    ...gridState,
                    extension: {
                        ...fieldExtension,
                        screwOffsets: [
                            ...screwOffsets.slice(0, screwIndex),
                            calculatePosition((startScrewOffset ?? screwOffsets)[screwIndex], screwOffsets),
                            ...screwOffsets.slice(screwIndex + 1),
                        ],
                    },
                }),
            ),
            extension: {
                screws: [
                    ...screwStates.slice(0, screwIndex),
                    { ...screwStates[screwIndex], animating: animate },
                    ...screwStates.slice(screwIndex + 1),
                ],
            },
        };
    };
