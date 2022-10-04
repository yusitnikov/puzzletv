import {textColor} from "../../app/globals";
import {DigitProps} from "./DigitProps";
import {DigitComponentType} from "./DigitComponentType";
import {AutoSvg} from "../../svg/auto-svg/AutoSvg";
import {profiler} from "../../../utils/profiler";
import {Record} from "@emotion-icons/fluentui-system-filled";
import {ReactElement} from "react";

const width = 0.12;
const height = 0.1;
const widthMap: Record<number, number> = {
    1: 0.3,
    2: 0.55,
};

const svgMap: Record<number, ReactElement> = {
    1: <rect
        x={-width / 2}
        y={-0.5}
        width={width}
        height={1}
        fill={"currentColor"}
        strokeWidth={0}
    />,
    2: <>
        <rect
            x={-0.15 - width / 2}
            y={-0.5}
            width={width}
            height={1}
            fill={"currentColor"}
            strokeWidth={0}
        />
        <rect
            x={0.15 - width / 2}
            y={-0.5}
            width={width}
            height={1}
            fill={"currentColor"}
            strokeWidth={0}
        />
    </>,
    3: <>
        <rect
            x={-0.3}
            y={-0.5}
            width={width}
            height={1}
            fill={"currentColor"}
            strokeWidth={0}
        />
        <rect
            x={-width / 2}
            y={-0.5}
            width={width}
            height={1}
            fill={"currentColor"}
            strokeWidth={0}
        />
        <rect
            x={0.3 - width}
            y={-0.5}
            width={width}
            height={1}
            fill={"currentColor"}
            strokeWidth={0}
        />
    </>,
    4: <>
        <path
            d={`
                M -0.3 -0.5
                h ${width}
                L ${width / 2} 0.5
                h ${-width}
                Z
            `}
            fill={"currentColor"}
            strokeWidth={0}
        />
        <path
            d={`
                M 0.3 -0.5
                h ${-width}
                L ${-width / 2} 0.5
                h ${width}
                Z
            `}
            fill={"currentColor"}
            strokeWidth={0}
        />
    </>,
    5: <>
        <path
            d={`
                M -0.3 -0.5
                h ${width}
                L 0.3 0.5
                h ${-width}
                Z
            `}
            fill={"currentColor"}
            strokeWidth={0}
        />
        <path
            d={`
                M 0.3 -0.5
                h ${-width}
                L -0.3 0.5
                h ${width}
                Z
            `}
            fill={"currentColor"}
            strokeWidth={0}
        />
    </>,
    6: <path
        d={`
            M -0.3 -0.5
            h ${width}
            V ${0.5 - height}
            H 0.3
            V 0.5
            H -0.3
            Z
        `}
        fill={"currentColor"}
        strokeWidth={0}
    />,
    7: <path
        d={`
            M 0.05 -0.5
            Q -0.3 -0.5 -0.3 0
            T 0.05 0.5
            Q 0.2 0.5 0.3 0.4
            l ${-height * 0.7} ${-height * 0.7}
            Q ${0.2 - height * 0.7} ${0.5 - height} 0.05 ${0.5 - height}
            Q ${-0.3 + width} ${0.5 - height} ${-0.3 + width} 0
            T 0.05 ${-0.5 + height}
            Q ${0.2 - height * 0.7} ${-0.5 + height} ${0.3 - height * 0.7} ${-0.4 + height * 0.7}
            L 0.3 -0.4
            Q 0.2 -0.5 0.05 -0.5
            Z
        `}
        fill={"currentColor"}
        fillRule={"evenodd"}
        strokeWidth={0}
    />,
    8: <path
        d={`
            M -0.3 -0.5
            H 0
            Q 0.3 -0.5 0.3 0
            T 0 0.5
            H -0.3
            Z

            M ${-0.3 + width} ${-0.5 + height}
            H 0
            Q ${0.3 - width} ${-0.5 + height} ${0.3 - width} 0
            T 0 ${0.5 - height}
            H ${-0.3 + width}
            Z
        `}
        fill={"currentColor"}
        fillRule={"evenodd"}
        strokeWidth={0}
    />,
    9: <>
        <rect
            x={-0.3}
            y={-0.5}
            width={width}
            height={1}
            fill={"currentColor"}
            strokeWidth={0}
        />
        <path
            d={`
                M -0.3 -0.5
                h ${width}
                L ${width / 2} 0.3
                h ${-width}
                Z
            `}
            fill={"currentColor"}
            strokeWidth={0}
        />
        <path
            d={`
                M 0.3 -0.5
                h ${-width}
                L ${-width / 2} 0.3
                h ${width}
                Z
            `}
            fill={"currentColor"}
            strokeWidth={0}
        />
        <rect
            x={0.3 - width}
            y={-0.5}
            width={width}
            height={1}
            fill={"currentColor"}
            strokeWidth={0}
        />
    </>,
};

export const LatinDigit = profiler.memo<DigitProps>("LatinDigit", ({digit, size, color = textColor, ...containerProps}: DigitProps) => <AutoSvg
    width={size}
    height={size}
    {...containerProps}
>
    <LatinDigitSvgContent
        digit={digit}
        size={size}
        color={color}
    />
</AutoSvg>);

export const LatinDigitSvgContent = profiler.memo<DigitProps>("LatinDigitSvgContent", ({digit, size, color, left = 0, top = 0}: DigitProps) => {
    const width = widthMap[digit] ?? 0.7;

    return <g
        transform={`translate(${left} ${top}) scale(${size * 0.7})`}
        color={color}
    >
        <rect
            x={-width / 2}
            y={-0.5 - height}
            width={width}
            height={height / 2}
            fill={color}
            strokeWidth={0}
        />
        {svgMap[digit]}
        <rect
            x={-width / 2}
            y={0.5 + height / 2}
            width={width}
            height={height / 2}
            fill={color}
            strokeWidth={0}
        />
    </g>;
});

export const LatinDigitComponentType: DigitComponentType = {
    component: LatinDigit,
    svgContentComponent: LatinDigitSvgContent,
    widthCoeff: 0.6,
};
