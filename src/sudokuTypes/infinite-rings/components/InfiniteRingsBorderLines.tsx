import {ReactElement} from "react";
import {withFieldLayer} from "../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../types/sudoku/FieldLayer";
import {Constraint, ConstraintProps} from "../../../types/sudoku/Constraint";
import {blackColor, getRegionBorderWidth} from "../../../components/app/globals";
import {RoundedPolyLine} from "../../../components/svg/rounded-poly-line/RoundedPolyLine";
import {useTransformScale} from "../../../contexts/TransformScaleContext";
import {useIsShowingAllInfiniteRings} from "../types/InfiniteRingsLayout";

export const getInfiniteLoopRegionBorderWidth = (cellSize: number, visibleRingsCount: number) =>
    Math.ceil(getRegionBorderWidth(cellSize) * cellSize / Math.pow(2, visibleRingsCount / 4) / 2) * 2;

interface InfiniteRingsBorderLinesProps {
    visibleRingsCount: number;
}

export const InfiniteRingsBorderLines = withFieldLayer(FieldLayer.lines, <CellType, ExType, ProcessedExType>(
    {
        context,
        props: {visibleRingsCount: visibleRingsCountArg},
    }: ConstraintProps<CellType, InfiniteRingsBorderLinesProps, ExType, ProcessedExType>
) => {
    const {
        puzzle: {fieldSize: {rowsCount: fieldSize}},
        cellSize,
    } = context;
    const [isShowingAllInfiniteRings] = useIsShowingAllInfiniteRings(context);
    const scale = useTransformScale();
    const ringsCount = fieldSize / 2 - 1;
    const visibleRingsCount = isShowingAllInfiniteRings ? ringsCount : visibleRingsCountArg;
    const borderWidth = getInfiniteLoopRegionBorderWidth(cellSize, visibleRingsCount) / scale;

    return <>
        <RoundedPolyLine
            points={[
                {top: 0, left: 2},
                {top: 4, left: 2},
            ]}
            stroke={blackColor}
            strokeWidth={borderWidth}
        />

        <RoundedPolyLine
            points={[
                {top: 2, left: 0},
                {top: 2, left: 4},
            ]}
            stroke={blackColor}
            strokeWidth={borderWidth}
        />
    </>;
}) as <CellType, ExType, ProcessedExType>(props: ConstraintProps<CellType, InfiniteRingsBorderLinesProps, ExType, ProcessedExType>) => ReactElement;

export const InfiniteRingsBorderLinesConstraint = <CellType, ExType, ProcessedExType>(visibleRingsCount: number)
    : Constraint<CellType, InfiniteRingsBorderLinesProps, ExType, ProcessedExType> => ({
    name: "region borders",
    cells: [],
    component: InfiniteRingsBorderLines,
    props: {visibleRingsCount},
});
