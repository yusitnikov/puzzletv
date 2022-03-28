import {Absolute} from "../../layout/absolute/Absolute";
import {Rect} from "../../../types/layout/Rect";
import {ControlButton, controlButtonPaddingCoeff} from "./ControlButton";
import {indexes08} from "../../../utils/indexes";
import {Clear, Fullscreen, FullscreenExit, PushPin, Redo, RotateRight, Undo} from "@emotion-icons/material";
import {CellContent} from "../cell/CellContent";
import {CellWriteMode} from "../../../types/sudoku/CellWriteMode";
import {ArrowCurveDownLeft} from "@emotion-icons/fluentui-system-filled";
import {RotatableDigit} from "../../../types/sudoku/RotatableDigit";
import {Set} from "../../../types/struct/Set";
import {CellBackground} from "../cell/CellBackground";
import {CellDigits} from "../cell/CellDigits";

export const controlsWidthCoeff = 4 + controlButtonPaddingCoeff * 3;
export const controlsHeightCoeff = 5 + controlButtonPaddingCoeff * 4;

export interface ControlsProps {
    rect: Rect;
    cellSize: number;
    isHorizontal: boolean;
    cellWriteMode: CellWriteMode;
    onCellWriteModeChange: (mode: CellWriteMode) => void;
    onDigit: (digit: number) => void;
    onClear: () => void;
    onUndo: () => void;
    onRedo: () => void;
    isReady: boolean;
    onRotate: () => void;
    isStickyMode: boolean;
    onToggleStickyMode: () => void;
    isFullScreen: boolean;
    onToggleFullScreen: () => void;
}

export const Controls = (
    {
        rect,
        cellSize,
        isHorizontal,
        cellWriteMode,
        onCellWriteModeChange,
        onDigit,
        onClear,
        onUndo,
        onRedo,
        isReady,
        onRotate,
        isStickyMode,
        onToggleStickyMode,
        isFullScreen,
        onToggleFullScreen,
    }: ControlsProps
) => <Absolute {...rect}>
    {isReady && indexes08.map(index => {
        const rotatableDigit: RotatableDigit = {
            digit: index + 1,
            sticky: isStickyMode,
        };

        return <ControlButton
            key={`digit-${index + 1}`}
            left={index % 3}
            top={(index - index % 3) / 3}
            cellSize={cellSize}
            fullSize={true}
            opacityOnHover={cellWriteMode === CellWriteMode.color}
            onClick={() => onDigit(index + 1)}
        >
            <CellContent
                data={{
                    usersDigit: cellWriteMode === CellWriteMode.main ? rotatableDigit : undefined,
                    cornerDigits: new Set(cellWriteMode === CellWriteMode.corner ? [rotatableDigit] : []),
                    centerDigits: new Set(cellWriteMode === CellWriteMode.center ? [rotatableDigit] : []),
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
        onClick={() => onCellWriteModeChange(CellWriteMode.main)}
        title={"Final digit"}
    >
        {contentSize => <CellDigits
            data={{usersDigit: {digit: 9}}}
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
        onClick={() => onCellWriteModeChange(CellWriteMode.corner)}
        title={"Corner (shortcut: Shift)"}
    >
        {contentSize => <CellDigits
            data={{cornerDigits: new Set([{digit: 1}, {digit: 2}, {digit: 3}])}}
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
        onClick={() => onCellWriteModeChange(CellWriteMode.center)}
        title={"Center (shortcut: Ctrl)"}
    >
        {contentSize => <CellDigits
            data={{centerDigits: new Set([{digit: 1}, {digit: 2}])}}
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
        onClick={() => onCellWriteModeChange(CellWriteMode.color)}
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
        onClick={onRotate}
        title={"Rotate the puzzle (shortcut: R)"}
    >
        <RotateRight/>
    </ControlButton>
    <ControlButton
        left={1}
        top={3}
        cellSize={cellSize}
        checked={isStickyMode}
        onClick={onToggleStickyMode}
        title={`Sticky mode: ${isStickyMode ? "ON" : "OFF"} (click to toggle, shortcut: S).\nSticky digits will preserve the orientation when rotating the field.\nSticky digits are highlighted in green.`}
    >
        <PushPin/>
    </ControlButton>
    <ControlButton
        left={2}
        top={3}
        cellSize={cellSize}
        onClick={onClear}
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
            left={1}
            top={0}
            flipDirection={!isHorizontal}
            cellSize={cellSize}
            onClick={onUndo}
            title={"Undo the last action (shortcut: Ctrl+Z)"}
        >
            <Undo/>
        </ControlButton>
        <ControlButton
            left={2}
            top={0}
            flipDirection={!isHorizontal}
            cellSize={cellSize}
            onClick={onRedo}
            title={"Redo the last action (shortcut: Ctrl+Y)"}
        >
            <Redo/>
        </ControlButton>
        {/*<ControlButton*/}
        {/*    left={2}*/}
        {/*    top={0}*/}
        {/*    flipDirection={!isHorizontal}*/}
        {/*    cellSize={cellSize}*/}
        {/*>*/}
        {/*</ControlButton>*/}
        <ControlButton
            left={3}
            top={0}
            flipDirection={!isHorizontal}
            cellSize={cellSize}
            onClick={onToggleFullScreen}
            fullSize={true}
        >
            {isFullScreen ? <FullscreenExit/> : <Fullscreen/>}
        </ControlButton>
    </Absolute>
</Absolute>;
