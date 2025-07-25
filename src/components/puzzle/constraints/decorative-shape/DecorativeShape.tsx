import { textColor } from "../../../app/globals";
import { GridLayer } from "../../../../types/puzzle/GridLayer";
import { getAveragePosition, parsePositionLiterals, PositionLiteral } from "../../../../types/layout/Position";
import { Constraint, ConstraintProps, ConstraintPropsGenericFc } from "../../../../types/puzzle/Constraint";
import { CenteredText } from "../../../svg/centered-text/CenteredText";
import { AutoSvg } from "../../../svg/auto-svg/AutoSvg";
import { Size } from "../../../../types/layout/Size";
import { ComponentType, SVGAttributes } from "react";
import { AnyPTM } from "../../../../types/puzzle/PuzzleTypeMap";
import { resolveCellColorValue } from "../../../../types/puzzle/CellColor";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../../utils/profiler";
import { ArrowEnd } from "../../../svg/arrow-end/ArrowEnd";
import { parseColorWithOpacity } from "../../../../utils/color";

export const cosmeticTag = "cosmetic";

export const defaultCosmeticShapeBorderWidth = 0.03;

export interface DecorativeShapeProps extends Size {
    borderColor?: string;
    text?: string;
    textColor?: string;
    borderWidth?: number;
}

export const DecorativeShapeComponent = <T extends AnyPTM>(
    Component: ComponentType<Size & Omit<SVGAttributes<any>, keyof Size>>,
) =>
    observer(function DecorativeShapeComponent({
        context: {
            puzzle: {
                typeManager: {
                    digitComponentType: { widthCoeff },
                },
            },
        },
        cells,
        props: {
            width,
            height,
            borderColor,
            borderWidth = defaultCosmeticShapeBorderWidth,
            text,
            textColor: textC = textColor,
        },
        color: backgroundColor = "none",
        angle = 0,
    }: ConstraintProps<T, DecorativeShapeProps>) {
        profiler.trace();

        const { top, left } = getAveragePosition(cells);

        return (
            <AutoSvg top={top + 0.5} left={left + 0.5} angle={angle}>
                <Component
                    width={width}
                    height={height}
                    fill={backgroundColor}
                    stroke={borderColor || "none"}
                    strokeWidth={borderColor ? borderWidth : 0}
                />

                {!!text && (
                    <CenteredText size={Math.min(0.5, width / (text.length + 1) / widthCoeff, height)} fill={textC}>
                        {text}
                    </CenteredText>
                )}
            </AutoSvg>
        );
    } as ConstraintPropsGenericFc<DecorativeShapeProps>);

const RectComponent = DecorativeShapeComponent(
    observer(function RectFc(props) {
        profiler.trace();

        return <rect x={-props.width / 2} y={-props.height / 2} {...props} />;
    }),
);

const EllipseComponent = DecorativeShapeComponent(
    observer(function EllipseFc({ width, height, ...props }) {
        profiler.trace();

        return <ellipse cx={0} cy={0} rx={width / 2} ry={height / 2} {...props} />;
    }),
);

const ArrowComponent = DecorativeShapeComponent(
    observer(function ArrowFc({ width, height, stroke = textColor, strokeWidth = 0 }) {
        profiler.trace();

        const { rgb, a } = parseColorWithOpacity(stroke);
        strokeWidth = Number(strokeWidth);

        return (
            <g opacity={a}>
                <line x1={-width / 2} x2={width / 2 - strokeWidth / 2} stroke={rgb} strokeWidth={strokeWidth} />

                <ArrowEnd
                    position={{ top: 0, left: width / 2 - strokeWidth / Math.SQRT2 }}
                    direction={{ top: 0, left: 1 }}
                    arrowSize={height / Math.SQRT2}
                    lineWidth={strokeWidth}
                    color={rgb}
                />
            </g>
        );
    }),
);

export const DecorativeShapeConstraint = <T extends AnyPTM>(
    name: string,
    layer: GridLayer,
    component: ComponentType<ConstraintProps<T, DecorativeShapeProps>>,
    cellLiterals: PositionLiteral[],
    size: Size | number,
    backgroundColor?: string,
    borderColor?: string,
    borderWidth?: number,
    text?: string,
    textColor?: string,
    angle?: number,
): Constraint<T, DecorativeShapeProps> => {
    return {
        name,
        tags: [name, cosmeticTag],
        cells: parsePositionLiterals(cellLiterals),
        props: {
            width: typeof size === "number" ? size : size.width,
            height: typeof size === "number" ? size : size.height,
            borderColor,
            text,
            textColor,
            borderWidth,
        },
        color: backgroundColor,
        angle,
        component: { [layer]: component },
        renderSingleCellInUserArea: true,
        clone(
            { props: { borderColor, textColor, ...props }, ...constraint },
            { processColor },
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
    borderWidth?: number,
    text?: string,
    textColor?: string,
    angle?: number,
    layer = GridLayer.afterLines,
) =>
    DecorativeShapeConstraint<T>(
        rectTag,
        layer,
        RectComponent,
        cellLiterals,
        size,
        backgroundColor,
        borderColor,
        borderWidth,
        text,
        textColor,
        angle,
    );

export const ellipseTag = "ellipse";
export const EllipseConstraint = <T extends AnyPTM>(
    cellLiterals: PositionLiteral[],
    size: Size | number,
    backgroundColor?: string,
    borderColor?: string,
    borderWidth?: number,
    text?: string,
    textColor?: string,
    angle?: number,
    layer = GridLayer.afterLines,
) =>
    DecorativeShapeConstraint<T>(
        ellipseTag,
        layer,
        EllipseComponent,
        cellLiterals,
        size,
        backgroundColor,
        borderColor,
        borderWidth,
        text,
        textColor,
        angle,
    );

export const cosmeticArrowTag = "cosmetic arrow";
export const CosmeticArrowConstraint = <T extends AnyPTM>(
    cellLiterals: PositionLiteral[],
    length: number,
    headSize: number,
    borderColor?: string,
    borderWidth?: number,
    text?: string,
    textColor?: string,
    angle?: number,
    layer = GridLayer.afterLines,
) =>
    DecorativeShapeConstraint<T>(
        cosmeticArrowTag,
        layer,
        ArrowComponent,
        cellLiterals,
        { width: length, height: headSize },
        undefined,
        borderColor,
        borderWidth,
        text,
        textColor,
        angle,
    );

export const isRect = <T extends AnyPTM>(item: Constraint<T, any>): item is Constraint<T, DecorativeShapeProps> =>
    item.tags?.includes(rectTag) ?? false;

export const isEllipse = <T extends AnyPTM>(item: Constraint<T, any>): item is Constraint<T, DecorativeShapeProps> =>
    item.tags?.includes(ellipseTag) ?? false;

export const isCosmeticConstraint = <T extends AnyPTM>(item: Constraint<T, any>): boolean =>
    item.tags?.includes(cosmeticTag) ?? false;
