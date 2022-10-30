import {textColor} from "../../../app/globals";
import {withFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {getAveragePosition, parsePositionLiterals, PositionLiteral} from "../../../../types/layout/Position";
import {Constraint, ConstraintProps, ConstraintPropsGenericFc} from "../../../../types/sudoku/Constraint";
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

const DecorativeShapeComponent = <CellType, >(Component: ComponentType<Size & Omit<SVGAttributes<any>, keyof Size>>) => {
    return withFieldLayer(FieldLayer.lines, function DecorativeShapeComponent(
        {
            cells: [{top, left}],
            props: {
                width,
                height,
                borderColor,
                text,
                textColor: textC = textColor,
            },
            color: backgroundColor = "none",
            angle = 0,
        }: ConstraintProps<CellType, DecorativeShapeProps>
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
    }) as ConstraintPropsGenericFc<DecorativeShapeProps>;
};

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

const DecorativeShapeConstraint = <CellType, ExType, ProcessedExType>(
    name: string,
    component: ComponentType<ConstraintProps<CellType, DecorativeShapeProps, ExType, ProcessedExType>>,
    cellLiterals: PositionLiteral[],
    size: Size | number,
    backgroundColor?: string,
    borderColor?: string,
    text?: string,
    textColor?: string,
    angle?: number
): Constraint<CellType, DecorativeShapeProps, ExType, ProcessedExType> => {
    return {
        name,
        cells: [getAveragePosition(parsePositionLiterals(cellLiterals))],
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
    };
};

export const RectConstraint = <CellType, ExType, ProcessedExType>(
    cellLiterals: PositionLiteral[],
    size: Size | number,
    backgroundColor?: string,
    borderColor?: string,
    text?: string,
    textColor?: string,
    angle?: number
) => DecorativeShapeConstraint<CellType, ExType, ProcessedExType>("rect", RectComponent, cellLiterals, size, backgroundColor, borderColor, text, textColor, angle);

export const EllipseConstraint = <CellType, ExType, ProcessedExType>(
    cellLiterals: PositionLiteral[],
    size: Size | number,
    backgroundColor?: string,
    borderColor?: string,
    text?: string,
    textColor?: string,
    angle?: number
) => DecorativeShapeConstraint<CellType, ExType, ProcessedExType>("ellipse", EllipseComponent, cellLiterals, size, backgroundColor, borderColor, text, textColor, angle);
