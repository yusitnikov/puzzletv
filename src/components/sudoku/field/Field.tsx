import {Absolute} from "../../layout/absolute/Absolute";
import {Rect} from "../../../types/layout/Rect";
import {Line} from "../../layout/line/Line";
import {FieldState} from "../../../types/sudoku/FieldState";
import {indexes09} from "../../../utils/indexes";
import {CellContent} from "../cell-content/CellContent";
import {useEffect} from "react";
import {Position} from "../../../types/layout/Position";
import {noSelectedCells, SelectedCells} from "../../../types/sudoku/SelectedCells";

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

    useEffect(() => {
        const handler = () => onSelectedCellsChange(noSelectedCells);
        window.addEventListener("mousedown", handler);
        return () => window.removeEventListener("mousedown", handler);
    }, [onSelectedCellsChange]);

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
                        onSelectedCellsChange(selectedCells.set([cellPosition]));
                    }}
                    onMouseEnter={(ev) => {
                        if (ev.buttons !== 1) {
                            return;
                        }

                        onSelectedCellsChange(selectedCells.add(cellPosition));
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
