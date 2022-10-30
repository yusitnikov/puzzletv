import {textColor} from "../../../app/globals";
import {withFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {getAveragePosition, parsePositionLiterals, PositionLiteral} from "../../../../types/layout/Position";
import {
    Constraint,
    ConstraintProps,
    ConstraintPropsGenericFc
} from "../../../../types/sudoku/Constraint";
import {CenteredText} from "../../../svg/centered-text/CenteredText";
import {AutoSvg} from "../../../svg/auto-svg/AutoSvg";

export interface TextProps {
    text: string;
    size?: number;
}

export const TextComponent = (layer = FieldLayer.lines) => withFieldLayer(layer, (
    {cells: [{top, left}], angle = 0, color = textColor, props: {text, size = 0.5}}: ConstraintProps<unknown, TextProps>
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
</AutoSvg>) as ConstraintPropsGenericFc<TextProps>;

export const TextConstraint = <CellType, ExType, ProcessedExType>(
    cellLiterals: PositionLiteral[],
    text: string,
    color?: string,
    size?: number,
    angle?: number,
    layer = FieldLayer.lines,
): Constraint<CellType, TextProps, ExType, ProcessedExType> => {
    return {
        name: `text: ${text}`,
        cells: [getAveragePosition(parsePositionLiterals(cellLiterals))],
        props: {text, size},
        color,
        angle,
        component: TextComponent(layer),
    };
};
