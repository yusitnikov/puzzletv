import {createContext, useContext} from "react";
import {Absolute, AbsoluteProps} from "../../layout/absolute/Absolute";
import {useAutoIncrementId} from "../../../hooks/useAutoIncrementId";
import {Size} from "../../../types/layout/Size";

const SvgParentExistsContext = createContext<boolean>(false);

export const useSvgParentExists = () => useContext(SvgParentExistsContext);

export interface AutoSvgProps extends Size, Omit<AbsoluteProps<"svg">, "tagName" | "clip" | keyof Size> {
    clip?: boolean;
}

export const AutoSvg = ({children, clip, style, ...props}: AutoSvgProps) => {
    const svgParentExists = useSvgParentExists();

    const id = "cb" + useAutoIncrementId();

    const {
        left = 0,
        top = 0,
        width,
        height,
        angle = 0,
    } = props;

    if (!svgParentExists) {
        return <Absolute
            tagName={"svg"}
            style={{
                ...style,
                overflow: clip ? "hidden" : undefined,
            }}
            {...props}
        >
            <SvgParentExistsContext.Provider value={true}>
                {children}
            </SvgParentExistsContext.Provider>
        </Absolute>;
    }

    if (clip) {
        children = <>
            <defs>
                <clipPath id={id}>
                    <rect
                        x={0}
                        y={0}
                        width={width}
                        height={height}
                    />
                </clipPath>
            </defs>

            <g clipPath={`url(#${id})`}>
                {children}
            </g>
        </>;
    }

    if (left || top || style) {
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
