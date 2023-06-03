import {textColor} from "../../../app/globals";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {getAveragePosition, parsePositionLiterals, PositionLiteral} from "../../../../types/layout/Position";
import {Constraint, ConstraintProps, ConstraintPropsGenericFc} from "../../../../types/sudoku/Constraint";
import {CenteredText} from "../../../svg/centered-text/CenteredText";
import {AutoSvg} from "../../../svg/auto-svg/AutoSvg";
import {AnyPTM} from "../../../../types/sudoku/PuzzleTypeMap";
import {profiler} from "../../../../utils/profiler";
import {observer} from "mobx-react-lite";

export interface TextProps {
    text: string;
    size?: number;
}

export const TextComponent: ConstraintPropsGenericFc<TextProps> = observer(function TextFc<T extends AnyPTM>(
    {cells, angle = 0, color = textColor, props: {text, size = 0.5}}: ConstraintProps<T, TextProps>
) {
    profiler.trace();

    const {top, left} = getAveragePosition(cells);

    return <AutoSvg
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
    </AutoSvg>;
});

export const textTag = "text";

export const TextConstraint = <T extends AnyPTM>(
    cellLiterals: PositionLiteral[],
    text: string,
    color?: string,
    size?: number,
    angle?: number,
    layer = FieldLayer.afterLines,
): Constraint<T, TextProps> => {
    return {
        name: `text: ${text}`,
        tags: [textTag],
        cells: parsePositionLiterals(cellLiterals),
        props: {text, size},
        color,
        angle,
        layer,
        component: {[layer]: TextComponent},
        renderSingleCellInUserArea: true,
    };
};
