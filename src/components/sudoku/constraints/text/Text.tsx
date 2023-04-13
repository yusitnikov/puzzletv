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
import {AnyPTM} from "../../../../types/sudoku/PuzzleTypeMap";

export interface TextProps {
    text: string;
    size?: number;
}

export const TextComponent = (layer = FieldLayer.lines) => withFieldLayer(layer, <T extends AnyPTM>(
    {cells: [{top, left}], angle = 0, color = textColor, props: {text, size = 0.5}}: ConstraintProps<T, TextProps>
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

export const textTag = "text";

export const TextConstraint = <T extends AnyPTM>(
    cellLiterals: PositionLiteral[],
    text: string,
    color?: string,
    size?: number,
    angle?: number,
    layer = FieldLayer.lines,
): Constraint<T, TextProps> => {
    return {
        name: `text: ${text}`,
        tags: [textTag],
        cells: [getAveragePosition(parsePositionLiterals(cellLiterals))],
        props: {text, size},
        color,
        angle,
        layer,
        component: TextComponent(layer),
        renderSingleCellInUserArea: true,
    };
};
