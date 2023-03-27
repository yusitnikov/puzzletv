import {withFieldLayer} from "../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../types/sudoku/FieldLayer";
import {Constraint, ConstraintProps, ConstraintPropsGenericFc} from "../../../types/sudoku/Constraint";
import {blackColor, getRegionBorderWidth} from "../../../components/app/globals";
import {RoundedPolyLine} from "../../../components/svg/rounded-poly-line/RoundedPolyLine";
import {useTransformScale} from "../../../contexts/TransformScaleContext";
import {indexes} from "../../../utils/indexes";
import {useIsShowingAllInfiniteRings} from "../types/InfiniteRingsLayout";

export const getInfiniteLoopRegionBorderWidth = (cellSize: number) =>
    Math.ceil(getRegionBorderWidth(cellSize) * cellSize / 2) * 2;

export const InfiniteRingsBorderLines = withFieldLayer(FieldLayer.lines, (
    {
        context: {
            puzzle: {fieldSize: {rowsCount: fieldSize}},
            cellSize,
        },
    }: ConstraintProps
) => {
    const [isShowingAllInfiniteRings] = useIsShowingAllInfiniteRings();
    const scale = useTransformScale();
    const borderWidth = getInfiniteLoopRegionBorderWidth(cellSize) / scale;
    const ringsCount = fieldSize / 2 - 1;

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

        {isShowingAllInfiniteRings && indexes(ringsCount, true).map((ring) => {
            const scaleCoeff = Math.pow(2, ring);

            return <RoundedPolyLine
                key={`ring-${ring}`}
                points={[
                    {top: 2 + 2 / scaleCoeff, left: 2 + 2 / scaleCoeff},
                    {top: 2 + 2 / scaleCoeff, left: 2 - 2 / scaleCoeff},
                    {top: 2 - 2 / scaleCoeff, left: 2 - 2 / scaleCoeff},
                    {top: 2 - 2 / scaleCoeff, left: 2 + 2 / scaleCoeff},
                    {top: 2 + 2 / scaleCoeff, left: 2 + 2 / scaleCoeff},
                ]}
                stroke={blackColor}
                strokeWidth={borderWidth}
            />;
        })}
    </>;
}) as ConstraintPropsGenericFc;

export const InfiniteRingsBorderLinesConstraint = <CellType, ExType, ProcessedExType>()
    : Constraint<CellType, undefined, ExType, ProcessedExType> => ({
    name: "region borders",
    cells: [],
    component: InfiniteRingsBorderLines,
    props: undefined,
});
