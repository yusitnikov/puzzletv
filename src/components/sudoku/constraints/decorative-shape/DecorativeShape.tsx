import {textColor} from "../../../app/globals";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {getAveragePosition, parsePositionLiterals, PositionLiteral} from "../../../../types/layout/Position";
import {Constraint, ConstraintProps, ConstraintPropsGenericFc} from "../../../../types/sudoku/Constraint";
import {CenteredText} from "../../../svg/centered-text/CenteredText";
import {AutoSvg} from "../../../svg/auto-svg/AutoSvg";
import {Size} from "../../../../types/layout/Size";
import {ComponentType, SVGAttributes} from "react";
import {AnyPTM} from "../../../../types/sudoku/PuzzleTypeMap";
import {resolveCellColorValue} from "../../../../types/sudoku/CellColor";
import {observer} from "mobx-react-lite";
import {profiler} from "../../../../utils/profiler";

export interface DecorativeShapeProps extends Size {
    borderColor?: string;
    text?: string;
    textColor?: string;
}

export const DecorativeShapeComponent = <T extends AnyPTM>(
    Component: ComponentType<Size & Omit<SVGAttributes<any>, keyof Size>>
) => observer(function DecorativeShapeComponent(
    {
        context: {puzzle: {typeManager: {digitComponentType: {widthCoeff}}}},
        cells,
        props: {
            width,
            height,
            borderColor,
            text,
            textColor: textC = textColor,
        },
        color: backgroundColor = "none",
        angle = 0,
    }: ConstraintProps<T, DecorativeShapeProps>
) {
    profiler.trace();

    const {top, left} = getAveragePosition(cells);

    return <AutoSvg
        top={top + 0.5}
        left={left + 0.5}
        angle={angle}
    >
        <Component
            width={width}
            height={height}
            fill={backgroundColor}
            stroke={borderColor || "none"}
            strokeWidth={borderColor ? 0.03 : 0}
        />

        {!!text && <CenteredText
            size={Math.min(0.5, width / (text.length + 1) / widthCoeff, height)}
            fill={textC}
        >
            {text}
        </CenteredText>}
    </AutoSvg>;
} as ConstraintPropsGenericFc<DecorativeShapeProps>);

const RectComponent = DecorativeShapeComponent(observer(function RectFc(props) {
    profiler.trace();

    return <rect
        x={-props.width / 2}
        y={-props.height / 2}
        {...props}
    />;
}));

const EllipseComponent = DecorativeShapeComponent(observer(function EllipseFc({width, height, ...props}) {
    profiler.trace();

    return <ellipse
        cx={0}
        cy={0}
        rx={width / 2}
        ry={height / 2}
        {...props}
    />;
}));

export const DecorativeShapeConstraint = <T extends AnyPTM>(
    name: string,
    layer: FieldLayer,
    component: ComponentType<ConstraintProps<T, DecorativeShapeProps>>,
    cellLiterals: PositionLiteral[],
    size: Size | number,
    backgroundColor?: string,
    borderColor?: string,
    text?: string,
    textColor?: string,
    angle?: number
): Constraint<T, DecorativeShapeProps> => {
    return {
        name,
        tags: [name],
        cells: parsePositionLiterals(cellLiterals),
        props: {
            width: typeof size === "number" ? size : size.width,
            height: typeof size === "number" ? size : size.height,
            borderColor,
            text,
            textColor,
        },
        color: backgroundColor,
        angle,
        component: {[layer]: component},
        renderSingleCellInUserArea: true,
        clone(
            {props: {borderColor, textColor, ...props}, ...constraint},
            {processColor},
        ): Constraint<T, DecorativeShapeProps> {
            return {
                ...constraint,
                props: {
                    ...props,
                    borderColor: borderColor && resolveCellColorValue(processColor(borderColor)),
                    textColor: textColor && resolveCellColorValue(processColor(textColor)),
                },
            };
        },
    };
};

export const rectTag = "rect";
export const RectConstraint = <T extends AnyPTM>(
    cellLiterals: PositionLiteral[],
    size: Size | number,
    backgroundColor?: string,
    borderColor?: string,
    text?: string,
    textColor?: string,
    angle?: number,
    layer = FieldLayer.afterLines,
) => DecorativeShapeConstraint<T>(rectTag, layer, RectComponent, cellLiterals, size, backgroundColor, borderColor, text, textColor, angle);

export const ellipseTag = "ellipse";
export const EllipseConstraint = <T extends AnyPTM>(
    cellLiterals: PositionLiteral[],
    size: Size | number,
    backgroundColor?: string,
    borderColor?: string,
    text?: string,
    textColor?: string,
    angle?: number,
    layer = FieldLayer.afterLines,
) => DecorativeShapeConstraint<T>(ellipseTag, layer, EllipseComponent, cellLiterals, size, backgroundColor, borderColor, text, textColor, angle);
