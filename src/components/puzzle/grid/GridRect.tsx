import { ReactElement, ReactNode } from "react";
import { emptyPosition } from "../../../types/layout/Position";
import { AutoSvg } from "../../svg/auto-svg/AutoSvg";
import { Size } from "../../../types/layout/Size";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";
import { TransformedRect, transformRect } from "../../../types/layout/Rect";
import { GridRegion } from "../../../types/puzzle/GridRegion";
import { TransformedRectGraphics } from "../../../contexts/TransformContext";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../utils/profiler";

interface GridRectProps<T extends AnyPTM> extends Omit<GridRegion, keyof Size>, Partial<Size> {
    context: PuzzleContext<T>;
    clip?: boolean;
    children: ReactNode;
}

export const GridRect = observer(function GridRectFc<T extends AnyPTM>({
    context,
    clip,
    cells,
    width = 1,
    height = 1,
    children,
    ...position
}: GridRectProps<T>) {
    profiler.trace();

    const transformedRect = getGridRectTransform(context, position);

    const margin = context.puzzle.importOptions?.regionMargin ?? 0;

    return (
        <TransformedRectGraphics rect={transformedRect}>
            <AutoSvg
                width={width}
                height={height}
                clip={
                    clip &&
                    (cells ? (
                        <>
                            {cells.map(({ top, left }) => (
                                <rect
                                    key={`cell-${top}-${left}`}
                                    x={left - position.left - margin}
                                    y={top - position.top - margin}
                                    width={1 + margin * 2}
                                    height={1 + margin * 2}
                                    strokeWidth={0}
                                />
                            ))}
                        </>
                    ) : (
                        <rect
                            x={-margin}
                            y={-margin}
                            width={width + margin * 2}
                            height={height + margin * 2}
                            strokeWidth={0}
                        />
                    ))
                }
            >
                {children}
            </AutoSvg>
        </TransformedRectGraphics>
    );
}) as <T extends AnyPTM>(props: GridRectProps<T>) => ReactElement;

export const getGridRectTransform = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    { top, left, transformCoords: transformCoordsArg }: Omit<GridRegion, keyof Size>,
): TransformedRect => {
    const {
        puzzle: {
            typeManager: { transformCoords: typeManagerTransformCoords, isNonLinearTransformCoords },
        },
    } = context;

    if (isNonLinearTransformCoords) {
        return {
            base: emptyPosition,
            rightVector: { top: 0, left: 1 },
            bottomVector: { top: 1, left: 0 },
        };
    }

    return transformRect(
        { top, left, width: 1, height: 1 },
        (position) => (transformCoordsArg ?? typeManagerTransformCoords)?.(position, context) ?? position,
        0.1,
    );
};
