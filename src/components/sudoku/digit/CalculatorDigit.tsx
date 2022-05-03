import {memo} from "react";
import {textColor} from "../../app/globals";
import {formatSvgPointsArray, Position} from "../../../types/layout/Position";
import {DigitProps} from "./DigitProps";
import {DigitComponentType} from "./DigitComponentType";
import {AutoSvg} from "../../svg/auto-svg/AutoSvg";

const T = true;
const F = false;
const matrices = [
    // 0
    [],
    // 1
    [
        [F, F, F],
        [F, T, F],
        [F, F, F],
        [F, T, F],
        [F, F, F],
    ],
    // 2
    [
        [F, T, F],
        [F, F, T],
        [F, T, F],
        [T, F, F],
        [F, T, F],
    ],
    // 3
    [
        [F, T, F],
        [F, F, T],
        [F, T, F],
        [F, F, T],
        [F, T, F],
    ],
    // 4
    [
        [F, F, F],
        [T, F, T],
        [F, T, F],
        [F, F, T],
        [F, F, F],
    ],
    // 5
    [
        [F, T, F],
        [T, F, F],
        [F, T, F],
        [F, F, T],
        [F, T, F],
    ],
    // 6
    [
        [F, T, F],
        [T, F, F],
        [F, T, F],
        [T, F, T],
        [F, T, F],
    ],
    // 7
    [
        [F, T, F],
        [F, F, T],
        [F, F, F],
        [F, F, T],
        [F, F, F],
    ],
    // 8
    [
        [F, T, F],
        [T, F, T],
        [F, T, F],
        [T, F, T],
        [F, T, F],
    ],
    // 9
    [
        [F, T, F],
        [T, F, T],
        [F, T, F],
        [F, F, T],
        [F, T, F],
    ],
];

const lineWidthCoeff = 0.1;
const lineSpacingCoeff = lineWidthCoeff * 0.3;
const squareSizeCoeff = (1 - lineWidthCoeff) / 2;
const digitWidthCoeff = squareSizeCoeff + lineWidthCoeff;

export const CalculatorDigit = memo<DigitProps>(({digit, size, color = textColor, ...containerProps}: DigitProps) => <AutoSvg
    width={size}
    height={size}
    {...containerProps}
    style={{color}}
>
    <CalculatorDigitSvgContent
        digit={digit}
        size={size}
    />
</AutoSvg>);

export const CalculatorDigitSvgContent = memo<DigitProps>(({digit, size, left = 0, top = 0}: DigitProps) => <>
    {matrices[digit].flatMap((matrixRow, rowIndex) => matrixRow.map((enabled, columnIndex) => enabled && <DigitLine
        key={`${rowIndex}-${columnIndex}`}
        left={left + size * (columnIndex - 1) * squareSizeCoeff / 2}
        top={top + size * (rowIndex - 2) * squareSizeCoeff / 2}
        size={size}
        vertical={!!(rowIndex % 2)}
    />))}
</>);

interface DigitLineProps extends Position {
    size: number;
    vertical: boolean;
}

const DigitLine = memo(({left, top, size, vertical}: DigitLineProps) => <polygon
    points={formatSvgPointsArray(
        [
            {
                left: lineWidthCoeff + lineSpacingCoeff,
                top: 0
            },
            {
                left: digitWidthCoeff - lineWidthCoeff - lineSpacingCoeff,
                top: 0
            },
            {
                left: digitWidthCoeff - lineWidthCoeff / 2 - lineSpacingCoeff,
                top: lineWidthCoeff / 2
            },
            {
                left: digitWidthCoeff - lineWidthCoeff - lineSpacingCoeff,
                top: lineWidthCoeff
            },
            {
                left: lineWidthCoeff + lineSpacingCoeff,
                top: lineWidthCoeff
            },
            {
                left: lineWidthCoeff / 2 + lineSpacingCoeff,
                top: lineWidthCoeff / 2
            },
        ]
            .map(coords => (vertical ? {left: coords.top, top: coords.left} : coords))
            .map(({left: x, top: y}) => ({
                left: left + size * (x - (vertical ? lineWidthCoeff : digitWidthCoeff) / 2),
                top: top + size * (y - (vertical ? digitWidthCoeff : lineWidthCoeff) / 2)
            }))
    )}
    fill={"currentColor"}
/>);

export const CalculatorDigitComponentType: DigitComponentType = {
    component: CalculatorDigit,
    svgContentComponent: CalculatorDigitSvgContent,
    widthCoeff: digitWidthCoeff + lineWidthCoeff,
};
