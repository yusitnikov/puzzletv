import { Constraint, ConstraintProps, ConstraintPropsGenericFcMap } from "../../../types/puzzle/Constraint";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { GridLayer } from "../../../types/puzzle/GridLayer";
import { observer } from "mobx-react-lite";
import { isCellInRect, Rect } from "../../../types/layout/Rect";
import { CellHighlightColor } from "../../../components/puzzle/cell/CellHighlight";

const borderWidth = 0.1;

const CaterpillarGridFocus: ConstraintPropsGenericFcMap<Rect> = {
    [GridLayer.beforeBackground]: observer(function CaterpillarGridBacckground<T extends AnyPTM>({
        props: { top, left, width, height },
    }: ConstraintProps<T, Rect>) {
        return <rect x={left} y={top} width={width} height={height} fill={"#fff"} stroke={"none"} strokeWidth={0} />;
    }),
    [GridLayer.beforeSelection]: observer(function CaterpillarGridFocus<T extends AnyPTM>({
        context: { selectedCells },
        props: bounds,
    }: ConstraintProps<T, Rect>) {
        if (!selectedCells.items.some((cell) => isCellInRect(bounds, cell))) {
            return null;
        }

        return (
            <rect
                x={bounds.left - borderWidth / 2}
                y={bounds.top - borderWidth / 2}
                width={bounds.width + borderWidth}
                height={bounds.height + borderWidth}
                fill={"none"}
                stroke={CellHighlightColor.secondary}
                strokeWidth={borderWidth}
            />
        );
    }),
};

export const CaterpillarGridFocusConstraint = <T extends AnyPTM>(bounds: Rect): Constraint<T, Rect> => ({
    name: "caterpillar grid",
    cells: [],
    props: bounds,
    component: CaterpillarGridFocus,
});
