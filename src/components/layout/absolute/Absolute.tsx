import { ReactElement, ReactNode } from "react";
import { Rect } from "../../../types/layout/Rect";
import { Line } from "../line/Line";
import { TransformAngleContextProvider, TransformScaleContextProvider } from "../../../contexts/TransformContext";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../utils/profiler";

export type AbsoluteProps<TagNameT extends keyof JSX.IntrinsicElements = "div"> = Partial<Rect> &
    JSX.IntrinsicElements[TagNameT] & {
        tagName?: TagNameT;
        angle?: number;
        scale?: number;
        fitParent?: boolean;
        borderWidth?: number;
        borderColor?: string;
        pointerEvents?: boolean;
        children?: ReactNode;
        childrenOnTopOfBorders?: boolean;
    };

export const Absolute = observer(function Absolute<TagNameT extends keyof JSX.IntrinsicElements = "div">({
    children,
    childrenOnTopOfBorders,
    tagName = "div" as TagNameT,
    angle = 0,
    scale = 1,
    borderWidth,
    borderColor,
    left = 0,
    top = 0,
    width = 0,
    height = 0,
    fitParent = false,
    style,
    pointerEvents,
    ...otherProps
}: AbsoluteProps<TagNameT>) {
    profiler.trace();

    const TagName = tagName as any;

    let result = (
        <TagName
            style={{
                position: "absolute",
                left: fitParent ? 0 : `${left}px`,
                top: fitParent ? 0 : `${top}px`,
                width: fitParent ? "100%" : `${width}px`,
                height: fitParent ? "100%" : `${height}px`,
                transform: `rotate(${angle}deg) scale(${scale})`,
                pointerEvents: pointerEvents ? "all" : "none",
                ...style,
            }}
            {...otherProps}
        >
            {!childrenOnTopOfBorders && children}

            {(!!borderWidth || !!borderColor) && (
                <>
                    <Line x1={0} y1={0} x2={width} y2={0} width={borderWidth} color={borderColor} />
                    <Line x1={0} y1={0} x2={0} y2={height} width={borderWidth} color={borderColor} />
                    <Line x1={0} y1={height} x2={width} y2={height} width={borderWidth} color={borderColor} />
                    <Line x1={width} y1={0} x2={width} y2={height} width={borderWidth} color={borderColor} />
                </>
            )}

            {childrenOnTopOfBorders && children}
        </TagName>
    );

    if (scale !== 1) {
        result = <TransformScaleContextProvider scale={scale}>{result}</TransformScaleContextProvider>;
    }
    if (angle !== 0) {
        result = <TransformAngleContextProvider angle={angle}>{result}</TransformAngleContextProvider>;
    }

    return result;
}) as <TagNameT extends keyof JSX.IntrinsicElements = "div">(props: AbsoluteProps<TagNameT>) => ReactElement;
