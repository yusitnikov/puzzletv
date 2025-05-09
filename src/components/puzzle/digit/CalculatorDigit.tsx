import { textColor } from "../../app/globals";
import { formatSvgPointsArray, Position } from "../../../types/layout/Position";
import { DigitProps, DigitPropsGenericFc } from "./DigitProps";
import { DigitComponentType } from "./DigitComponentType";
import { AutoSvg } from "../../svg/auto-svg/AutoSvg";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { DigitRotationInfo } from "./DigitRotationInfo";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../utils/profiler";

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

export const CenteredCalculatorDigit = observer(function CenteredCalculatorDigit<T extends AnyPTM>({
    context,
    digit,
    size,
    color = textColor,
    ...containerProps
}: DigitProps<T>) {
    profiler.trace();

    return (
        <AutoSvg width={size} height={size} {...containerProps}>
            <CenteredCalculatorDigitSvgContent context={context} digit={digit} size={size} color={color} />
        </AutoSvg>
    );
}) as DigitPropsGenericFc;
export const RegularCalculatorDigit = observer(function RegularCalculatorDigit<T extends AnyPTM>({
    context,
    digit,
    size,
    color = textColor,
    ...containerProps
}: DigitProps<T>) {
    profiler.trace();

    return (
        <AutoSvg width={size} height={size} {...containerProps}>
            <RegularCalculatorDigitSvgContent context={context} digit={digit} size={size} color={color} />
        </AutoSvg>
    );
}) as DigitPropsGenericFc;

export const getCalculatorDigitSvgContent = (centerOne: boolean): DigitPropsGenericFc =>
    observer(function CalculatorDigitSvgContent<T extends AnyPTM>({
        digit,
        size,
        color,
        left = 0,
        top = 0,
    }: DigitProps<T>) {
        profiler.trace();

        return (
            <>
                {(centerOne ? matricesCentered : matricesRegular)[digit].flatMap((matrixRow, rowIndex) =>
                    matrixRow.map(
                        (enabled, columnIndex) =>
                            enabled && (
                                <DigitLine
                                    key={`${rowIndex}-${columnIndex}`}
                                    left={left + (size * (columnIndex - 1) * squareSizeCoeff) / 2}
                                    top={top + (size * (rowIndex - 2) * squareSizeCoeff) / 2}
                                    size={size}
                                    vertical={!!(rowIndex % 2)}
                                    color={color}
                                />
                            ),
                    ),
                )}
            </>
        );
    });
const CenteredCalculatorDigitSvgContent = getCalculatorDigitSvgContent(true);
const RegularCalculatorDigitSvgContent = getCalculatorDigitSvgContent(false);

interface DigitLineProps extends Position {
    size: number;
    vertical: boolean;
    color?: string;
}

const DigitLine = observer(function DigitLine({ left, top, size, vertical, color = "currentColor" }: DigitLineProps) {
    profiler.trace();

    // noinspection JSSuspiciousNameCombination
    return (
        <polygon
            points={formatSvgPointsArray(
                [
                    {
                        left: lineWidthCoeff + lineSpacingCoeff,
                        top: 0,
                    },
                    {
                        left: digitWidthCoeff - lineWidthCoeff - lineSpacingCoeff,
                        top: 0,
                    },
                    {
                        left: digitWidthCoeff - lineWidthCoeff / 2 - lineSpacingCoeff,
                        top: lineWidthCoeff / 2,
                    },
                    {
                        left: digitWidthCoeff - lineWidthCoeff - lineSpacingCoeff,
                        top: lineWidthCoeff,
                    },
                    {
                        left: lineWidthCoeff + lineSpacingCoeff,
                        top: lineWidthCoeff,
                    },
                    {
                        left: lineWidthCoeff / 2 + lineSpacingCoeff,
                        top: lineWidthCoeff / 2,
                    },
                ]
                    .map((coords) => (vertical ? { left: coords.top, top: coords.left } : coords))
                    .map(({ left: x, top: y }) => ({
                        left: left + size * (x - (vertical ? lineWidthCoeff : digitWidthCoeff) / 2),
                        top: top + size * (y - (vertical ? digitWidthCoeff : lineWidthCoeff) / 2),
                    })),
            )}
            fill={color}
        />
    );
});

export const CenteredCalculatorDigitComponentType = <T extends AnyPTM>(): DigitComponentType<T> => ({
    component: CenteredCalculatorDigit,
    svgContentComponent: CenteredCalculatorDigitSvgContent,
    widthCoeff: digitWidthCoeff + lineWidthCoeff,
    getDigitRotationInfo(digit): DigitRotationInfo {
        return {
            isRotatable: ![3, 4, 7].includes(digit),
            rotatesInto: [6, 9].includes(digit) ? 15 - digit : undefined,
        };
    },
});
export const RegularCalculatorDigitComponentType = <T extends AnyPTM>(): DigitComponentType<T> => ({
    ...CenteredCalculatorDigitComponentType(),
    component: RegularCalculatorDigit,
    svgContentComponent: RegularCalculatorDigitSvgContent,
});
