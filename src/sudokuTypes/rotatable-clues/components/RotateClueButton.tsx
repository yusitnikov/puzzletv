import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";
import {ControlButtonItemProps} from "../../../components/sudoku/controls/ControlButtonsManager";
import {useTranslate} from "../../../hooks/useTranslate";
import {useEventListener} from "../../../hooks/useEventListener";
import {ControlButton} from "../../../components/sudoku/controls/ControlButton";
import {RotateLeft, RotateRight} from "@emotion-icons/material";
import {RotatableCluesPTM} from "../types/RotatableCluesPTM";
import {RotatableClue} from "../types/RotatableCluesPuzzleExtension";
import {fieldStateHistoryAddState} from "../../../types/sudoku/FieldStateHistory";
import {myClientId} from "../../../hooks/useMultiPlayer";
import {getNextActionId} from "../../../types/sudoku/GameStateAction";
import {RotatableCluesGameState} from "../types/RotatableCluesGameState";
import {LanguageCode} from "../../../types/translations/LanguageCode";

export const RotateClueButton = <T extends AnyPTM>(direction: number) => function RotateClueButton({context, top, left}: ControlButtonItemProps<RotatableCluesPTM<T>>) {
    const {
        puzzle,
        cellSizeForSidePanel: cellSize,
        state: {selectedCells, isShowingSettings},
        onStateChange,
    } = context;

    const translate = useTranslate();

    const isClockwise = direction > 0;
    const isShift = !isClockwise;

    const clues: RotatableClue[] = puzzle.extension?.clues ?? [];
    const selectedClueIndexes = clues
            .map(({pivot}, index) => ({
                pivot,
                index,
            }))
            .filter(({pivot}) => selectedCells.contains(pivot))
            .map(({index}) => index);

    const handleRotate = () => onStateChange(({fieldStateHistory, extension}) => ({
        fieldStateHistory: fieldStateHistoryAddState(
            puzzle,
            fieldStateHistory,
            myClientId,
            getNextActionId(),
            (fieldState) => ({
                ...fieldState,
                extension: {
                    ...fieldState.extension,
                    clueAngles: fieldState.extension.clueAngles?.map((angle: number, index: number) => {
                        if (!selectedClueIndexes.includes(index)) {
                            return angle;
                        }

                        const {pivot: {top, left}} = clues[index];
                        if (fieldState.cells[top]?.[left]?.usersDigit !== undefined) {
                            return angle;
                        }

                        return angle + direction;
                    })
                },
            })
        ),
        extension: {
            clues: (extension as RotatableCluesGameState).clues.map(({animating}, index) => ({
                animating: animating || selectedClueIndexes.includes(index),
            })),
        },
    }));

    useEventListener(window, "keydown", (ev) => {
        if (!isShowingSettings && ev.shiftKey === isShift && ev.code === "KeyR") {
            handleRotate();
            ev.preventDefault();
        }
    });

    return <ControlButton
        left={left}
        top={top}
        cellSize={cellSize}
        disabled={selectedClueIndexes.length === 0}
        onClick={handleRotate}
        title={`${translate({
            [LanguageCode.en]: "Rotate the clue",
            [LanguageCode.ru]: "Повернуть",
        })} (${translate("shortcut")}: ${isShift ? "Shift+" : ""}R)`}
    >
        {isClockwise ? <RotateRight/> : <RotateLeft/>}
    </ControlButton>;
};
