import {Absolute} from "../../layout/absolute/Absolute";
import {emptyRect, Rect} from "../../../types/layout/Rect";
import {ControlButton, controlButtonPaddingCoeff} from "./ControlButton";
import {indexes} from "../../../utils/indexes";
import {Check, Clear, Fullscreen, FullscreenExit, Redo, Undo} from "@emotion-icons/material";
import {CellContent} from "../cell/CellContent";
import {CellWriteMode} from "../../../types/sudoku/CellWriteMode";
import {Set} from "../../../types/struct/Set";
import {CellBackground} from "../cell/CellBackground";
import {CellDigits} from "../cell/CellDigits";
import {
    gameStateClearSelectedCellsContent,
    gameStateHandleDigit,
    gameStateRedo,
    gameStateUndo,
    ProcessedGameState
} from "../../../types/sudoku/GameState";
import {MergeStateAction} from "../../../types/react/MergeStateAction";
import {toggleFullScreen} from "../../../utils/fullScreen";
import {useIsFullScreen} from "../../../hooks/useIsFullScreen";
import {useEventListener} from "../../../hooks/useEventListener";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {useTranslate} from "../../../contexts/LanguageCodeContext";
import {useMemo, useState} from "react";
import {Modal} from "../../layout/modal/Modal";
import {Button} from "../../layout/button/Button";
import {globalPaddingCoeff} from "../../app/globals";

export const controlsWidthCoeff = 4 + controlButtonPaddingCoeff * 3;
export const controlsHeightCoeff = 5 + controlButtonPaddingCoeff * 4;

export interface ControlsProps<CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}> {
    rect: Rect;
    cellSize: number;
    isHorizontal: boolean;
    puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>;
    state: ProcessedGameState<CellType> & ProcessedGameStateExtensionType;
    onStateChange: (state: MergeStateAction<ProcessedGameState<CellType> & ProcessedGameStateExtensionType>) => void;
}

export const Controls = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    {rect, ...otherProps}: ControlsProps<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
) => {
    const {
        cellSize,
        isHorizontal,
        puzzle: {
            typeManager,
            resultChecker,
            fieldSize: {fieldSize},
            digitsCount = Math.min(typeManager.maxDigitsCount || fieldSize, fieldSize),
        },
        state,
        onStateChange,
    } = otherProps;

    const translate = useTranslate();

    const {
        createCellDataByDisplayDigit,
        mainControlsCount = 0,
        mainControlsComponent: MainControls,
        secondaryControlsCount = 0,
        secondaryControlsComponent: SecondaryControls,
        digitShortcuts = [],
        digitShortcutTips = [],
    } = typeManager;

    const {
        isReady,
        persistentCellWriteMode,
        cellWriteMode,
    } = state;

    const [isShowingResult, setIsShowingResult] = useState(false);
    const isCorrectResult = useMemo(() => resultChecker?.(state), [resultChecker, state]);

    const isColorMode = cellWriteMode === CellWriteMode.color;
    const digitsCountInCurrentMode = isColorMode ? 9 : digitsCount;

    const isFullScreen = useIsFullScreen();

    // region Event handlers
    const handleSetCellWriteMode = (persistentCellWriteMode: CellWriteMode) => onStateChange({persistentCellWriteMode} as any);

    const handleDigit = (digit: number) => isReady && onStateChange(gameState => gameStateHandleDigit(typeManager, gameState, digit));

    const handleClear = () => onStateChange(gameState => gameStateClearSelectedCellsContent(typeManager, gameState));

    const handleUndo = () => onStateChange(gameStateUndo);

    const handleRedo = () => onStateChange(gameStateRedo);

    const handleCheckResult = () => setIsShowingResult(true);
    const handleCloseCheckResult = () => setIsShowingResult(false);
    // endregion

    useEventListener(window, "keydown", (ev: KeyboardEvent) => {
        const {code, ctrlKey, shiftKey} = ev;

        if (isReady) {
            for (const index of indexes(digitsCountInCurrentMode)) {
                const digit = index + 1;
                const shortcut = !isColorMode && digitShortcuts[index];
                if (
                    code === `Digit${digit}` ||
                    code === `Numpad${digit}` ||
                    (shortcut && code === `Key${shortcut}`)
                ) {
                    handleDigit(digit);
                    ev.preventDefault();
                }
            }
        }

        switch (code) {
            case "Delete":
            case "Backspace":
                handleClear();
                ev.preventDefault();
                break;
            case "KeyZ":
                if (ctrlKey) {
                    if (shiftKey) {
                        handleRedo();
                        ev.preventDefault();
                    } else {
                        handleUndo();
                        ev.preventDefault();
                    }
                }
                break;
            case "KeyY":
                if (ctrlKey && !shiftKey) {
                    handleRedo();
                    ev.preventDefault();
                }
                break;
            case "PageUp":
                handleSetCellWriteMode((persistentCellWriteMode + 3) % 4);
                ev.preventDefault();
                break;
            case "PageDown":
                handleSetCellWriteMode((persistentCellWriteMode + 1) % 4);
                ev.preventDefault();
                break;
        }
    });

    return <Absolute {...rect}>
        {isReady && indexes(digitsCountInCurrentMode).map(index => {
            const digit = index + 1;
            const cellData = createCellDataByDisplayDigit(digit, state);
            const shortcut = !isColorMode && digitShortcuts[index];
            const shortcutTip = !isColorMode && digitShortcutTips[index];

            let title = `${translate("Shortcut")}: ${digit}`;
            if (shortcut) {
                title = `${title} ${translate("or")} ${shortcut}`;
            }
            if (shortcutTip) {
                title = `${title} (${translate(shortcutTip)})`;
            }

            return <ControlButton
                key={`digit-${digit}`}
                left={index % 3}
                top={(index - index % 3) / 3}
                cellSize={cellSize}
                fullSize={true}
                opacityOnHover={isColorMode}
                onClick={() => handleDigit(digit)}
                title={title}
            >
                <CellContent
                    typeManager={typeManager}
                    data={{
                        usersDigit: cellWriteMode === CellWriteMode.main ? cellData : undefined,
                        cornerDigits: new Set(cellWriteMode === CellWriteMode.corner ? [cellData] : []),
                        centerDigits: new Set(cellWriteMode === CellWriteMode.center ? [cellData] : []),
                        colors: new Set(cellWriteMode === CellWriteMode.color ? [index] : []),
                    }}
                    size={cellSize}
                />
            </ControlButton>;
        })}

        <ControlButton
            left={3}
            top={0}
            cellSize={cellSize}
            innerBorderWidth={1}
            checked={cellWriteMode === CellWriteMode.main}
            onClick={() => handleSetCellWriteMode(CellWriteMode.main)}
        >
            {contentSize => <CellDigits
                typeManager={typeManager}
                data={{usersDigit: createCellDataByDisplayDigit(digitsCount, state)}}
                size={contentSize}
                mainColor={true}
            />}
        </ControlButton>

        <ControlButton
            left={3}
            top={1}
            cellSize={cellSize}
            innerBorderWidth={1}
            checked={cellWriteMode === CellWriteMode.corner}
            onClick={() => handleSetCellWriteMode(CellWriteMode.corner)}
            title={`${translate("Corner")} (${translate("shortcut")}: Shift)`}
        >
            {contentSize => <CellDigits
                typeManager={typeManager}
                data={{cornerDigits: new Set([1, 2, 3].map(digit => createCellDataByDisplayDigit(digit, state)))}}
                size={contentSize}
                mainColor={true}
            />}
        </ControlButton>

        <ControlButton
            left={3}
            top={2}
            cellSize={cellSize}
            innerBorderWidth={1}
            checked={cellWriteMode === CellWriteMode.center}
            onClick={() => handleSetCellWriteMode(CellWriteMode.center)}
            title={`${translate("Center")} (${translate("shortcut")}: Ctrl)`}
        >
            {contentSize => <CellDigits
                typeManager={typeManager}
                data={{centerDigits: new Set([1, 2].map(digit => createCellDataByDisplayDigit(digit, state)))}}
                size={contentSize}
                mainColor={true}
            />}
        </ControlButton>

        <ControlButton
            left={3}
            top={3}
            cellSize={cellSize}
            innerBorderWidth={1}
            checked={cellWriteMode === CellWriteMode.color}
            onClick={() => handleSetCellWriteMode(CellWriteMode.color)}
            title={`${translate("Colors")} (${translate("shortcut")}: Ctrl+Shift)`}
        >
            {contentSize => <CellBackground
                colors={new Set(indexes(9))}
                size={contentSize}
            />}
        </ControlButton>

        <ControlButton
            left={mainControlsCount}
            width={3 - mainControlsCount}
            top={3}
            cellSize={cellSize}
            onClick={handleClear}
            title={`${translate("Clear the cell contents")} (${translate("shortcut")}: Delete ${translate("or")} Backspace)`}
        >
            <Clear/>
        </ControlButton>

        {MainControls && <MainControls rect={emptyRect} {...otherProps}/>}

        <Absolute
            left={isHorizontal ? 0 : rect.width - cellSize}
            top={isHorizontal ? rect.height - cellSize : 0}
            width={isHorizontal ? rect.width : cellSize}
            height={isHorizontal ? cellSize : rect.height}
        >
            {SecondaryControls && <SecondaryControls rect={emptyRect} {...otherProps}/>}

            <ControlButton
                left={secondaryControlsCount}
                top={0}
                flipDirection={!isHorizontal}
                cellSize={cellSize}
                onClick={handleUndo}
                title={`${translate("Undo the last action")} (${translate("shortcut")}: Ctrl+Z)`}
            >
                <Undo/>
            </ControlButton>

            <ControlButton
                left={secondaryControlsCount + 1}
                top={0}
                flipDirection={!isHorizontal}
                cellSize={cellSize}
                onClick={handleRedo}
                title={`${translate("Redo the last action")} (${translate("shortcut")}: Ctrl+Y)`}
            >
                <Redo/>
            </ControlButton>

            {resultChecker && secondaryControlsCount === 0 && <ControlButton
                left={secondaryControlsCount + 2}
                top={0}
                flipDirection={!isHorizontal}
                cellSize={cellSize}
                onClick={handleCheckResult}
                title={`${translate("Check the result")}`}
            >
                <Check/>
            </ControlButton>}
            {isShowingResult && <Modal cellSize={cellSize} onClose={handleCloseCheckResult}>
                <div>
                    {isCorrectResult ? `${translate("Absolutely right")}!` : `${translate("Something's wrong here")}...`}
                </div>
                <div>
                    <Button
                        type={"button"}
                        cellSize={cellSize}
                        onClick={handleCloseCheckResult}
                        autoFocus={true}
                        style={{
                            marginTop: cellSize * globalPaddingCoeff,
                            padding: "0.5em 1em",
                        }}
                    >
                        OK
                    </Button>
                </div>
            </Modal>}

            <ControlButton
                left={3}
                top={0}
                flipDirection={!isHorizontal}
                cellSize={cellSize}
                onClick={toggleFullScreen}
                fullSize={true}
                title={translate(isFullScreen ? "Exit full screen mode" : "Enter full screen mode")}
            >
                {isFullScreen ? <FullscreenExit/> : <Fullscreen/>}
            </ControlButton>
        </Absolute>
    </Absolute>;
};
