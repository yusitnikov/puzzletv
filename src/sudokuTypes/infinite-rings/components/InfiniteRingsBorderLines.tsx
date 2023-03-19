import {withFieldLayer} from "../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../types/sudoku/FieldLayer";
import {Constraint, ConstraintProps, ConstraintPropsGenericFc} from "../../../types/sudoku/Constraint";
import {blackColor, getRegionBorderWidth} from "../../../components/app/globals";
import {RoundedPolyLine} from "../../../components/svg/rounded-poly-line/RoundedPolyLine";
import {useTransformScale} from "../../../contexts/TransformScaleContext";

export const getInfiniteLoopRegionBorderWidth = (cellSize: number) =>
    Math.ceil(getRegionBorderWidth(cellSize) * cellSize / 2) * 2;

export const InfiniteRingsBorderLines = withFieldLayer(FieldLayer.lines, ({context: {cellSize}}: ConstraintProps) => {
    const scale = useTransformScale();
    const borderWidth = getInfiniteLoopRegionBorderWidth(cellSize) / scale;

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
}) as ConstraintPropsGenericFc;

export const InfiniteRingsBorderLinesConstraint = <CellType, ExType, ProcessedExType>()
    : Constraint<CellType, undefined, ExType, ProcessedExType> => ({
    name: "region borders",
    cells: [],
    component: InfiniteRingsBorderLines,
    props: undefined,
});
