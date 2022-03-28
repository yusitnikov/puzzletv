import {ReactNode} from "react";
import {Rect} from "../../../types/layout/Rect";
import {Line} from "../line/Line";

export type AbsoluteProps<TagNameT extends keyof JSX.IntrinsicElements = "div"> = Partial<Rect> & JSX.IntrinsicElements[TagNameT] & {
    tagName?: TagNameT;
    angle?: number;
    borderWidth?: number;
    borderColor?: string;
    pointerEvents?: boolean;
    children?: ReactNode;
};

export const Absolute = <TagNameT extends keyof JSX.IntrinsicElements = "div">(
    {
        children,
        tagName = "div" as TagNameT,
        angle = 0,
        borderWidth,
        borderColor,
        left = 0,
        top = 0,
        width = 0,
        height = 0,
        style,
        pointerEvents,
        ...otherProps
    }: AbsoluteProps<TagNameT>
) => {
    const TagName = tagName as any;

    return <TagName
        style={{
            position: "absolute",
            left: `${left}px`,
            top: `${top}px`,
            width: `${width}px`,
            height: `${height}px`,
            transform: `rotate(${angle}deg)`,
            pointerEvents: pointerEvents ? "all" : "none",
            ...style,
        }}
        {...otherProps}
    >
        {children}

        {(!!borderWidth || !!borderColor) && <>
            <Line x1={0} y1={0} x2={width} y2={0} width={borderWidth} color={borderColor}/>
            <Line x1={0} y1={0} x2={0} y2={height} width={borderWidth} color={borderColor}/>
            <Line x1={0} y1={height} x2={width} y2={height} width={borderWidth} color={borderColor}/>
            <Line x1={width} y1={0} x2={width} y2={height} width={borderWidth} color={borderColor}/>
        </>}
    </TagName>;
};
