import {Absolute} from "../../layout/absolute/Absolute";
import {emptyRect, Rect} from "../../../types/layout/Rect";
import {ControlButton, controlButtonPaddingCoeff} from "./ControlButton";
import {indexes} from "../../../utils/indexes";
import {Check, Clear, Redo, Replay, Settings, Undo} from "@emotion-icons/material";
import {
    CellWriteMode,
    CellWriteModeInfo,
    getAllowedCellWriteModeInfos,
    incrementCellWriteMode
} from "../../../types/sudoku/CellWriteMode";
import {Set} from "../../../types/struct/Set";
import {useEventListener} from "../../../hooks/useEventListener";
import {useTranslate} from "../../../contexts/LanguageCodeContext";
import {useCallback, useEffect, useMemo, useState} from "react";
import {Modal} from "../../layout/modal/Modal";
import {Button} from "../../layout/button/Button";
import {globalPaddingCoeff, textColor, textHeightCoeff} from "../../app/globals";
import {SettingsContent} from "./SettingsContent";
import {DigitControlButton} from "./DigitControlButton";
import {CellWriteModeButton} from "./CellWriteModeButton";
import {AutoSvg} from "../../svg/auto-svg/AutoSvg";
import {UserLinesByData, UserMarkByData} from "../constraints/user-lines/UserLines";
import {useAllowLmd} from "../../../contexts/AllowLmdContext";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {clearSelectionAction, redoAction, undoAction} from "../../../types/sudoku/GameStateAction";
import {GameState, getEmptyGameState} from "../../../types/sudoku/GameState";
import {getDefaultDigitsCount} from "../../../types/sudoku/PuzzleDefinition";
import {myClientId} from "../../../hooks/useMultiPlayer";

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
        multiPlayer: {isEnabled, isHost, allPlayerIds, myPendingMessages},
    } = context;

    const {
        typeManager,
        resultChecker,
        forceAutoCheckOnFinish = false,
        getLmdSolutionCode,
        digitsCount = getDefaultDigitsCount(puzzle),
        allowDrawing = [],
        loopHorizontally = false,
        loopVertically = false,
        enableDragMode = false,
    } = puzzle;

    const allowDragging = loopHorizontally || loopVertically || enableDragMode;

    const translate = useTranslate();

    const {
        keepStateOnRestart,
        createCellDataByDisplayDigit,
        mainControlsComponent: MainControls,
        extraCellWriteModes = [],
        getPlayerScore,
    } = typeManager;

    const {
        isReady,
        persistentCellWriteMode,
        cellWriteModeInfo: {digitsCount: digitsCountInCurrentMode = digitsCount},
        isShowingSettings,
    } = state;

    const autoCheckOnFinish = state.autoCheckOnFinish || forceAutoCheckOnFinish;

    const canRestart = !isEnabled || isHost;

    const [isShowingResult, setIsShowingResult] = useState(false);
    const isCorrectResult = useMemo(() => resultChecker?.(context), [resultChecker, context]);
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

    const isLmdAllowed = useAllowLmd();

    useEffect(() => {
        if (autoCheckOnFinish && resultChecker && isCorrectResult) {
            setIsShowingResult(true);
        }
    }, [autoCheckOnFinish, resultChecker, isCorrectResult, setIsShowingResult]);

    const allowedCellWriteModes: CellWriteModeInfo<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>[] = [
        ...getAllowedCellWriteModeInfos(allowDrawing.length !== 0, allowDragging),
        ...extraCellWriteModes,
    ];

    // region Event handlers
    const handleSetCellWriteMode = useCallback(
        (persistentCellWriteMode: CellWriteMode) => onStateChange({persistentCellWriteMode} as any),
        [onStateChange]
    );

    const handleClear = useCallback(
        () => onStateChange(clearSelectionAction()),
        [onStateChange]
    );

    const handleUndo = useCallback(() => onStateChange(undoAction()), [onStateChange]);

    const handleRedo = useCallback(() => onStateChange(redoAction()), [onStateChange]);

    const handleCheckResult = useCallback(() => setIsShowingResult(true), [setIsShowingResult]);
    const handleCloseCheckResult = useCallback(() => setIsShowingResult(false), [setIsShowingResult]);

    const handleMaybeRestart = useCallback(() => setIsShowingRestartConfirmation(true), [setIsShowingRestartConfirmation]);
    const handleCloseRestart = useCallback(() => setIsShowingRestartConfirmation(false), [setIsShowingRestartConfirmation]);
    const handleSureRestart = useCallback(() => {
        handleCloseRestart();
        onStateChange((state) => ({
            ...getEmptyGameState(puzzle, false),
            ...keepStateOnRestart?.(state),
        }));
    }, [handleCloseRestart, onStateChange, puzzle, keepStateOnRestart]);

    const handleOpenSettings = useCallback(
        () => onStateChange({isShowingSettings: true} as Partial<GameState<CellType>> as any),
        [onStateChange]
    );
    const handleCloseSettings = useCallback(
        () => onStateChange({isShowingSettings: false} as Partial<GameState<CellType>> as any),
        [onStateChange]
    );
    // endregion

    useEventListener(window, "keydown", (ev: KeyboardEvent) => {
        if (isShowingSettings) {
            return;
        }

        const {code, ctrlKey: winCtrlKey, metaKey: macCtrlKey, shiftKey} = ev;
        const ctrlKey = winCtrlKey || macCtrlKey;
        const anyKey = ctrlKey || shiftKey;

        for (const [index, {mode}] of allowedCellWriteModes.entries()) {
            if (code === ["KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM"][index] && !anyKey) {
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

        {allowDrawing.length !== 0 && <CellWriteModeButton
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
                        currentMultiLine={[
                            {left: 0, top: 0},
                            {left: 0, top: 1},
                        ]}
                    />}

                    {allowDrawing.includes("center-line") && <UserLinesByData
                        cellSize={contentSize}
                        currentMultiLine={[
                            {left: 0.5, top: 0.5},
                            {left: 1.5, top: 0.5},
                        ]}
                    />}

                    {allowDrawing.includes("center-mark") && <UserMarkByData
                        cellSize={contentSize}
                        position={{left: 0.5, top: 0.5}}
                        isCircle={true}
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
            left={isHorizontal ? 4 : 1}
            top={isHorizontal ? 1 : 4}
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
            left={isHorizontal ? 4 : 2}
            top={isHorizontal ? 2 : 4}
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
                        : (
                            isCorrectResult
                                ? `${translate("Absolutely right")}!`
                                : `${translate("Something's wrong here")}...`
                        )
                }
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
