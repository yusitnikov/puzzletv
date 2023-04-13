import {ReactNode, useMemo} from "react";
import {emptyPosition, formatSvgPointsArray} from "../../../types/layout/Position";
import {AutoSvg} from "../../svg/auto-svg/AutoSvg";
import {Size} from "../../../types/layout/Size";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {TransformedRect, transformRect} from "../../../types/layout/Rect";
import {GridRegion} from "../../../types/sudoku/GridRegion";
import {TransformedRectGraphics} from "../../../contexts/TransformScaleContext";
import {getRegionBorders} from "../../../utils/regions";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";

interface FieldRectProps<T extends AnyPTM> extends Omit<GridRegion, keyof Size>, Partial<Size> {
    context: PuzzleContext<T>;
    clip?: boolean;
    children: ReactNode;
}

export const FieldRect = <T extends AnyPTM>(
    {
        context,
        clip,
        cells,
        width = 1,
        height = 1,
        children,
        ...position
    }: FieldRectProps<T>
) => {
    const transformedRect = getFieldRectTransform(context, position);

    const clipBorders = useMemo(
        // TODO: support custom cell bounds
        () => cells && getRegionBorders(
            cells.map(({top, left}) => ({
                top: top - position.top,
                left: left - position.left,
            })),
            1
        ),
        [cells, position.top, position.left]
    );

    return <TransformedRectGraphics rect={transformedRect}>
        <AutoSvg
            width={width}
            height={height}
            clip={
                clipBorders
                    ? <polygon
                        points={formatSvgPointsArray(clipBorders)}
                        strokeWidth={0}
                        stroke={"none"}
                    />
                    : clip
            }
        >
            {children}
        </AutoSvg>
    </TransformedRectGraphics>;
};

export const getFieldRectTransform = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    {top, left, transformCoords: transformCoordsArg}: Omit<GridRegion, keyof Size>,
): TransformedRect => {
    const {
        puzzle: {
            typeManager: {
                transformCoords: typeManagerTransformCoords,
                isOddTransformCoords,
            },
        },
    } = context;

    if (isOddTransformCoords) {
        return {
            base: emptyPosition,
            rightVector: {top: 0, left: 1},
            bottomVector: {top: 1, left: 0},
        };
    }

    return transformRect(
        {top, left, width: 1, height: 1},
        position => (transformCoordsArg ?? typeManagerTransformCoords)?.(position, context) ?? position,
        0.1
    );
};
