import {Absolute} from "../../layout/absolute/Absolute";
import {Rect} from "../../../types/layout/Rect";
import {Line} from "../../layout/line/Line";
import {FieldState} from "../../../types/sudoku/FieldState";
import {indexes09} from "../../../utils/indexes";
import {CellContent} from "../cell-content/CellContent";
import {Position} from "../../../types/layout/Position";
import {noSelectedCells, SelectedCells} from "../../../types/sudoku/SelectedCells";
import {useEventListener} from "../../../hooks/useEventListener";
import {useControlKeysState} from "../../../hooks/useControlKeysState";
import {useState} from "react";

export interface FieldProps {
    isReady: boolean;
    state: FieldState;
    selectedCells: SelectedCells;
    onSelectedCellsChange: (selected: SelectedCells) => void;
    rect: Rect;
    angle: number;
    animationSpeed: number;
    cellSize: number;
}

export const Field = ({isReady, state: {cells}, selectedCells, onSelectedCellsChange, rect, angle, animationSpeed, cellSize}: FieldProps) => {
    if (!isReady) {
        onSelectedCellsChange = () => {};
    }

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

    return <>
        <style dangerouslySetInnerHTML={{__html: `
            html,
            body {
                overflow: hidden;
            }
    
            .Field,
            .Field * {
                transition: all linear ${animationSpeed}ms;
                transition-property: transform, left, top;
            }
        `}}/>

        <Absolute
            className={"Field"}
            {...rect}
            angle={angle}
            style={{backgroundColor: "white"}}
        >
            {cells.flatMap((row, rowIndex) => row.map((cellState, columnIndex) => {
                const cellPosition: Position = {
                    left: columnIndex,
                    top: rowIndex,
                };
                const isSelected = selectedCells.contains(cellPosition);

                return <Absolute
                    key={`cell-${rowIndex}-${columnIndex}`}
                    left={cellSize * cellPosition.left}
                    top={cellSize * cellPosition.top}
                    width={cellSize}
                    height={cellSize}
                    pointerEvents={true}
                    style={{
                        cursor: isReady ? "pointer" : undefined,
                        // TODO: better visual effect for the cell selection
                        backgroundColor: isSelected ? "lightblue" : undefined,
                    }}
                    onMouseDown={(ev) => {
                        ev.preventDefault();
                        ev.stopPropagation();

                        setIsDeleteSelectedCellsStroke(isAnyKeyDown && selectedCells.contains(cellPosition));
                        onSelectedCellsChange(
                            isAnyKeyDown
                                ? selectedCells.toggle(cellPosition)
                                : selectedCells.set([cellPosition])
                        );
                    }}
                    onMouseEnter={(ev) => {
                        if (ev.buttons !== 1) {
                            return;
                        }

                        onSelectedCellsChange(selectedCells.toggle(cellPosition, !isDeleteSelectedCellsStroke));
                    }}
                >
                    <CellContent data={cellState} size={cellSize} sudokuAngle={angle}/>
                </Absolute>;
            }))}

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
        </Absolute>
    </>;
};
