import {ReactNode} from "react";
import {Rect} from "../../../types/layout/Rect";
import {Line} from "../line/Line";

export type AbsoluteProps<TagNameT extends keyof JSX.IntrinsicElements = "div"> = Partial<Rect> & JSX.IntrinsicElements[TagNameT] & {
    tagName?: TagNameT;
    angle?: number;
    fitParent?: boolean;
    borderWidth?: number;
    borderColor?: string;
    pointerEvents?: boolean;
    children?: ReactNode;
    childrenOnTopOfBorders?: boolean;
};

export const Absolute = <TagNameT extends keyof JSX.IntrinsicElements = "div">(
    {
        children,
        childrenOnTopOfBorders,
        tagName = "div" as TagNameT,
        angle = 0,
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
    }: AbsoluteProps<TagNameT>
) => {
    const TagName = tagName as any;

    return <TagName
        style={{
            position: "absolute",
            left: fitParent ? 0 : `${left}px`,
            top: fitParent ? 0 : `${top}px`,
            width: fitParent ? "100%" : `${width}px`,
            height: fitParent ? "100%" : `${height}px`,
            transform: `rotate(${angle}deg)`,
            pointerEvents: pointerEvents ? "all" : "none",
            ...style,
        }}
        {...otherProps}
    >
        {!childrenOnTopOfBorders && children}

        {(!!borderWidth || !!borderColor) && <>
            <Line x1={0} y1={0} x2={width} y2={0} width={borderWidth} color={borderColor}/>
            <Line x1={0} y1={0} x2={0} y2={height} width={borderWidth} color={borderColor}/>
            <Line x1={0} y1={height} x2={width} y2={height} width={borderWidth} color={borderColor}/>
            <Line x1={width} y1={0} x2={width} y2={height} width={borderWidth} color={borderColor}/>
        </>}

        {childrenOnTopOfBorders && children}
    </TagName>;
};
