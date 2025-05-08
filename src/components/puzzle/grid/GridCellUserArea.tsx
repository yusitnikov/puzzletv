import { Position } from "../../../types/layout/Position";
import { ReactElement, ReactNode } from "react";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";
import { TransformedRectGraphics } from "../../../contexts/TransformContext";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../utils/profiler";
import { AutoSvg } from "../../svg/auto-svg/AutoSvg";

interface GridCellUserAreaProps<T extends AnyPTM> {
    context?: PuzzleContext<T>;
    cellPosition?: Position;
    children: ReactNode;
}

export const GridCellUserArea = observer(function GridCellUserAreaFc<T extends AnyPTM>({
    context,
    cellPosition,
    children,
}: GridCellUserAreaProps<T>) {
    profiler.trace();

    const customRect =
        context && cellPosition && context.puzzleIndex.allCells[cellPosition.top]?.[cellPosition.left]?.areCustomBounds
            ? context.getCellTransformedBounds(cellPosition.top, cellPosition.left).userArea
            : undefined;

    return customRect ? (
        <TransformedRectGraphics rect={customRect}>{children}</TransformedRectGraphics>
    ) : cellPosition ? (
        <AutoSvg {...cellPosition}>{children}</AutoSvg>
    ) : (
        <>{children}</>
    );
}) as <T extends AnyPTM>(props: GridCellUserAreaProps<T>) => ReactElement;
