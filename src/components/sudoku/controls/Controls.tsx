import {Absolute} from "../../layout/absolute/Absolute";
import {emptyRect, Rect} from "../../../types/layout/Rect";
import {ControlButton, controlButtonPaddingCoeff} from "./ControlButton";
import {indexes} from "../../../utils/indexes";
import {Clear, Fullscreen, FullscreenExit, Redo, Undo} from "@emotion-icons/material";
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
            fieldSize: {fieldSize},
            digitsCount = fieldSize,
        },
        state,
        onStateChange,
    } = otherProps;

    const {
        isReady,
        persistentCellWriteMode,
        cellWriteMode,
    } = state;

    const isColorMode = cellWriteMode === CellWriteMode.color;
    const digitsCountInCurrentMode = isColorMode ? 9 : digitsCount;

    const isFullScreen = useIsFullScreen();

    // region Event handlers
    const handleSetCellWriteMode = (persistentCellWriteMode: CellWriteMode) => onStateChange({persistentCellWriteMode} as any);

    const handleDigit = (digit: number) => isReady && onStateChange(gameState => gameStateHandleDigit(typeManager, gameState, digit));

    const handleClear = () => onStateChange(gameState => gameStateClearSelectedCellsContent(typeManager, gameState));

    const handleUndo = () => onStateChange(gameStateUndo);

    const handleRedo = () => onStateChange(gameStateRedo);
    // endregion

    useEventListener(window, "keydown", (ev: KeyboardEvent) => {
        const {code, ctrlKey, shiftKey} = ev;

        if (isReady) {
            for (const index of indexes(digitsCountInCurrentMode)) {
                const digit = index + 1;
                if (code === `Digit${digit}` || code === `Numpad${digit}`) {
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

    const mainControlsCount = typeManager.mainControlsCount || 0;
    const MainControls = typeManager.mainControlsComponent;

    const secondaryControlsCount = typeManager.secondaryControlsCount || 0;
    const SecondaryControls = typeManager.secondaryControlsComponent;

    return <Absolute {...rect}>
        {isReady && indexes(digitsCountInCurrentMode).map(index => {
            const cellData = typeManager.createCellDataByDisplayDigit(index + 1, state);

            return <ControlButton
                key={`digit-${index + 1}`}
                left={index % 3}
                top={(index - index % 3) / 3}
                cellSize={cellSize}
                fullSize={true}
                opacityOnHover={isColorMode}
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
                data={{usersDigit: typeManager.createCellDataByDisplayDigit(fieldSize, state)}}
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
            title={"Clear the cell contents (shortcut: Delete or Backspace)"}
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
                title={"Undo the last action (shortcut: Ctrl+Z)"}
            >
                <Undo/>
            </ControlButton>

            <ControlButton
                left={secondaryControlsCount + 1}
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
