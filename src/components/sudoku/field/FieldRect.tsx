import { ReactElement, ReactNode } from "react";
import { emptyPosition } from "../../../types/layout/Position";
import { AutoSvg } from "../../svg/auto-svg/AutoSvg";
import { Size } from "../../../types/layout/Size";
import { PuzzleContext } from "../../../types/sudoku/PuzzleContext";
import { TransformedRect, transformRect } from "../../../types/layout/Rect";
import { GridRegion } from "../../../types/sudoku/GridRegion";
import { TransformedRectGraphics } from "../../../contexts/TransformContext";
import { AnyPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../utils/profiler";

interface FieldRectProps<T extends AnyPTM> extends Omit<GridRegion, keyof Size>, Partial<Size> {
    context: PuzzleContext<T>;
    clip?: boolean;
    children: ReactNode;
}

export const FieldRect = observer(function FieldRect<T extends AnyPTM>({
    context,
    clip,
    cells,
    width = 1,
    height = 1,
    children,
    ...position
}: FieldRectProps<T>) {
    profiler.trace();

    const transformedRect = getFieldRectTransform(context, position);

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
                                    x={left - position.left}
                                    y={top - position.top}
                                    width={1}
                                    height={1}
                                    strokeWidth={0}
                                />
                            ))}
                        </>
                    ) : (
                        true
                    ))
                }
            >
                {children}
            </AutoSvg>
        </TransformedRectGraphics>
    );
}) as <T extends AnyPTM>(props: FieldRectProps<T>) => ReactElement;

export const getFieldRectTransform = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    { top, left, transformCoords: transformCoordsArg }: Omit<GridRegion, keyof Size>,
): TransformedRect => {
    const {
        puzzle: {
            typeManager: { transformCoords: typeManagerTransformCoords, isOddTransformCoords },
        },
    } = context;

    if (isOddTransformCoords) {
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
