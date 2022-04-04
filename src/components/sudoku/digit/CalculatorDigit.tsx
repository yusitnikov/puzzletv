import {memo} from "react";
import {Absolute} from "../../layout/absolute/Absolute";
import {svgShadowStyle, textColor} from "../../app/globals";
import {Position} from "../../../types/layout/Position";
import {DigitProps} from "./DigitProps";
import {DigitComponentType} from "./DigitComponentType";

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

export const CalculatorDigit = memo<DigitProps>(({digit, size, color = textColor, ...containerProps}: DigitProps) => <Absolute
    {...containerProps}
    style={{color}}
>
    <Absolute
        tagName={"svg"}
        left={-size * digitWidthCoeff / 2}
        top={-size / 2}
        width={size * digitWidthCoeff}
        height={size}
        style={svgShadowStyle}
    >
        <CalculatorDigitSvgContent
            digit={digit}
            size={size}
            left={size * digitWidthCoeff / 2}
            top={size / 2}
        />
    </Absolute>
</Absolute>);

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
    points={
        [
            [
                lineWidthCoeff + lineSpacingCoeff,
                0
            ],
            [
                digitWidthCoeff - lineWidthCoeff - lineSpacingCoeff,
                0
            ],
            [
                digitWidthCoeff - lineWidthCoeff / 2 - lineSpacingCoeff,
                lineWidthCoeff / 2
            ],
            [
                digitWidthCoeff - lineWidthCoeff - lineSpacingCoeff,
                lineWidthCoeff
            ],
            [
                lineWidthCoeff + lineSpacingCoeff,
                lineWidthCoeff
            ],
            [
                lineWidthCoeff / 2 + lineSpacingCoeff,
                lineWidthCoeff / 2
            ],
        ]
            .map(([x, y]) => vertical ? [y, x] : [x, y])
            .map(([x, y]) => [
                left + size * (x - (vertical ? lineWidthCoeff : digitWidthCoeff) / 2),
                top + size * (y - (vertical ? digitWidthCoeff : lineWidthCoeff) / 2)
            ])
            .map(([x, y]) => `${x},${y}`)
            .join(" ")
    }
    fill={"currentColor"}
/>);

export const CalculatorDigitComponentType: DigitComponentType = {
    component: CalculatorDigit,
    svgContentComponent: CalculatorDigitSvgContent,
    widthCoeff: digitWidthCoeff + lineWidthCoeff,
};
