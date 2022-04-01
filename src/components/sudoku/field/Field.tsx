import {Absolute} from "../../layout/absolute/Absolute";
import {Rect} from "../../../types/layout/Rect";
import {Line} from "../../layout/line/Line";
import {FieldState} from "../../../types/sudoku/FieldState";
import {indexes09} from "../../../utils/indexes";
import {Position} from "../../../types/layout/Position";
import {noSelectedCells, SelectedCells} from "../../../types/sudoku/SelectedCells";
import {useEventListener} from "../../../hooks/useEventListener";
import {useControlKeysState} from "../../../hooks/useControlKeysState";
import {MouseEvent, PointerEvent, ReactNode, useState} from "react";
import {useAnimatedValue} from "../../../hooks/useAnimatedValue";
import {CellState} from "../../../types/sudoku/CellState";
import {CellBackground} from "../cell/CellBackground";
import {CellSelection} from "../cell/CellSelection";
import {CellDigits} from "../cell/CellDigits";
import {FieldSvg} from "./FieldSvg";

export interface FieldProps {
    isReady: boolean;
    state: FieldState;
    selectedCells: SelectedCells;
    onSelectedCellsChange: (selected: SelectedCells) => void;
    rect: Rect;
    angle: number;
    animationSpeed: number;
    cellSize: number;
    children?: ReactNode;
    topChildren?: ReactNode;
}

export const Field = ({isReady, state: {cells}, selectedCells, onSelectedCellsChange, rect, angle, animationSpeed, cellSize, children, topChildren}: FieldProps) => {
    if (!isReady) {
        onSelectedCellsChange = () => {};
    }

    const angleAnimation = useAnimatedValue(angle, animationSpeed);

    const isUpsideDown = angle % 360 !== 0;

    const {isAnyKeyDown} = useControlKeysState();

    const [isDeleteSelectedCellsStroke, setIsDeleteSelectedCellsStroke] = useState(false);

    // Handle outside click
    useEventListener(window, "mousedown", () => {
        if (!isAnyKeyDown) {
            onSelectedCellsChange(noSelectedCells);
        }

        setIsDeleteSelectedCellsStroke(false);
    });

    // Handle arrows
    useEventListener(window, "keydown", ({code, ctrlKey, shiftKey}: KeyboardEvent) => {
        const currentCell = selectedCells.last();
        // Nothing to do when there's no selection
        if (!currentCell) {
            return;
        }

        // Use the key modifiers from the event - they are always up-to-date
        const isAnyKeyDown = ctrlKey || shiftKey;

        const handleArrow = (xDirection: number, yDirection: number) => {
            const coeff = isUpsideDown ? -1 : 1;
            const newCell: Position = {
                left: (currentCell.left + coeff * xDirection + 9) % 9,
                top: (currentCell.top + coeff * yDirection + 9) % 9,
            }

            onSelectedCellsChange(isAnyKeyDown ? selectedCells.add(newCell) : selectedCells.set([newCell]));
        };

        switch (code) {
            case "ArrowLeft":
                handleArrow(-1, 0);
                break;
            case "ArrowRight":
                handleArrow(1, 0);
                break;
            case "ArrowUp":
                handleArrow(0, -1);
                break;
            case "ArrowDown":
                handleArrow(0, 1);
                break;
        }
    });

    const renderCellsLayer = (keyPrefix: string, renderer: (cellState: CellState, cellPosition: Position) => ReactNode) => cells.flatMap((row, rowIndex) => row.map((cellState, columnIndex) => {
        const cellPosition: Position = {
            left: columnIndex,
            top: rowIndex,
        };

        return <Absolute
            key={`cell-${keyPrefix}-${rowIndex}-${columnIndex}`}
            left={cellSize * cellPosition.left}
            top={cellSize * cellPosition.top}
            width={cellSize}
            height={cellSize}
        >
            {renderer(cellState, cellPosition)}
        </Absolute>;
    }));

    return <>
        <style dangerouslySetInnerHTML={{__html: `
            html,
            body {
                overflow: hidden;
            }
        `}}/>

        <Absolute
            {...rect}
            angle={angleAnimation}
            style={{backgroundColor: "white"}}
        >
            {renderCellsLayer("background", ({colors}) => <CellBackground
                colors={colors}
                size={cellSize}
            />)}

            {renderCellsLayer("selection", (cellState, cellPosition) => selectedCells.contains(cellPosition) && <CellSelection
                size={cellSize}
                isSecondary={selectedCells.last()?.left !== cellPosition.left || selectedCells.last()?.top !== cellPosition.top}
            />)}

            <FieldSvg cellSize={cellSize}>{children}</FieldSvg>

            {indexes09.map(index => <Line
                key={`h-line-${index}`}
                x1={0}
                y1={cellSize * index}
                x2={cellSize * 9}
                y2={cellSize * index}
                width={index % 3 ? 1 : 3}
            />)}

            {indexes09.map(index => <Line
                key={`v-line-${index}`}
                x1={cellSize * index}
                y1={0}
                x2={cellSize * index}
                y2={cellSize * 9}
                width={index % 3 ? 1 : 3}
            />)}

            <FieldSvg cellSize={cellSize}>{topChildren}</FieldSvg>

            {renderCellsLayer("digits", (cellState) => <CellDigits
                data={cellState}
                size={cellSize}
                sudokuAngle={angleAnimation}
            />)}

            {renderCellsLayer("mouse-handler", (cellState, cellPosition) => <Absolute
                width={cellSize}
                height={cellSize}
                pointerEvents={true}
                style={{
                    cursor: isReady ? "pointer" : undefined,
                    touchAction: "none",
                    userSelect: "none",
                }}
                onMouseDown={(ev: MouseEvent<HTMLDivElement>) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                }}
                onPointerDown={({target, pointerId, ctrlKey, shiftKey, isPrimary}: PointerEvent<HTMLDivElement>) => {
                    if ((target as HTMLDivElement).hasPointerCapture?.(pointerId)) {
                        (target as HTMLDivElement).releasePointerCapture?.(pointerId);
                    }

                    const isMultiSelection = ctrlKey || shiftKey || !isPrimary;

                    setIsDeleteSelectedCellsStroke(isMultiSelection && selectedCells.contains(cellPosition));
                    onSelectedCellsChange(
                        isMultiSelection
                            ? selectedCells.toggle(cellPosition)
                            : selectedCells.set([cellPosition])
                    );
                }}
                onPointerEnter={({buttons}: PointerEvent<HTMLDivElement>) => {
                    if (buttons !== 1) {
                        return;
                    }

                    onSelectedCellsChange(selectedCells.toggle(cellPosition, !isDeleteSelectedCellsStroke));
                }}
            />)}
        </Absolute>
    </>;
};
