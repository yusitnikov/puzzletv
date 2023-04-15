import {textColor} from "../../../app/globals";
import {withFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {getAveragePosition, parsePositionLiterals, PositionLiteral} from "../../../../types/layout/Position";
import {Constraint, ConstraintProps, ConstraintPropsGenericFc} from "../../../../types/sudoku/Constraint";
import {CenteredText} from "../../../svg/centered-text/CenteredText";
import {AutoSvg} from "../../../svg/auto-svg/AutoSvg";
import {Size} from "../../../../types/layout/Size";
import {ComponentType, SVGAttributes} from "react";
import {AnyPTM} from "../../../../types/sudoku/PuzzleTypeMap";

export interface DecorativeShapeProps extends Size {
    borderColor?: string;
    text?: string;
    textColor?: string;
}

const DecorativeShapeComponent = <T extends AnyPTM>(
    Component: ComponentType<Size & Omit<SVGAttributes<any>, keyof Size>>,
    layer = FieldLayer.lines
) => {
    return withFieldLayer(layer, function DecorativeShapeComponent(
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
    }) as ConstraintPropsGenericFc<DecorativeShapeProps>;
};

export const RectComponent = (layer = FieldLayer.lines) => DecorativeShapeComponent((props) => <rect
    x={-props.width / 2}
    y={-props.height / 2}
    {...props}
/>, layer);

export const EllipseComponent = (layer = FieldLayer.lines) => DecorativeShapeComponent(({width, height, ...props}) => <ellipse
    cx={0}
    cy={0}
    rx={width / 2}
    ry={height / 2}
    {...props}
/>, layer);

const DecorativeShapeConstraint = <T extends AnyPTM>(
    name: string,
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
        component,
        renderSingleCellInUserArea: true,
    };
};

export const RectConstraint = <T extends AnyPTM>(
    cellLiterals: PositionLiteral[],
    size: Size | number,
    backgroundColor?: string,
    borderColor?: string,
    text?: string,
    textColor?: string,
    angle?: number,
    layer = FieldLayer.lines,
) => DecorativeShapeConstraint<T>("rect", RectComponent(layer), cellLiterals, size, backgroundColor, borderColor, text, textColor, angle);

export const EllipseConstraint = <T extends AnyPTM>(
    cellLiterals: PositionLiteral[],
    size: Size | number,
    backgroundColor?: string,
    borderColor?: string,
    text?: string,
    textColor?: string,
    angle?: number,
    layer = FieldLayer.lines,
) => DecorativeShapeConstraint<T>("ellipse", EllipseComponent(layer), cellLiterals, size, backgroundColor, borderColor, text, textColor, angle);
