import {Absolute} from "../../layout/absolute/Absolute";
import {emptyRect, Rect} from "../../../types/layout/Rect";
import {ControlButton, controlButtonPaddingCoeff} from "./ControlButton";
import {indexes} from "../../../utils/indexes";
import {Check, Clear, Redo, Replay, Settings, Undo} from "@emotion-icons/material";
import {
    CellWriteMode,
    getAllowedCellWriteModeInfos,
    incrementCellWriteMode,
    isCompactControlsPanel
} from "../../../types/sudoku/CellWriteMode";
import {PlainValueSet} from "../../../types/struct/Set";
import {useEventListener} from "../../../hooks/useEventListener";
import {useTranslate} from "../../../hooks/useTranslate";
import {useCallback, useEffect, useMemo, useState} from "react";
import {Modal} from "../../layout/modal/Modal";
import {Button} from "../../layout/button/Button";
import {globalPaddingCoeff, textColor, textHeightCoeff} from "../../app/globals";
import {SettingsContent} from "./settings/SettingsContent";
import {DigitControlButton} from "./DigitControlButton";
import {CellWriteModeButton} from "./CellWriteModeButton";
import {AutoSvg} from "../../svg/auto-svg/AutoSvg";
import {UserLinesByData, UserMarkByData} from "../constraints/user-lines/UserLines";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {clearSelectionAction, redoAction, undoAction} from "../../../types/sudoku/GameStateAction";
import {getEmptyGameState, mergeGameStateWithUpdates} from "../../../types/sudoku/GameState";
import {
    getDefaultDigitsCount,
    isPuzzleHasBottomRowControls,
    PuzzleDefinition
} from "../../../types/sudoku/PuzzleDefinition";
import {myClientId} from "../../../hooks/useMultiPlayer";
import {CellDataSet} from "../../../types/sudoku/CellDataSet";
import {PuzzleResultCheck} from "../../../types/sudoku/PuzzleResultCheck";

export const getControlsWidthCoeff = (puzzle: PuzzleDefinition<any, any, any>) => {
    const allowedModes = getAllowedCellWriteModeInfos(puzzle);
    const isCompact = isCompactControlsPanel(allowedModes);
    const width = isCompact ? 3 : 5;

    return width + controlButtonPaddingCoeff * (width - 1);
};

export const getControlsHeightCoeff = (puzzle: PuzzleDefinition<any, any, any>) => {
    const allowedModes = getAllowedCellWriteModeInfos(puzzle);
    const isCompact = isCompactControlsPanel(allowedModes);
    const hasBottomRowControls = isPuzzleHasBottomRowControls(puzzle);
    const height = (isCompact ? 2 : 4) + (hasBottomRowControls ? 1 : 0);

    return height + controlButtonPaddingCoeff * (height - 1);
};

export interface ControlsProps<CellType, ExType = {}, ProcessedExType = {}> {
    rect: Rect;
    isHorizontal: boolean;
    context: PuzzleContext<CellType, ExType, ProcessedExType>;
}

export const Controls = <CellType, ExType = {}, ProcessedExType = {}>(
    {rect, isHorizontal, context}: ControlsProps<CellType, ExType, ProcessedExType>
) => {
    const {
        cellSizeForSidePanel: cellSize,
        puzzle,
        state,
        onStateChange,
        multiPlayer: {isEnabled, isHost, allPlayerIds, myPendingMessages},
    } = context;

    const {
        params,
        typeManager,
        resultChecker,
        forceAutoCheckOnFinish = false,
        getLmdSolutionCode,
        digitsCount = getDefaultDigitsCount(puzzle),
        allowDrawing = [],
        hideDeleteButton,
    } = puzzle;

    const translate = useTranslate();

    const {
        keepStateOnRestart,
        createCellDataByDisplayDigit,
        mainControlsComponent: MainControls,
        getPlayerScore,
        disableCellModeLetterShortcuts,
    } = typeManager;

    const {
        persistentCellWriteMode,
        isShowingSettings,
        openedLmdOnce,
        lives,
        processed: {
            isReady,
            cellWriteModeInfo: {digitsCount: digitsCountInCurrentMode = digitsCount},
            cellWriteMode,
        },
    } = state;

    const autoCheckOnFinish = state.autoCheckOnFinish || forceAutoCheckOnFinish;

    const canRestart = !isEnabled || isHost;

    const [isShowingResult, setIsShowingResult] = useState(false);
    const {isCorrectResult, resultPhrase} = useMemo(
        (): PuzzleResultCheck<string> => {
            if (lives === 0) {
                return {
                    isCorrectResult: false,
                    resultPhrase: translate("You lost") + "!",
                };
            }

            const result = resultChecker?.(context) ?? false;
            return typeof result === "boolean"
                ? {
                    isCorrectResult: result,
                    resultPhrase: result
                        ? `${translate("Absolutely right")}!`
                        : `${translate("Something's wrong here")}...`
                }
                : {
                    isCorrectResult: result.isCorrectResult,
                    resultPhrase: translate(result.resultPhrase),
                };
        },
        [resultChecker, context, translate, lives]
    );
    const lmdSolutionCode = useMemo(() => getLmdSolutionCode?.(puzzle, state), [getLmdSolutionCode, puzzle, state]);

    const [isShowingRestartConfirmation, setIsShowingRestartConfirmation] = useState(false);

    const playerScores = useMemo(
        () => allPlayerIds
            .map(clientId => ({
                clientId,
                score: getPlayerScore?.(context, clientId) || 0,
            }))
            .sort((a, b) => a.score < b.score ? 1 : -1),
        [context, allPlayerIds, getPlayerScore]
    );
    const bestScore = playerScores[0]?.score || 0;
    const worstScore = playerScores[playerScores.length - 1]?.score || 0;
    const myScore = useMemo(
        () => playerScores.find(({clientId}) => clientId === myClientId)!.score,
        [playerScores]
    );

    const isLmdAllowed = !!params?.lmd;

    useEffect(() => {
        if (autoCheckOnFinish && resultChecker && isCorrectResult) {
            setIsShowingResult(true);
        }
    }, [autoCheckOnFinish, resultChecker, isCorrectResult, resultPhrase, setIsShowingResult]);

    useEffect(() => {
        if (!lives) {
            setIsShowingResult(true);
        }
    }, [lives]);

    const allowedCellWriteModes = getAllowedCellWriteModeInfos(puzzle);
    const allowDragging = allowedCellWriteModes.some(({mode}) => mode === CellWriteMode.move);
    const isCompact = isCompactControlsPanel(allowedCellWriteModes);

    const isRevertedUndo = isCompact && !isHorizontal;
    const undoRow = isCompact ? 0 : 3;

    const isRevertedMisc = isCompact !== isHorizontal;
    const miscRow = isCompact ? 1 : 4;

    // region Event handlers
    const handleSetCellWriteMode = useCallback(
        (persistentCellWriteMode: CellWriteMode) => onStateChange({persistentCellWriteMode}),
        [onStateChange]
    );

    const handleClear = useCallback(
        () => onStateChange(hideDeleteButton ? undoAction() : clearSelectionAction()),
        [onStateChange, hideDeleteButton]
    );

    const handleUndo = useCallback(() => {
        if (!isEnabled) {
            onStateChange(undoAction());
        }
    }, [isEnabled, onStateChange]);

    const handleRedo = useCallback(() => {
        if (!isEnabled) {
            onStateChange(redoAction());
        }
    }, [isEnabled, onStateChange]);

    const handleCheckResult = useCallback(() => setIsShowingResult(true), [setIsShowingResult]);
    const handleCloseCheckResult = useCallback(() => setIsShowingResult(false), [setIsShowingResult]);

    const handleMaybeRestart = useCallback(() => setIsShowingRestartConfirmation(true), [setIsShowingRestartConfirmation]);
    const handleCloseRestart = useCallback(() => setIsShowingRestartConfirmation(false), [setIsShowingRestartConfirmation]);
    const handleSureRestart = useCallback(() => {
        handleCloseRestart();
        onStateChange((state) => mergeGameStateWithUpdates(
            getEmptyGameState(puzzle, false),
            keepStateOnRestart?.(state) ?? {},
        ));
    }, [handleCloseRestart, onStateChange, puzzle, keepStateOnRestart]);

    const handleOpenSettings = useCallback(
        () => onStateChange({isShowingSettings: true}),
        [onStateChange]
    );
    const handleCloseSettings = useCallback(
        () => onStateChange({isShowingSettings: false}),
        [onStateChange]
    );

    const handleResetPosition = useCallback(
        () => onStateChange({loopOffset: {top: 0, left: 0}}),
        [onStateChange]
    )
    // endregion

    useEventListener(window, "keydown", (ev: KeyboardEvent) => {
        if (isShowingSettings) {
            return;
        }

        const {code, ctrlKey: winCtrlKey, metaKey: macCtrlKey, shiftKey} = ev;
        const ctrlKey = winCtrlKey || macCtrlKey;
        const anyKey = ctrlKey || shiftKey;

        for (const [index, {mode}] of allowedCellWriteModes.entries()) {
            if (!disableCellModeLetterShortcuts && code === ["KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM"][index] && !anyKey) {
                handleSetCellWriteMode(mode);
                ev.preventDefault();
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
                handleSetCellWriteMode(incrementCellWriteMode(allowedCellWriteModes, persistentCellWriteMode, -1));
                ev.preventDefault();
                break;
            case "PageDown":
                handleSetCellWriteMode(incrementCellWriteMode(allowedCellWriteModes, persistentCellWriteMode, +1));
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

            {!isEnabled && <>
                <ControlButton
                    left={isRevertedUndo ? undoRow : 0}
                    top={isRevertedUndo ? 0 : undoRow}
                    cellSize={cellSize}
                    onClick={handleUndo}
                    title={`${translate("Undo the last action")} (${translate("shortcut")}: Ctrl+Z)`}
                >
                    <Undo/>
                </ControlButton>

                <ControlButton
                    left={isRevertedUndo ? undoRow : 1}
                    top={isRevertedUndo ? 1 : undoRow}
                    cellSize={cellSize}
                    onClick={handleRedo}
                    title={`${translate("Redo the last action")} (${translate("shortcut")}: Ctrl+Y)`}
                >
                    <Redo/>
                </ControlButton>
            </>}

            {!hideDeleteButton && <ControlButton
                left={isRevertedUndo ? undoRow : 2}
                top={isRevertedUndo ? 2 : undoRow}
                cellSize={cellSize}
                onClick={handleClear}
                title={`${translate("Clear the cell contents")} (${translate("shortcut")}: Delete ${translate("or")} Backspace)`}
            >
                <Clear/>
            </ControlButton>}
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
            data={{cornerDigits: new CellDataSet(puzzle, [1, 2, 3].map(digit => createCellDataByDisplayDigit(digit, state)))}}
            title={`${translate("Corner")} (${translate("shortcut")}: Shift)`}
            context={context}
        />

        <CellWriteModeButton
            top={2}
            cellWriteMode={CellWriteMode.center}
            data={{centerDigits: new CellDataSet(puzzle, [1, 2].map(digit => createCellDataByDisplayDigit(digit, state)))}}
            title={`${translate("Center")} (${translate("shortcut")}: Ctrl)`}
            context={context}
        />

        <CellWriteModeButton
            top={3}
            cellWriteMode={CellWriteMode.color}
            data={{colors: new PlainValueSet(indexes(9))}}
            title={`${translate("Colors")} (${translate("shortcut")}: Ctrl+Shift)`}
            context={context}
        />

        <CellWriteModeButton
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
                    {allowDrawing.includes("border-line") && <UserLinesByData
                        cellSize={contentSize}
                        start={{left: 0, top: 0}}
                        end={{left: 0, top: 1}}
                    />}

                    {allowDrawing.includes("center-line") && <UserLinesByData
                        cellSize={contentSize}
                        start={{left: 0.5, top: 0.5}}
                        end={{left: 1.5, top: 0.5}}
                    />}

                    {allowDrawing.includes("center-mark") && <UserMarkByData
                        cellSize={contentSize}
                        position={{left: 0.5, top: 0.5}}
                        isCircle={true}
                        isCenter={true}
                    />}

                    {allowDrawing.includes("border-mark") && <UserMarkByData
                        cellSize={contentSize}
                        position={{left: 0.5, top: 1}}
                        isCircle={false}
                    />}

                    {allowDrawing.includes("corner-mark") && <UserMarkByData
                        cellSize={contentSize}
                        position={{left: 1, top: 0}}
                        isCircle={false}
                    />}
                </AutoSvg>;
            }}
            childrenOnTopOfBorders={true}
            title={`${translate("Lines")} (${translate("shortcut")}: Alt)`}
            context={context}
        />

        <CellWriteModeButton
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
        />

        {cellWriteMode === CellWriteMode.move && <ControlButton
            cellSize={cellSize}
            left={0}
            top={0}
            width={3}
            fullWidth={true}
            onClick={handleResetPosition}
        >
            {contentSize => <div style={{fontSize: contentSize * 0.6}}>
                {translate("Reset position")}
            </div>}
        </ControlButton>}
        {/*endregion*/}

        <ControlButton
            left={isRevertedMisc ? miscRow : 0}
            top={isRevertedMisc ? 0 : miscRow}
            cellSize={cellSize}
            onClick={handleMaybeRestart}
            title={translate("Clear the progress and restart")}
        >
            {contentSize => <>
                <div style={{
                    fontSize: contentSize * 0.4,
                    marginTop: contentSize * 0.05,
                    marginLeft: contentSize * 0.1,
                    fontWeight: 700,
                }}>
                    !
                </div>
                <Absolute
                    width={contentSize}
                    height={contentSize}
                    angle={-30}
                >
                    <Replay/>
                </Absolute>
            </>}
        </ControlButton>
        {isShowingRestartConfirmation && <Modal cellSize={cellSize} onClose={handleCloseRestart}>
            {!canRestart && <>
                <div>{translate("You can't restart the game because you're not hosting it")}.</div>
                <div>{translate("If you want to restart the game, please ask the game host to do it")}.</div>

                <Button
                    type={"button"}
                    cellSize={cellSize}
                    onClick={handleCloseRestart}
                    autoFocus={true}
                    style={{
                        marginTop: cellSize * globalPaddingCoeff,
                        padding: "0.5em 1em",
                    }}
                >
                    OK
                </Button>
            </>}

            {canRestart && <>
                <div>{translate("Are you sure that you want to restart")}?</div>
                <div>{translate("All progress will be lost")}.</div>

                <div style={{marginTop: cellSize * globalPaddingCoeff}}>
                    <Button
                        type={"button"}
                        cellSize={cellSize}
                        onClick={handleSureRestart}
                        autoFocus={true}
                        style={{
                            padding: "0.5em 1em",
                        }}
                    >
                        {translate("Yes")}
                    </Button>

                    <Button
                        type={"button"}
                        cellSize={cellSize}
                        onClick={handleCloseRestart}
                        style={{
                            marginLeft: cellSize * textHeightCoeff,
                            padding: "0.5em 1em",
                        }}
                    >
                        {translate("Cancel")}
                    </Button>
                </div>
            </>}
        </Modal>}

        <ControlButton
            left={isRevertedMisc ? miscRow : 1}
            top={isRevertedMisc ? 1 : miscRow}
            cellSize={cellSize}
            onClick={handleOpenSettings}
            title={translate("Open settings")}
        >
            <Settings/>
        </ControlButton>
        {isShowingSettings && <Modal cellSize={cellSize} onClose={handleCloseSettings}>
            <form
                onSubmit={(ev) => {
                    handleCloseSettings();
                    ev.preventDefault();
                    return false;
                }}
            >
                <div>
                    <SettingsContent
                        cellSize={cellSize}
                        context={context}
                    />
                </div>
                <div>
                    <Button
                        type={"submit"}
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
            </form>
        </Modal>}

        {resultChecker && !forceAutoCheckOnFinish && <ControlButton
            left={isRevertedMisc ? miscRow : 2}
            top={isRevertedMisc ? 2 : miscRow}
            cellSize={cellSize}
            onClick={handleCheckResult}
            title={`${translate("Check the result")}`}
        >
            <Check/>
        </ControlButton>}
        {/* The score could be mis-calculated before getting confirmation from the host, so don't display the results until then */}
        {isShowingResult && myPendingMessages.length === 0 && <Modal cellSize={cellSize} onClose={handleCloseCheckResult}>
            <div>
                {
                    getPlayerScore
                        ? (
                            isEnabled
                                ? `${translate(bestScore === worstScore ? "It's a draw" : (myScore === bestScore ? "You win" : "You lose"))}!`
                                : <>
                                    <div>{translate("Congratulations")}!</div>
                                    <div>{translate("Your score is %1").replace("%1", myScore.toString())}.</div>
                                </>
                        )
                        : resultPhrase.split("\n").map((line, lineIndex) => <div key={lineIndex}>{line}</div>)
                }
            </div>

            {(isLmdAllowed || openedLmdOnce) && isCorrectResult && lmdSolutionCode !== undefined && <>
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
