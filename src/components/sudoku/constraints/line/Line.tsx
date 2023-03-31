import {RoundedPolyLine} from "../../../svg/rounded-poly-line/RoundedPolyLine";
import {withFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {parsePositionLiterals, PositionLiteral} from "../../../../types/layout/Position";
import {
    Constraint,
    ConstraintProps,
    ConstraintPropsGenericFc
} from "../../../../types/sudoku/Constraint";
import {splitMultiLine} from "../../../../utils/lines";
import {lightGreyColor} from "../../../app/globals";

export const lineTag = "line";

export interface LineProps {
    width?: number;
}

export const LineComponent = withFieldLayer(FieldLayer.regular, <CellType,>(
    {
        cells,
        color = lightGreyColor,
        props: {width = 0.15},
        context: {cellsIndex},
    }: ConstraintProps<CellType, LineProps>
) => <RoundedPolyLine
    points={cells.map(({left, top}) => {
        const cellInfo = cellsIndex.allCells[top]?.[left];
        return cellInfo
            ? {...cellInfo.center, radius: cellInfo.bounds.userArea.width * width / 2}
            : {left: left + 0.5, top: top + 0.5};
    })}
    strokeWidth={width}
    stroke={color}
/>) as ConstraintPropsGenericFc<LineProps>;

export const LineConstraint = <CellType, ExType, ProcessedExType>(
    cellLiterals: PositionLiteral[],
    color?: string,
    width?: number,
    split = true,
): Constraint<CellType, LineProps, ExType, ProcessedExType> => {
    let cells = parsePositionLiterals(cellLiterals);
    if (split) {
        cells = splitMultiLine(cells);
    }

    return {
        name: "line",
        tags: [lineTag],
        cells,
        color,
        props: {width},
        component: LineComponent,
    };
};
