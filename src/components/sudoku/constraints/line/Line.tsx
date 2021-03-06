import {RoundedPolyLine} from "../../../svg/rounded-poly-line/RoundedPolyLine";
import {withFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {parsePositionLiterals, PositionLiteral} from "../../../../types/layout/Position";
import {Constraint, ConstraintProps} from "../../../../types/sudoku/Constraint";
import {splitMultiLine} from "../../../../utils/lines";
import {lightGreyColor} from "../../../app/globals";

export interface LineProps {
    width?: number;
}

export const LineComponent = withFieldLayer(FieldLayer.regular, ({cells, color = lightGreyColor, width = 0.15}: ConstraintProps<any, LineProps>) => <RoundedPolyLine
    points={cells.map(({left, top}) => ({left: left + 0.5, top: top + 0.5}))}
    strokeWidth={width}
    stroke={color}
/>);

export const LineConstraint = (cellLiterals: PositionLiteral[], color?: string, width?: number): Constraint<any, LineProps> => {
    const cells = splitMultiLine(parsePositionLiterals(cellLiterals));

    return {
        name: "line",
        cells,
        color,
        width,
        component: LineComponent,
    };
};
