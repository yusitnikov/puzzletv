import {Constraint, ConstraintProps, ConstraintPropsGenericFcMap} from "../../../types/sudoku/Constraint";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";
import {FieldLayer} from "../../../types/sudoku/FieldLayer";
import {observer} from "mobx-react-lite";
import {isCellInRect, Rect} from "../../../types/layout/Rect";
import {CellSelectionColor} from "../../../components/sudoku/cell/CellSelection";

const borderWidth = 0.1;

const CaterpillarGridFocus: ConstraintPropsGenericFcMap<Rect> = {
    [FieldLayer.beforeBackground]: observer(function CaterpillarGridBacckground<T extends AnyPTM>({props: {top, left, width, height}}: ConstraintProps<T, Rect>) {
        return <rect
            x={left}
            y={top}
            width={width}
            height={height}
            fill={"#fff"}
            stroke={"none"}
            strokeWidth={0}
        />;
    }),
    [FieldLayer.beforeSelection]: observer(function CaterpillarGridFocus<T extends AnyPTM>({context: {selectedCells}, props: bounds}: ConstraintProps<T, Rect>) {
        if (!selectedCells.items.some(cell => isCellInRect(bounds, cell))) {
            return null;
        }

        return <rect
            x={bounds.left - borderWidth / 2}
            y={bounds.top - borderWidth / 2}
            width={bounds.width + borderWidth}
            height={bounds.height + borderWidth}
            fill={"none"}
            stroke={CellSelectionColor.secondary}
            strokeWidth={borderWidth}
        />;
    }),
}

export const CaterpillarGridFocusConstraint = <T extends AnyPTM>(bounds: Rect): Constraint<T, Rect> => ({
    name: "caterpillar grid",
    cells: [],
    props: bounds,
    component: CaterpillarGridFocus,
});
