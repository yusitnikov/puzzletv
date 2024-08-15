import {CaterpillarGrid} from "./types";
import {WindowSize} from "../../../hooks/useWindowSize";
import {getDimensions, getGridRect} from "./utils";
import {Absolute} from "../../layout/absolute/Absolute";
import {MouseEvent, useMemo} from "react";
import {CellSelectionColor} from "../../sudoku/cell/CellSelection";
import {SudokuPad} from "./SudokuPad";
import {normalizeSclMetadata, puzzleIdToScl} from "../../../utils/sudokuPad";
import {lightRedColor} from "../globals";
import {lightenColorStr} from "../../../utils/color";

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
        grids,
        windowSize,
        readOnly,
        onClick,
        onDoubleClick,
        selectedGrids
    }: GridsCompilationProps
) => {
    const {transformRect} = getDimensions(grids, windowSize, readOnly);

    const parsedGrids = useMemo(() => grids.map((grid) => {
        try {
            return normalizeSclMetadata(puzzleIdToScl(grid.data));
        } catch {
            return undefined;
        }
    }), [grids]);

    return <div>
        {grids.map((grid, index) => {
            const {guid, offset, size = 6} = grid;
            const parsedData = parsedGrids[index];

            return <Absolute
                key={"background" + guid}
                {...transformRect({...offset, width: size, height: size})}
                style={{
                    background: readOnly || parsedData?.metadata?.solution ? "#fff" : lightenColorStr(lightRedColor, 0.3),
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

        {grids.map(({guid, offset, size = 6}) => selectedGrids?.includes(guid) && <Absolute
            key={"selection" + guid}
            {...transformRect({...offset, width: size, height: size})}
            borderColor={CellSelectionColor.mainCurrent}
            borderWidth={5}
        />)}

        {grids.map((grid) => <SudokuPad
            key={"SudokuPad" + grid.guid}
            data={grid.data}
            bounds={transformRect(getGridRect(grid))}
        />)}
    </div>;
};
