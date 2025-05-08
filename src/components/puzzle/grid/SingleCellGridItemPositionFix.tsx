import { Position } from "../../../types/layout/Position";
import { AutoSvg } from "../../svg/auto-svg/AutoSvg";
import { HashSet } from "../../../types/struct/Set";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";
import { GridCellUserArea } from "./GridCellUserArea";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { ReactElement, ReactNode } from "react";
import { GridRegion } from "../../../types/puzzle/GridRegion";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../utils/profiler";

export interface SingleCellGridItemPositionFixProps<T extends AnyPTM> {
    context: PuzzleContext<T>;
    position: Position;
    region?: GridRegion;
    children: ReactNode;
}

export const SingleCellGridItemPositionFix = observer(function SingleCellGridItemPositionFixFn<T extends AnyPTM>({
    context,
    position,
    region,
    children,
}: SingleCellGridItemPositionFixProps<T>) {
    profiler.trace();

    const processedPosition = context.puzzle.typeManager.processCellDataPosition?.(
        context,
        { ...position, angle: 0 },
        new HashSet<T["cell"]>(),
        0,
        () => ({ ...position, angle: 0 }),
        position,
        region,
    );

    if (processedPosition?.angle) {
        children = (
            <AutoSvg top={0.5} left={0.5} angle={processedPosition.angle}>
                <AutoSvg top={-0.5} left={-0.5}>
                    {children}
                </AutoSvg>
            </AutoSvg>
        );
    }

    return (
        <GridCellUserArea context={context} cellPosition={position}>
            {children}
        </GridCellUserArea>
    );
}) as <T extends AnyPTM>(props: SingleCellGridItemPositionFixProps<T>) => ReactElement;
