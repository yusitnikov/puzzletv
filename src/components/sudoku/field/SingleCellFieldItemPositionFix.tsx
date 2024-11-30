import { Position } from "../../../types/layout/Position";
import { AutoSvg } from "../../svg/auto-svg/AutoSvg";
import { HashSet } from "../../../types/struct/Set";
import { PuzzleContext } from "../../../types/sudoku/PuzzleContext";
import { FieldCellUserArea } from "./FieldCellUserArea";
import { AnyPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { ReactElement, ReactNode } from "react";
import { GridRegion } from "../../../types/sudoku/GridRegion";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../utils/profiler";

export interface SingleCellFieldItemPositionFixProps<T extends AnyPTM> {
    context: PuzzleContext<T>;
    position: Position;
    region?: GridRegion;
    children: ReactNode;
}

export const SingleCellFieldItemPositionFix = observer(function SingleCellFieldItemPositionFix<T extends AnyPTM>({
    context,
    position,
    region,
    children,
}: SingleCellFieldItemPositionFixProps<T>) {
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
        <AutoSvg {...(context.puzzle.customCellBounds ? {} : position)}>
            <FieldCellUserArea context={context} cellPosition={position}>
                {children}
            </FieldCellUserArea>
        </AutoSvg>
    );
}) as <T extends AnyPTM>(props: SingleCellFieldItemPositionFixProps<T>) => ReactElement;
