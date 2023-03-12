import {createContext, ReactNode, useContext} from "react";
import {Absolute, AbsoluteProps} from "../../layout/absolute/Absolute";
import {useAutoIncrementId} from "../../../hooks/useAutoIncrementId";
import {profiler} from "../../../utils/profiler";
import {Rect} from "../../../types/layout/Rect";
import {TransformScaleContextProvider} from "../../../contexts/TransformScaleContext";

const SvgParentExistsContext = createContext<boolean>(false);

export const useSvgParentExists = () => useContext(SvgParentExistsContext);

export interface AutoSvgProps extends Omit<AbsoluteProps<"svg">, "tagName" | "clip" | "viewBox"> {
    viewBox?: Rect;
    clip?: boolean | ReactNode;
}

export const AutoSvg = ({children, viewBox, clip, style, ...props}: AutoSvgProps) => {
    profiler.track("AutoSvg").stop();
    if (clip) {
        profiler.track("AutoSvg.clip").stop();
    }
    const svgParentExists = useSvgParentExists();

    const id = "cb" + useAutoIncrementId();

    const {
        left = 0,
        top = 0,
        width = 0,
        height = 0,
        angle = 0,
    } = props;

    if (!svgParentExists) {
        return <Absolute
            tagName={"svg"}
            viewBox={viewBox ? `${viewBox.left} ${viewBox.top} ${viewBox.width} ${viewBox.height}` : undefined}
            style={{
                ...style,
                overflow: clip ? "hidden" : undefined,
            }}
            {...props}
        >
            <SvgParentExistsContext.Provider value={true}>
                {
                    viewBox
                        ? <TransformScaleContextProvider scale={width / viewBox.width}>
                            {children}
                        </TransformScaleContextProvider>
                        : children
                }
            </SvgParentExistsContext.Provider>
        </Absolute>;
    }

    if (clip) {
        children = <>
            <defs>
                <clipPath id={id}>
                    {clip !== true ? clip : <rect
                        x={0}
                        y={0}
                        width={width}
                        height={height}
                    />}
                </clipPath>
            </defs>

            <g clipPath={`url(#${id})`}>
                {children}
            </g>
        </>;
    }

    if (left || top || angle || style) {
        return <g
            transform={`translate(${left} ${top}) rotate(${angle})`}
            style={style}
        >
            {children}
        </g>;
    } else {
        return <>{children}</>;
    }
};
