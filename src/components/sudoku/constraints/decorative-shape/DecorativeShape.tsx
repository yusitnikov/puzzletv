import {textColor} from "../../../app/globals";
import {withFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {getAveragePosition, parsePositionLiterals, PositionLiteral} from "../../../../types/layout/Position";
import {Constraint, ConstraintProps} from "../../../../types/sudoku/Constraint";
import {CenteredText} from "../../../svg/centered-text/CenteredText";
import {AutoSvg} from "../../../svg/auto-svg/AutoSvg";
import {Size} from "../../../../types/layout/Size";
import {useDigitComponentType} from "../../../../contexts/DigitComponentTypeContext";
import {ComponentType, SVGAttributes} from "react";

export interface DecorativeShapeProps extends Size {
    borderColor?: string;
    text?: string;
    textColor?: string;
}

const DecorativeShapeComponent = (Component: ComponentType<Size & Omit<SVGAttributes<any>, keyof Size>>) => withFieldLayer(FieldLayer.lines, function DecorativeShapeComponent(
    {
        cells: [{top, left}],
        width,
        height,
        color: backgroundColor = "none",
        borderColor,
        text,
        textColor: textC = textColor,
        angle = 0,
    }: ConstraintProps<any, DecorativeShapeProps>
) {
    const {widthCoeff} = useDigitComponentType();

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
});

export const RectComponent = DecorativeShapeComponent((props) => <rect
    x={-props.width / 2}
    y={-props.height / 2}
    {...props}
/>);

export const EllipseComponent = DecorativeShapeComponent(({width, height, ...props}) => <ellipse
    cx={0}
    cy={0}
    rx={width / 2}
    ry={height / 2}
    {...props}
/>);

const DecorativeShapeConstraint = <CellType,>(
    name: string,
    component: ComponentType<ConstraintProps<CellType, DecorativeShapeProps>>,
    cellLiterals: PositionLiteral[],
    size: Size | number,
    backgroundColor?: string,
    borderColor?: string,
    text?: string,
    textColor?: string,
    angle?: number
): Constraint<CellType, DecorativeShapeProps> => {
    return ({
        name,
        cells: [getAveragePosition(parsePositionLiterals(cellLiterals))],
        width: typeof size === "number" ? size : size.width,
        height: typeof size === "number" ? size : size.height,
        color: backgroundColor,
        borderColor,
        text,
        textColor,
        angle,
        component,
    });
};

export const RectConstraint = <CellType,>(
    cellLiterals: PositionLiteral[],
    size: Size | number,
    backgroundColor?: string,
    borderColor?: string,
    text?: string,
    textColor?: string,
    angle?: number
) => DecorativeShapeConstraint<CellType>("rect", RectComponent, cellLiterals, size, backgroundColor, borderColor, text, textColor, angle);

export const EllipseConstraint = <CellType,>(
    cellLiterals: PositionLiteral[],
    size: Size | number,
    backgroundColor?: string,
    borderColor?: string,
    text?: string,
    textColor?: string,
    angle?: number
) => DecorativeShapeConstraint<CellType>("ellipse", EllipseComponent, cellLiterals, size, backgroundColor, borderColor, text, textColor, angle);
