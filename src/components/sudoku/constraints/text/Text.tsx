import {textColor} from "../../../app/globals";
import {withFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {getAveragePosition, parsePositionLiterals, PositionLiteral} from "../../../../types/layout/Position";
import {Constraint, ConstraintProps} from "../../../../types/sudoku/Constraint";
import {CenteredText} from "../../../svg/centered-text/CenteredText";
import {AutoSvg} from "../../../svg/auto-svg/AutoSvg";

export interface TextProps {
    text: string;
    size?: number;
}

export const TextComponent = (layer = FieldLayer.lines) => withFieldLayer(layer, (
    {cells: [{top, left}], text, size = 0.5, angle = 0, color = textColor}: ConstraintProps<any, TextProps>
) => <AutoSvg
    top={top + 0.5}
    left={left + 0.5}
    angle={angle}
>
    <CenteredText
        size={size}
        fill={color}
    >
        {text}
    </CenteredText>
</AutoSvg>);

export const TextConstraint = <CellType,>(
    cellLiterals: PositionLiteral[],
    text: string,
    color?: string,
    size?: number,
    angle?: number,
    layer = FieldLayer.lines,
): Constraint<CellType, TextProps> => {
    return ({
        name: `text: ${text}`,
        cells: [getAveragePosition(parsePositionLiterals(cellLiterals))],
        text,
        color,
        size,
        angle,
        component: TextComponent(layer),
    });
};
