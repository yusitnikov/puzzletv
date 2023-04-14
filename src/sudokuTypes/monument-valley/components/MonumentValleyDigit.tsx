import {profiler} from "../../../utils/profiler";
import {Record} from "@emotion-icons/fluentui-system-filled";
import {ReactElement} from "react";
import {DigitProps} from "../../../components/sudoku/digit/DigitProps";
import {textColor} from "../../../components/app/globals";
import {AutoSvg} from "../../../components/svg/auto-svg/AutoSvg";
import {DigitComponentType} from "../../../components/sudoku/digit/DigitComponentType";
import {MonumentValleyPTM} from "../types/MonumentValleyPTM";

const width = 0.12;

const radius6 = 0.3;
const center6 = 0.5 - radius6;
const angle6 = Math.PI / 7;
const getLine6 = (radius: number) => {
    const y1 = center6 - radius * Math.sin(angle6);
    const x1 = -radius * Math.cos(angle6);
    const y2 = -0.5;
    const x2 = x1 + (y1 - y2) * Math.tan(angle6);
    return {x1, y1, x2, y2};
}
const outLine6 = getLine6(radius6);
const inLine6 = getLine6(radius6 - width);

const svgMap: Record<number, ReactElement> = {
    1: <circle
        cx={0}
        cy={0}
        r={0.5 - width / 2}
        fill={"none"}
        strokeWidth={width}
        stroke={"currentColor"}
    />,
    2: <path
        d={`
            M -0.25 ${0.3 - width / 2}
            Q ${-0.5 + width / 2} ${0.3 - width / 2} ${-0.5 + width / 2} 0
            T -0.25 ${-0.3 + width / 2}
            Q -0.1 ${-0.3 + width / 2} 0 0
            T 0.25 ${0.3 - width / 2}
            Q ${0.5 - width / 2} ${0.3 - width / 2} ${0.5 - width / 2} 0
            T 0.25 ${-0.3 + width / 2}
            Q 0.1 ${-0.3 + width / 2} 0 0
            T -0.25 ${0.3 - width / 2}
            Z
        `}
        fill={"none"}
        strokeWidth={width}
        stroke={"currentColor"}
    />,
    3: <path
        d={`
            M ${0.3 - width / 2} -0.25
            Q ${0.3 - width / 2} ${-0.5 + width / 2} 0 ${-0.5 + width / 2}
            T ${-0.3 + width / 2} -0.25
            Q ${-0.3 + width / 2} -0.1 0 0
            T ${0.3 - width / 2} 0.25
            Q ${0.3 - width / 2} ${0.5 - width / 2} 0 ${0.5 - width / 2}
            T ${-0.3 + width / 2} 0.25
            Q ${-0.3 + width / 2} 0.1 0 0
            T ${0.3 - width / 2} -0.25
            Z
        `}
        fill={"none"}
        strokeWidth={width}
        stroke={"currentColor"}
    />,
    4: <line
        x1={-0.5}
        y1={0}
        x2={0.5}
        y2={0}
        fill={"none"}
        strokeWidth={width}
        stroke={"currentColor"}
    />,
    5: <line
        x1={0}
        y1={-0.5}
        x2={0}
        y2={0.5}
        fill={"none"}
        strokeWidth={width}
        stroke={"currentColor"}
    />,
    6: <>
        <circle
            cx={-center6}
            cy={0}
            r={radius6 - width / 2}
            fill={"none"}
            strokeWidth={width}
            stroke={"currentColor"}
        />
        <path
            d={`
                M ${-outLine6.y1} ${outLine6.x1}
                L ${-outLine6.y2} ${outLine6.x2}
                L ${-inLine6.y2} ${inLine6.x2}
                L ${-inLine6.y1} ${inLine6.x1}
                Z
            `}
            fill={"currentColor"}
            strokeWidth={0}
        />
    </>,
    7: <>
        <circle
            cx={0}
            cy={center6}
            r={radius6 - width / 2}
            fill={"none"}
            strokeWidth={width}
            stroke={"currentColor"}
        />
        <path
            d={`
                M ${outLine6.x1} ${outLine6.y1}
                L ${outLine6.x2} ${outLine6.y2}
                L ${inLine6.x2} ${inLine6.y2}
                L ${inLine6.x1} ${inLine6.y1}
                Z
            `}
            fill={"currentColor"}
            strokeWidth={0}
        />
    </>,
    8: <>
        <circle
            cx={center6}
            cy={0}
            r={radius6 - width / 2}
            fill={"none"}
            strokeWidth={width}
            stroke={"currentColor"}
        />
        <path
            d={`
                M ${outLine6.y1} ${-outLine6.x1}
                L ${outLine6.y2} ${-outLine6.x2}
                L ${inLine6.y2} ${-inLine6.x2}
                L ${inLine6.y1} ${-inLine6.x1}
                Z
            `}
            fill={"currentColor"}
            strokeWidth={0}
        />
    </>,
    9: <>
        <circle
            cx={0}
            cy={-center6}
            r={radius6 - width / 2}
            fill={"none"}
            strokeWidth={width}
            stroke={"currentColor"}
        />
        <path
            d={`
                M ${-outLine6.x1} ${-outLine6.y1}
                L ${-outLine6.x2} ${-outLine6.y2}
                L ${-inLine6.x2} ${-inLine6.y2}
                L ${-inLine6.x1} ${-inLine6.y1}
                Z
            `}
            fill={"currentColor"}
            strokeWidth={0}
        />
    </>,
};

export const MonumentValleyDigit = profiler.memo<DigitProps<MonumentValleyPTM>>("MonumentValleyDigit", (
    {puzzle, digit, size, color = textColor, ...containerProps}
) => <AutoSvg
    width={size}
    height={size}
    {...containerProps}
>
    <MonumentValleyDigitSvgContent
        puzzle={puzzle}
        digit={digit}
        size={size}
        color={color}
    />
</AutoSvg>);

export const MonumentValleyDigitSvgContent = profiler.memo<DigitProps<MonumentValleyPTM>>("MonumentValleyDigitSvgContent", (
    {digit, size, color, left = 0, top = 0}
) => {
    return <g
        transform={`translate(${left} ${top}) scale(${size * 0.7})`}
        color={color}
    >
        {svgMap[digit]}
    </g>;
});

export const MonumentValleyDigitComponentType: DigitComponentType<MonumentValleyPTM> = {
    component: MonumentValleyDigit,
    svgContentComponent: MonumentValleyDigitSvgContent,
    widthCoeff: 0.8,
};
