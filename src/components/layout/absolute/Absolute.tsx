import {ElementType, FC, HTMLAttributes} from "react";
import {Rect} from "../../../types/layout/Rect";
import {Line} from "../line/Line";

export interface AbsoluteProps extends Partial<Rect>, HTMLAttributes<any> {
    tagName?: ElementType;
    angle?: number;
    borderWidth?: number;
    borderColor?: string;
}

export const Absolute: FC<AbsoluteProps> = (
    {
        children,
        tagName: TagName = "div",
        angle = 0,
        borderWidth,
        borderColor,
        left = 0,
        top = 0,
        width = 0,
        height = 0,
        style,
        ...otherProps
    }
) => {
    return <TagName
        style={{
            position: "absolute",
            left: `${left}px`,
            top: `${top}px`,
            width: `${width}px`,
            height: `${height}px`,
            transform: `rotate(${angle}deg)`,
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
