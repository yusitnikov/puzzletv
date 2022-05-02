import {Absolute} from "../../layout/absolute/Absolute";
import {emptyRect, Rect} from "../../../types/layout/Rect";
import {ControlButton, controlButtonPaddingCoeff} from "./ControlButton";
import {indexes} from "../../../utils/indexes";
import {Check, Clear, Fullscreen, FullscreenExit, Redo, Settings, Undo} from "@emotion-icons/material";
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
import {useEffect, useMemo, useState} from "react";
import {Modal} from "../../layout/modal/Modal";
import {Button} from "../../layout/button/Button";
import {globalPaddingCoeff} from "../../app/globals";
import {SettingsContent} from "./SettingsContent";

export const controlsWidthCoeff = 5 + controlButtonPaddingCoeff * 4;

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
        puzzle,
        state,
        onStateChange,
    } = otherProps;

    const {
        typeManager,
        resultChecker,
        fieldSize: {fieldSize},
        digitsCount = Math.min(typeManager.maxDigitsCount || fieldSize, fieldSize),
    } = puzzle;

    const translate = useTranslate();

    const {
        createCellDataByDisplayDigit,
        mainControlsComponent: MainControls,
        digitShortcuts = [],
        digitShortcutTips = [],
    } = typeManager;

    const {
        isReady,
        persistentCellWriteMode,
        cellWriteMode,
        autoCheckOnFinish,
    } = state;

    const [isShowingResult, setIsShowingResult] = useState(false);
    const isCorrectResult = useMemo(() => resultChecker?.(state), [resultChecker, state]);

    useEffect(() => {
        if (autoCheckOnFinish && resultChecker && isCorrectResult) {
            setIsShowingResult(true);
        }
    }, [autoCheckOnFinish, resultChecker, isCorrectResult, setIsShowingResult]);

    const isColorMode = cellWriteMode === CellWriteMode.color;
    const digitsCountInCurrentMode = isColorMode ? 9 : digitsCount;

    const isFullScreen = useIsFullScreen();

    const [isShowingSettings, setIsShowingSettings] = useState(false);

    // region Event handlers
    const handleSetCellWriteMode = (persistentCellWriteMode: CellWriteMode) => onStateChange({persistentCellWriteMode} as any);

    const handleDigit = (digit: number) => isReady && onStateChange(gameState => gameStateHandleDigit(typeManager, gameState, digit));

    const handleClear = () => onStateChange(gameState => gameStateClearSelectedCellsContent(typeManager, gameState));

    const handleUndo = () => onStateChange(gameStateUndo);

    const handleRedo = () => onStateChange(gameStateRedo);

    const handleCheckResult = () => setIsShowingResult(true);
    const handleCloseCheckResult = () => setIsShowingResult(false);

    const handleOpenSettings = () => setIsShowingSettings(true);
    const handleCloseSettings = () => setIsShowingSettings(false);
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
        {isReady && <>
            {indexes(digitsCountInCurrentMode).map(index => {
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
                        puzzle={puzzle}
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
                left={0}
                top={3}
                cellSize={cellSize}
                onClick={handleUndo}
                title={`${translate("Undo the last action")} (${translate("shortcut")}: Ctrl+Z)`}
            >
                <Undo/>
            </ControlButton>

            <ControlButton
                left={1}
                top={3}
                cellSize={cellSize}
                onClick={handleRedo}
                title={`${translate("Redo the last action")} (${translate("shortcut")}: Ctrl+Y)`}
            >
                <Redo/>
            </ControlButton>

            <ControlButton
                left={2}
                top={3}
                cellSize={cellSize}
                onClick={handleClear}
                title={`${translate("Clear the cell contents")} (${translate("shortcut")}: Delete ${translate("or")} Backspace)`}
            >
                <Clear/>
            </ControlButton>
        </>}

        {MainControls && <MainControls rect={emptyRect} {...otherProps}/>}

        {/*region: Cell write mode*/}
        <ControlButton
            left={3}
            top={0}
            cellSize={cellSize}
            innerBorderWidth={1}
            checked={cellWriteMode === CellWriteMode.main}
            onClick={() => handleSetCellWriteMode(CellWriteMode.main)}
        >
            {contentSize => <CellDigits
                puzzle={puzzle}
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
                puzzle={puzzle}
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
                puzzle={puzzle}
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
        {/*endregion*/}

        <ControlButton
            left={isHorizontal ? 4 : 0}
            top={isHorizontal ? 0 : 4}
            cellSize={cellSize}
            onClick={toggleFullScreen}
            fullSize={true}
            title={translate(isFullScreen ? "Exit full screen mode" : "Enter full screen mode")}
        >
            {isFullScreen ? <FullscreenExit/> : <Fullscreen/>}
        </ControlButton>

        <ControlButton
            left={isHorizontal ? 4 : 1}
            top={isHorizontal ? 1 : 4}
            cellSize={cellSize}
            onClick={handleOpenSettings}
            title={translate(isFullScreen ? "Exit full screen mode" : "Enter full screen mode")}
        >
            <Settings/>
        </ControlButton>
        {isShowingSettings && <Modal cellSize={cellSize} onClose={handleCloseSettings}>
            <div>
                <SettingsContent
                    cellSize={cellSize}
                    state={state}
                    onStateChange={onStateChange}
                />
            </div>
            <div>
                <Button
                    type={"button"}
                    cellSize={cellSize}
                    onClick={handleCloseSettings}
                    style={{
                        marginTop: cellSize * globalPaddingCoeff,
                        padding: "0.5em 1em",
                    }}
                >
                    OK
                </Button>
            </div>
        </Modal>}

        {resultChecker && <ControlButton
            left={isHorizontal ? 4 : 2}
            top={isHorizontal ? 2 : 4}
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
    </Absolute>;
};
