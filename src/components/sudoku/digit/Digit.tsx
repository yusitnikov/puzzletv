import {memo} from "react";
import {Absolute, AbsoluteProps} from "../../layout/absolute/Absolute";
import {textColor} from "../../app/globals";
import {Position} from "../../../types/layout/Position";

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
export const digitWidthCoeff = squareSizeCoeff + lineWidthCoeff;
// width + margin
export const digitSpaceCoeff = digitWidthCoeff + lineWidthCoeff;

export interface DigitProps extends AbsoluteProps {
    digit: number;
    size: number;
    color?: string;
}

export const Digit = memo(({digit, size, color = textColor, ...containerProps}: DigitProps) => <Absolute
    {...containerProps}
    style={{color}}
>
    <Absolute
        tagName={"svg"}
        left={-size * digitWidthCoeff / 2}
        top={-size / 2}
        width={size * digitWidthCoeff}
        height={size}
        style={{filter: "drop-shadow(0px 0px 2px white)"}}
    >
        {matrices[digit].flatMap((matrixRow, rowIndex) => matrixRow.map((enabled, columnIndex) => enabled && <DigitLine
            key={`${rowIndex}-${columnIndex}`}
            left={size * (columnIndex - 1) * squareSizeCoeff / 2 + size * digitWidthCoeff / 2}
            top={size * (rowIndex - 2) * squareSizeCoeff / 2 + size / 2}
            size={size}
            vertical={!!(rowIndex % 2)}
        />))}
    </Absolute>
</Absolute>);

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
