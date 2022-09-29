import {memo} from "react";
import {textColor} from "../../app/globals";
import {formatSvgPointsArray, Position} from "../../../types/layout/Position";
import {DigitProps} from "./DigitProps";
import {DigitComponentType} from "./DigitComponentType";
import {AutoSvg} from "../../svg/auto-svg/AutoSvg";

const T = true;
const F = false;
const getMatrices = (centerOne: boolean): boolean[][][] => [
    // 0
    [],
    // 1
    centerOne
        ? [
            [F, F, F],
            [F, T, F],
            [F, F, F],
            [F, T, F],
            [F, F, F],
        ]
        : [
            [F, F, F],
            [F, F, T],
            [F, F, F],
            [F, F, T],
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
const matricesCentered = getMatrices(true);
const matricesRegular = getMatrices(false);

const lineWidthCoeff = 0.1;
const lineSpacingCoeff = lineWidthCoeff * 0.3;
const squareSizeCoeff = (1 - lineWidthCoeff) / 2;
const digitWidthCoeff = squareSizeCoeff + lineWidthCoeff;

export const CenteredCalculatorDigit = memo<DigitProps>(({digit, size, color = textColor, ...containerProps}: DigitProps) => <AutoSvg
    width={size}
    height={size}
    {...containerProps}
>
    <CenteredCalculatorDigitSvgContent
        digit={digit}
        size={size}
        color={color}
    />
</AutoSvg>);
export const RegularCalculatorDigit = memo<DigitProps>(({digit, size, color = textColor, ...containerProps}: DigitProps) => <AutoSvg
    width={size}
    height={size}
    {...containerProps}
>
    <RegularCalculatorDigitSvgContent
        digit={digit}
        size={size}
        color={color}
    />
</AutoSvg>);

export const getCalculatorDigitSvgContent = (centerOne: boolean) => memo<DigitProps>(({digit, size, color, left = 0, top = 0}: DigitProps) => <>
    {(centerOne ? matricesCentered : matricesRegular)[digit].flatMap((matrixRow, rowIndex) => matrixRow.map((enabled, columnIndex) => enabled && <DigitLine
        key={`${rowIndex}-${columnIndex}`}
        left={left + size * (columnIndex - 1) * squareSizeCoeff / 2}
        top={top + size * (rowIndex - 2) * squareSizeCoeff / 2}
        size={size}
        vertical={!!(rowIndex % 2)}
        color={color}
    />))}
</>);
const CenteredCalculatorDigitSvgContent = getCalculatorDigitSvgContent(true);
const RegularCalculatorDigitSvgContent = getCalculatorDigitSvgContent(false);

interface DigitLineProps extends Position {
    size: number;
    vertical: boolean;
    color?: string;
}

const DigitLine = memo(({left, top, size, vertical, color = "currentColor"}: DigitLineProps) => <polygon
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
    fill={color}
/>);

export const CenteredCalculatorDigitComponentType: DigitComponentType = {
    component: CenteredCalculatorDigit,
    svgContentComponent: CenteredCalculatorDigitSvgContent,
    widthCoeff: digitWidthCoeff + lineWidthCoeff,
};
export const RegularCalculatorDigitComponentType: DigitComponentType = {
    component: RegularCalculatorDigit,
    svgContentComponent: RegularCalculatorDigitSvgContent,
    widthCoeff: digitWidthCoeff + lineWidthCoeff,
};
