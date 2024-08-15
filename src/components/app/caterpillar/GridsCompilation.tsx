import {CaterpillarGrid} from "./types";
import {WindowSize} from "../../../hooks/useWindowSize";
import {getDimensions, getGridRect} from "./utils";
import {Absolute} from "../../layout/absolute/Absolute";
import {MouseEvent} from "react";
import {CellSelectionColor} from "../../sudoku/cell/CellSelection";
import {SudokuPad} from "./SudokuPad";

interface GridsCompilationProps {
    grids: CaterpillarGrid[];
    windowSize: WindowSize;
    readOnly: boolean;
    onClick?: (grid: CaterpillarGrid, isCtrl: boolean) => void;
    onDoubleClick?: (grid: CaterpillarGrid) => void;
    selectedGrids?: number[];
}

export const GridsCompilation = (
    {
        grids: viewGrids,
        windowSize,
        readOnly,
        onClick,
        onDoubleClick,
        selectedGrids
    }: GridsCompilationProps
) => {
    const {transformRect} = getDimensions(viewGrids, windowSize, readOnly);

    return <div>
        {viewGrids.map((grid) => {
            const {guid, offset, size = 6} = grid;

            return <Absolute
                key={"background" + guid}
                {...transformRect({...offset, width: size, height: size})}
                style={{
                    background: "#fff",
                    pointerEvents: readOnly ? "none" : "all",
                    cursor: "pointer",
                }}
                onClick={(ev: MouseEvent<HTMLDivElement>) => {
                    ev.preventDefault();
                    ev.stopPropagation();

                    onClick?.(grid, ev.ctrlKey || ev.metaKey);
                }}
                onDoubleClick={(ev: MouseEvent<HTMLDivElement>) => {
                    ev.preventDefault();
                    ev.stopPropagation();

                    onDoubleClick?.(grid);
                }}
            />;
        })}

        {viewGrids.map(({guid, offset, size = 6}) => selectedGrids?.includes(guid) && <Absolute
            key={"selection" + guid}
            {...transformRect({...offset, width: size, height: size})}
            borderColor={CellSelectionColor.mainCurrent}
            borderWidth={5}
        />)}

        {viewGrids.map((grid) => <SudokuPad
            key={"SudokuPad" + grid.guid}
            data={grid.data}
            bounds={transformRect(getGridRect(grid))}
        />)}
    </div>;
};
