import {FieldLayer} from "../../../types/sudoku/FieldLayer";
import {Constraint, ConstraintProps} from "../../../types/sudoku/Constraint";
import {blackColor, getRegionBorderWidth} from "../../../components/app/globals";
import {RoundedPolyLine} from "../../../components/svg/rounded-poly-line/RoundedPolyLine";
import {useTransformScale} from "../../../contexts/TransformContext";
import {useIsShowingAllInfiniteRings} from "../types/InfiniteRingsLayout";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";

export const getInfiniteLoopRegionBorderWidth = (cellSize: number, visibleRingsCount: number) =>
    Math.ceil(getRegionBorderWidth(cellSize) * cellSize / Math.pow(2, visibleRingsCount / 4) / 2) * 2;

interface InfiniteRingsBorderLinesProps {
    visibleRingsCount: number;
}

export const InfiniteRingsBorderLines = {
    [FieldLayer.lines]: <T extends AnyPTM>(
        {
            context,
            props: {visibleRingsCount: visibleRingsCountArg},
        }: ConstraintProps<T, InfiniteRingsBorderLinesProps>
    ) => {
        const {
            puzzle: {fieldSize: {rowsCount: fieldSize}},
            cellSize,
        } = context;
        const [isShowingAllInfiniteRings] = useIsShowingAllInfiniteRings(context, visibleRingsCountArg);
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
                rounded={false}
            />

            <RoundedPolyLine
                points={[
                    {top: 2, left: 0},
                    {top: 2, left: 4},
                ]}
                stroke={blackColor}
                strokeWidth={borderWidth}
                rounded={false}
            />
        </>;
    },
};

export const InfiniteRingsBorderLinesConstraint = <T extends AnyPTM>(visibleRingsCount: number)
    : Constraint<T, InfiniteRingsBorderLinesProps> => ({
    name: "region borders",
    cells: [],
    component: InfiniteRingsBorderLines,
    props: {visibleRingsCount},
});
