import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { ControlButtonItemProps } from "../../../components/puzzle/controls/ControlButtonsManager";
import { useEventListener } from "../../../hooks/useEventListener";
import { ControlButton } from "../../../components/puzzle/controls/ControlButton";
import { RotateLeft, RotateRight } from "@emotion-icons/material";
import { RotatableCluesPTM } from "../types/RotatableCluesPTM";
import { RotatableClue } from "../types/RotatableCluesPuzzleExtension";
import { gridStateHistoryAddState } from "../../../types/puzzle/GridStateHistory";
import { myClientId } from "../../../hooks/useMultiPlayer";
import { getNextActionId } from "../../../types/puzzle/GameStateAction";
import { RotatableCluesGameState } from "../types/RotatableCluesGameState";
import { LanguageCode } from "../../../types/translations/LanguageCode";
import { observer } from "mobx-react-lite";
import { settings } from "../../../types/layout/Settings";
import { profiler } from "../../../utils/profiler";
import { translate } from "../../../utils/translate";

export const RotateClueButton = <T extends AnyPTM>(direction: number) =>
    observer(function RotateClueButton({ context, top, left }: ControlButtonItemProps<RotatableCluesPTM<T>>) {
        profiler.trace();

        const { puzzle, cellSizeForSidePanel: cellSize } = context;

        const isClockwise = direction > 0;
        const isShift = !isClockwise;

        const clues: RotatableClue[] = puzzle.extension.clues ?? [];
        const freeRotation = puzzle.importOptions?.freeRotation;
        const selectedClueIndexes = clues
            .map(({ pivot }, index) => ({
                pivot,
                index,
            }))
            .filter(
                ({ pivot }) =>
                    context.isSelectedCell(pivot.top, pivot.left) &&
                    (freeRotation || context.getCellData(pivot.top, pivot.left) === undefined),
            )
            .map(({ index }) => index);

        const handleRotate = () =>
            context.onStateChange((context) => ({
                gridStateHistory: gridStateHistoryAddState(context, myClientId, getNextActionId(), (gridState) => ({
                    ...gridState,
                    extension: {
                        ...gridState.extension,
                        clueAngles: gridState.extension.clueAngles?.map((angle: number, index: number) => {
                            if (!selectedClueIndexes.includes(index)) {
                                return angle;
                            }

                            const clueCoeff = context.puzzle.extension.clues?.[index]?.coeff ?? 1;
                            return angle + direction * Math.sign(clueCoeff);
                        }),
                    },
                })),
                extension: {
                    clues: (context.stateExtension as RotatableCluesGameState).clues.map(({ animating }, index) => ({
                        animating: animating || selectedClueIndexes.includes(index),
                    })),
                },
            }));

        useEventListener(window, "keydown", (ev) => {
            if (!settings.isOpened && ev.shiftKey === isShift && ev.code === "KeyR") {
                handleRotate();
                ev.preventDefault();
            }
        });

        return (
            <ControlButton
                left={left}
                top={top}
                cellSize={cellSize}
                disabled={selectedClueIndexes.length === 0}
                onClick={handleRotate}
                title={`${translate({
                    [LanguageCode.en]: "Rotate the clue",
                    [LanguageCode.ru]: "Повернуть",
                    [LanguageCode.de]: "Drehen Sie den Hinweis",
                })} (${translate("shortcut")}: ${isShift ? "Shift+" : ""}R)`}
            >
                {isClockwise ? <RotateRight /> : <RotateLeft />}
            </ControlButton>
        );
    });
