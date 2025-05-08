import { AutoSvg } from "../../svg/auto-svg/AutoSvg";
import { indexesFromTo } from "../../../utils/indexes";
import { ReactElement, ReactNode } from "react";
import { PuzzleContextProps } from "../../../types/sudoku/PuzzleContext";
import { AnyPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../utils/profiler";

export interface GridLoopProps<T extends AnyPTM> extends PuzzleContextProps<T> {
    children: ReactNode | ((topOffset: number, leftOffset: number) => ReactNode);
}

/**
 * Render the puzzle's grid multiple times with different offset to support looping (toroidal) grids.
 */
export const GridLoop = observer(function GridLoopFc<T extends AnyPTM>({
    context: { puzzle },
    children,
}: GridLoopProps<T>) {
    profiler.trace();

    let {
        gridSize: { gridSize, rowsCount, columnsCount },
        typeManager: { ignoreRowsColumnCountInTheWrapper },
        loopHorizontally,
        loopVertically,
    } = puzzle;

    if (ignoreRowsColumnCountInTheWrapper) {
        rowsCount = gridSize;
        columnsCount = gridSize;
    }

    return (
        <>
            {indexesFromTo(loopVertically ? -1 : 0, loopVertically ? 1 : 0, true).flatMap((topOffset) =>
                indexesFromTo(loopHorizontally ? -1 : 0, loopHorizontally ? 1 : 0, true).map((leftOffset) => (
                    <AutoSvg
                        key={`${topOffset}-${leftOffset}`}
                        left={leftOffset * columnsCount}
                        top={topOffset * rowsCount}
                    >
                        <GridLoopItem topOffset={topOffset * rowsCount} leftOffset={leftOffset * rowsCount}>
                            {children}
                        </GridLoopItem>
                    </AutoSvg>
                )),
            )}
        </>
    );
}) as <T extends AnyPTM>(props: GridLoopProps<T>) => ReactElement;

interface GridLoopItemProps<T extends AnyPTM> extends Pick<GridLoopProps<T>, "children"> {
    topOffset: number;
    leftOffset: number;
}

const GridLoopItem = observer(function GridLoopItemFc<T extends AnyPTM>({
    topOffset,
    leftOffset,
    children,
}: GridLoopItemProps<T>) {
    profiler.trace();

    return <>{typeof children === "function" ? children(topOffset, leftOffset) : children}</>;
}) as <T extends AnyPTM>(props: GridLoopItemProps<T>) => ReactElement;
