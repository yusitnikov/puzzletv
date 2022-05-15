import {Absolute} from "../../layout/absolute/Absolute";
import {emptyRect, Rect} from "../../../types/layout/Rect";
import {ControlButton, controlButtonPaddingCoeff} from "./ControlButton";
import {indexes} from "../../../utils/indexes";
import {
    Check,
    Clear,
    Fullscreen,
    FullscreenExit,
    Redo,
    Settings,
    Undo
} from "@emotion-icons/material";
import {CellWriteMode, incrementCellWriteMode} from "../../../types/sudoku/CellWriteMode";
import {Set} from "../../../types/struct/Set";
import {
    gameStateClearSelectedCellsContent,
    gameStateRedo,
    gameStateUndo
} from "../../../types/sudoku/GameState";
import {toggleFullScreen} from "../../../utils/fullScreen";
import {useIsFullScreen} from "../../../hooks/useIsFullScreen";
import {useEventListener} from "../../../hooks/useEventListener";
import {useTranslate} from "../../../contexts/LanguageCodeContext";
import {useCallback, useEffect, useMemo, useState} from "react";
import {Modal} from "../../layout/modal/Modal";
import {Button} from "../../layout/button/Button";
import {globalPaddingCoeff, textColor} from "../../app/globals";
import {SettingsContent} from "./SettingsContent";
import {DigitControlButton} from "./DigitControlButton";
import {CellWriteModeButton} from "./CellWriteModeButton";
import {AutoSvg} from "../../svg/auto-svg/AutoSvg";
import {UserLinesByData} from "../constraints/user-lines/UserLines";
import {useAllowLmd} from "../../../contexts/AllowLmdContext";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";

export const controlsWidthCoeff = 5 + controlButtonPaddingCoeff * 4;

export interface ControlsProps<CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}> {
    rect: Rect;
    isHorizontal: boolean;
    context: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>;
}

export const Controls = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    {rect, isHorizontal, context}: ControlsProps<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
) => {
    const {
        cellSize,
        puzzle,
        state,
        onStateChange,
    } = context;

    const {
        typeManager,
        resultChecker,
        getLmdSolutionCode,
        fieldSize: {fieldSize},
        digitsCount = Math.min(typeManager.maxDigitsCount || fieldSize, fieldSize),
        allowDrawingBorders = false,
        loopHorizontally = false,
        loopVertically = false,
        enableDragMode = false,
    } = puzzle;

    const allowDragging = loopHorizontally || loopVertically || enableDragMode;

    const translate = useTranslate();

    const {
        createCellDataByDisplayDigit,
        mainControlsComponent: MainControls,
    } = typeManager;

    const {
        isReady,
        persistentCellWriteMode,
        cellWriteMode,
        autoCheckOnFinish,
    } = state;

    const [isShowingResult, setIsShowingResult] = useState(false);
    const isCorrectResult = useMemo(() => resultChecker?.(puzzle, state), [resultChecker, puzzle, state]);
    const lmdSolutionCode = useMemo(() => getLmdSolutionCode?.(puzzle, state), [getLmdSolutionCode, puzzle, state]);

    const isLmdAllowed = useAllowLmd();

    useEffect(() => {
        if (autoCheckOnFinish && resultChecker && isCorrectResult) {
            setIsShowingResult(true);
        }
    }, [autoCheckOnFinish, resultChecker, isCorrectResult, setIsShowingResult]);

    let digitsCountInCurrentMode = digitsCount;
    switch (cellWriteMode) {
        case CellWriteMode.color:
            digitsCountInCurrentMode = 9;
            break;
        case CellWriteMode.lines:
        case CellWriteMode.move:
            digitsCountInCurrentMode = 0;
            break;
    }

    const isFullScreen = useIsFullScreen();

    const [isShowingSettings, setIsShowingSettings] = useState(false);

    // region Event handlers
    const handleSetCellWriteMode = useCallback(
        (persistentCellWriteMode: CellWriteMode) => onStateChange({persistentCellWriteMode} as any),
        [onStateChange]
    );

    const handleClear = useCallback(
        () => onStateChange(gameState => gameStateClearSelectedCellsContent(typeManager, gameState)),
        [onStateChange, typeManager]
    );

    const handleUndo = useCallback(() => onStateChange(gameStateUndo), [onStateChange]);

    const handleRedo = useCallback(() => onStateChange(gameStateRedo), [onStateChange]);

    const handleCheckResult = useCallback(() => setIsShowingResult(true), [setIsShowingResult]);
    const handleCloseCheckResult = useCallback(() => setIsShowingResult(false), [setIsShowingResult]);

    const handleOpenSettings = useCallback(() => setIsShowingSettings(true), [setIsShowingSettings]);
    const handleCloseSettings = useCallback(() => setIsShowingSettings(false), [setIsShowingSettings]);
    // endregion

    useEventListener(window, "keydown", (ev: KeyboardEvent) => {
        const {code, ctrlKey, shiftKey} = ev;

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
                handleSetCellWriteMode(incrementCellWriteMode(persistentCellWriteMode, -1, allowDrawingBorders, allowDragging));
                ev.preventDefault();
                break;
            case "PageDown":
                handleSetCellWriteMode(incrementCellWriteMode(persistentCellWriteMode, +1, allowDrawingBorders, allowDragging));
                ev.preventDefault();
                break;
        }
    });

    return <Absolute {...rect}>
        {isReady && <>
            {indexes(digitsCountInCurrentMode).map(index => <DigitControlButton
                key={`digit-${index}`}
                index={index}
                context={context}
            />)}

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

        {MainControls && <MainControls context={context} rect={emptyRect} isHorizontal={isHorizontal}/>}

        {/*region: Cell write mode*/}
        <CellWriteModeButton
            top={0}
            cellWriteMode={CellWriteMode.main}
            data={{usersDigit: createCellDataByDisplayDigit(digitsCount, state)}}
            context={context}
        />

        <CellWriteModeButton
            top={1}
            cellWriteMode={CellWriteMode.corner}
            data={{cornerDigits: new Set([1, 2, 3].map(digit => createCellDataByDisplayDigit(digit, state)))}}
            title={`${translate("Corner")} (${translate("shortcut")}: Shift)`}
            context={context}
        />

        <CellWriteModeButton
            top={2}
            cellWriteMode={CellWriteMode.center}
            data={{centerDigits: new Set([1, 2].map(digit => createCellDataByDisplayDigit(digit, state)))}}
            title={`${translate("Center")} (${translate("shortcut")}: Ctrl)`}
            context={context}
        />

        <CellWriteModeButton
            top={3}
            cellWriteMode={CellWriteMode.color}
            data={{colors: new Set(indexes(9))}}
            title={`${translate("Colors")} (${translate("shortcut")}: Ctrl+Shift)`}
            context={context}
        />

        {allowDrawingBorders && <CellWriteModeButton
            left={(isHorizontal !== allowDragging) ? 4 : 3}
            top={(isHorizontal !== allowDragging) ? 3 : 4}
            cellWriteMode={CellWriteMode.lines}
            data={contentSize => {
                const offset = (cellSize - contentSize) / 2;

                return <AutoSvg
                    left={-offset}
                    top={-offset}
                    width={cellSize}
                    height={cellSize}
                    viewBox={`${-offset / contentSize} ${-offset / contentSize} ${cellSize / contentSize} ${cellSize / contentSize}`}
                >
                    <UserLinesByData
                        cellSize={contentSize}
                        currentMultiLine={[
                            {left: 0, top: 1},
                            {left: 0, top: 0},
                            {left: 1, top: 0},
                        ]}
                    />
                </AutoSvg>;
            }}
            childrenOnTopOfBorders={true}
            title={`${translate("Lines")} (${translate("shortcut")}: Alt)`}
            context={context}
        />}

        {allowDragging && <CellWriteModeButton
            left={isHorizontal ? 4 : 3}
            top={isHorizontal ? 3 : 4}
            cellWriteMode={CellWriteMode.move}
            data={(size) => <AutoSvg
                width={size}
                height={size}
                viewBox={"-1.1 -1.1 2.2 2.2"}
            >
                <line x1={-1} y1={0} x2={1} y2={0} stroke={textColor} strokeWidth={0.15}/>
                <polyline points={"-0.7,0.3 -1,0 -0.7,-0.3"} stroke={textColor} strokeWidth={0.15}/>
                <polyline points={"0.7,0.3 1,0 0.7,-0.3"} stroke={textColor} strokeWidth={0.15}/>
                <line x1={0} y1={-1} x2={0} y2={1} stroke={textColor} strokeWidth={0.15}/>
                <polyline points={"0.3,-0.7 0,-1 -0.3,-0.7"} stroke={textColor} strokeWidth={0.15}/>
                <polyline points={"0.3,0.7 0,1 -0.3,0.7"} stroke={textColor} strokeWidth={0.15}/>
            </AutoSvg>}
            noBorders={true}
            title={`${translate("Move the grid")} (${translate("shortcut")}: Alt+Shift)`}
            context={context}
        />}
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

            {isLmdAllowed && isCorrectResult && lmdSolutionCode !== undefined && <>
                <div style={{marginTop: cellSize * globalPaddingCoeff}}>
                    {translate("Solution code")}:
                </div>
                <div>
                    <input
                        value={lmdSolutionCode}
                        readOnly={true}
                        style={{
                            marginTop: cellSize * globalPaddingCoeff / 4,
                            border: `1px solid ${textColor}`,
                            background: "#fff",
                            fontSize: "inherit",
                            padding: "0.25em",
                            textAlign: "center",
                        }}
                    />
                </div>
            </>}

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
