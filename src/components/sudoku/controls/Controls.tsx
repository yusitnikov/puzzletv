import {Absolute} from "../../layout/absolute/Absolute";
import {Rect} from "../../../types/layout/Rect";
import {ControlButton, controlButtonPaddingCoeff} from "./ControlButton";
import {indexes08} from "../../../utils/indexes";
import {
    Clear,
    FastForward,
    Fullscreen,
    FullscreenExit,
    PlayArrow,
    PushPin,
    Redo,
    RotateRight,
    Timelapse,
    Undo
} from "@emotion-icons/material";
import {CellContent} from "../cell/CellContent";
import {CellWriteMode} from "../../../types/sudoku/CellWriteMode";
import {ArrowCurveDownLeft} from "@emotion-icons/fluentui-system-filled";
import {Set} from "../../../types/struct/Set";
import {CellBackground} from "../cell/CellBackground";
import {CellDigits} from "../cell/CellDigits";
import {AnimationSpeed, animationSpeedToString} from "../../../types/sudoku/AnimationSpeed";
import {
    gameStateClearSelectedCellsContent,
    gameStateHandleDigit,
    gameStateRedo,
    gameStateUndo
} from "../../../types/sudoku/GameState";
import {MergeStateAction} from "../../../types/react/MergeStateAction";
import {toggleFullScreen} from "../../../utils/fullScreen";
import {useIsFullScreen} from "../../../hooks/useIsFullScreen";
import {useEventListener} from "../../../hooks/useEventListener";
import {rotateClockwise} from "../../../utils/rotation";
import {ProcessedGameState} from "../../../hooks/sudoku/useGame";
import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";

export const controlsWidthCoeff = 4 + controlButtonPaddingCoeff * 3;
export const controlsHeightCoeff = 5 + controlButtonPaddingCoeff * 4;

export interface ControlsProps<CellType> {
    rect: Rect;
    cellSize: number;
    isHorizontal: boolean;
    typeManager: SudokuTypeManager<CellType>;
    state: ProcessedGameState<CellType>;
    onStateChange: (state: MergeStateAction<ProcessedGameState<CellType>>) => void;
}

export const Controls = <CellType,>(
    {
        rect,
        cellSize,
        isHorizontal,
        typeManager,
        state,
        onStateChange,
    }: ControlsProps<CellType>
) => {
    const {
        isReady,
        persistentCellWriteMode,
        cellWriteMode,
        isStickyMode,
        animationSpeed,
    } = state;

    const isFullScreen = useIsFullScreen();

    // region Event handlers
    const handleSetCellWriteMode = (persistentCellWriteMode: CellWriteMode) => onStateChange({persistentCellWriteMode});

    const handleDigit = (digit: number) => isReady && onStateChange(gameState => gameStateHandleDigit(typeManager, gameState, digit));

    const handleClear = () => onStateChange(gameState => gameStateClearSelectedCellsContent(typeManager, gameState));

    const handleUndo = () => onStateChange(gameStateUndo);

    const handleRedo = () => onStateChange(gameStateRedo);

    const handleRotate = () => onStateChange(({angle}) => ({angle: rotateClockwise(angle)}));

    const handleToggleStickyMode = () => onStateChange(({isStickyMode}) => ({isStickyMode: !isStickyMode}));

    const handleSetAnimationSpeed = (animationSpeed: AnimationSpeed) => onStateChange({animationSpeed});
    const handleAnimationSpeedToggle = () => {
        switch (animationSpeed) {
            case AnimationSpeed.regular:
                handleSetAnimationSpeed(AnimationSpeed.immediate);
                break;
            case AnimationSpeed.immediate:
                handleSetAnimationSpeed(AnimationSpeed.slow);
                break;
            case AnimationSpeed.slow:
                handleSetAnimationSpeed(AnimationSpeed.regular);
                break;
        }
    };
    // endregion

    useEventListener(window, "keydown", (ev: KeyboardEvent) => {
        const {code, ctrlKey, shiftKey} = ev;

        if (isReady) {
            for (const index of indexes08) {
                const digit = index + 1;
                if (code === `Digit${digit}` || code === `Numpad${digit}`) {
                    handleDigit(digit);
                    ev.preventDefault();
                }
            }
        }

        switch (code) {
            case "KeyR":
                handleRotate();
                ev.preventDefault();
                break;
            case "KeyS":
                handleToggleStickyMode();
                ev.preventDefault();
                break;
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
        {isReady && indexes08.map(index => {
            const cellData = typeManager.createCellDataByDisplayDigit(index + 1, state);

            return <ControlButton
                key={`digit-${index + 1}`}
                left={index % 3}
                top={(index - index % 3) / 3}
                cellSize={cellSize}
                fullSize={true}
                opacityOnHover={cellWriteMode === CellWriteMode.color}
                onClick={() => handleDigit(index + 1)}
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

        {!isReady && <Absolute
            width={cellSize * (3 + controlButtonPaddingCoeff * 2)}
            height={cellSize * (3 + controlButtonPaddingCoeff * 2)}
            pointerEvents={true}
            style={{
                fontSize: cellSize * 0.4,
            }}
        >
            <div>Please rotate the field once to start solving the puzzle!</div>

            <Absolute
                width={cellSize * 1.5}
                height={cellSize * 1.5}
                left={-cellSize * 0.25}
                top={cellSize * (1.5 + controlButtonPaddingCoeff * 2)}
            >
                <ArrowCurveDownLeft/>
            </Absolute>
        </Absolute>}

        <ControlButton
            left={3}
            top={0}
            cellSize={cellSize}
            innerBorderWidth={1}
            checked={cellWriteMode === CellWriteMode.main}
            onClick={() => handleSetCellWriteMode(CellWriteMode.main)}
            title={"Final digit"}
        >
            {contentSize => <CellDigits
                typeManager={typeManager}
                data={{usersDigit: typeManager.createCellDataByDisplayDigit(9, state)}}
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
            title={"Corner (shortcut: Shift)"}
        >
            {contentSize => <CellDigits
                typeManager={typeManager}
                data={{cornerDigits: new Set([1, 2, 3].map(digit => typeManager.createCellDataByDisplayDigit(digit, state)))}}
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
            title={"Center (shortcut: Ctrl)"}
        >
            {contentSize => <CellDigits
                typeManager={typeManager}
                data={{centerDigits: new Set([1, 2].map(digit => typeManager.createCellDataByDisplayDigit(digit, state)))}}
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
            title={"Colors (shortcut: Ctrl+Shift)"}
        >
            {contentSize => <CellBackground
                colors={new Set(indexes08)}
                size={contentSize}
            />}
        </ControlButton>

        <ControlButton
            left={0}
            top={3}
            cellSize={cellSize}
            onClick={handleRotate}
            title={"Rotate the puzzle (shortcut: R)\nTip: use the button below to control the rotation speed"}
        >
            <RotateRight/>
        </ControlButton>

        <ControlButton
            left={1}
            top={3}
            cellSize={cellSize}
            checked={isStickyMode}
            onClick={handleToggleStickyMode}
            title={`Sticky mode: ${isStickyMode ? "ON" : "OFF"} (click to toggle, shortcut: S).\nSticky digits will preserve the orientation when rotating the field.\nSticky digits are highlighted in green.`}
        >
            <PushPin/>
        </ControlButton>

        <ControlButton
            left={2}
            top={3}
            cellSize={cellSize}
            onClick={handleClear}
            title={"Clear the cell contents (shortcut: Delete or Backspace)"}
        >
            <Clear/>
        </ControlButton>

        <Absolute
            left={isHorizontal ? 0 : rect.width - cellSize}
            top={isHorizontal ? rect.height - cellSize : 0}
            width={isHorizontal ? rect.width : cellSize}
            height={isHorizontal ? cellSize : rect.height}
        >
            <ControlButton
                left={0}
                top={0}
                flipDirection={!isHorizontal}
                cellSize={cellSize}
                onClick={handleAnimationSpeedToggle}
                title={`Rotation speed: ${animationSpeedToString(animationSpeed)} (click to toggle)`}
            >
                {animationSpeed === AnimationSpeed.regular && <PlayArrow/>}
                {animationSpeed === AnimationSpeed.immediate && <FastForward/>}
                {animationSpeed === AnimationSpeed.slow && <Timelapse/>}
            </ControlButton>

            <ControlButton
                left={1}
                top={0}
                flipDirection={!isHorizontal}
                cellSize={cellSize}
                onClick={handleUndo}
                title={"Undo the last action (shortcut: Ctrl+Z)"}
            >
                <Undo/>
            </ControlButton>

            <ControlButton
                left={2}
                top={0}
                flipDirection={!isHorizontal}
                cellSize={cellSize}
                onClick={handleRedo}
                title={"Redo the last action (shortcut: Ctrl+Y)"}
            >
                <Redo/>
            </ControlButton>

            <ControlButton
                left={3}
                top={0}
                flipDirection={!isHorizontal}
                cellSize={cellSize}
                onClick={toggleFullScreen}
                fullSize={true}
                title={isFullScreen ? "Exit full screen mode" : "Enter full screen mode"}
            >
                {isFullScreen ? <FullscreenExit/> : <Fullscreen/>}
            </ControlButton>
        </Absolute>
    </Absolute>;
};
