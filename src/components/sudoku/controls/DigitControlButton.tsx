import {useTranslate} from "../../../contexts/LanguageCodeContext";
import {CellWriteMode} from "../../../types/sudoku/CellWriteMode";
import {useCallback} from "react";
import {useEventListener} from "../../../hooks/useEventListener";
import {ControlButton} from "./ControlButton";
import {CellContent} from "../cell/CellContent";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {enterDigitAction} from "../../../types/sudoku/GameStateAction";

export interface DigitControlButtonProps<CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}> {
    index: number;
    context: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>;
}

export const DigitControlButton = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    {index, context}: DigitControlButtonProps<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
) => {
    const translate = useTranslate();

    const {puzzle, state, onStateChange, cellSize} = context;

    const {
        typeManager,
    } = puzzle;

    const {
        createCellDataByDisplayDigit,
        digitShortcuts = [],
        digitShortcutTips = [],
    } = typeManager;

    const {
        cellWriteMode,
        cellWriteModeInfo: {isDigitMode, buttonContent: ButtonContent},
        isShowingSettings,
    } = state;

    const digit = index + 1;
    const cellData = createCellDataByDisplayDigit(digit, state);
    const shortcut = isDigitMode && digitShortcuts[index];
    const shortcutTip = isDigitMode && digitShortcutTips[index];

    let title = `${translate("Shortcut")}: ${digit}`;
    if (shortcut) {
        title = `${title} ${translate("or")} ${shortcut}`;
    }
    if (shortcutTip) {
        title = `${title} (${translate(shortcutTip)})`;
    }

    const handleDigit = useCallback(
        () => onStateChange(enterDigitAction(digit, context)),
        [onStateChange, digit, context]
    );

    useEventListener(window, "keydown", (ev: KeyboardEvent) => {
        if (isShowingSettings) {
            return;
        }

        const {code} = ev;

        if (
            code === `Digit${digit}` ||
            code === `Numpad${digit}` ||
            (shortcut && code === `Key${shortcut}`)
        ) {
            handleDigit();
            ev.preventDefault();
        }
    });

    return <ControlButton
        left={index % 3}
        top={(index - index % 3) / 3}
        cellSize={cellSize}
        fullSize={true}
        opacityOnHover={cellWriteMode === CellWriteMode.color}
        onClick={handleDigit}
        title={title}
    >
        {ButtonContent?.(context, cellData, cellSize, index) || <CellContent
            context={context}
            data={{usersDigit: cellData}}
            size={cellSize}
        />}
    </ControlButton>;
};
