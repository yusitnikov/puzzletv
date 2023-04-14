import {textColor} from "../../app/globals";
import {DigitProps, DigitPropsGenericFc} from "./DigitProps";
import {DigitComponentType} from "./DigitComponentType";
import {AutoSvg} from "../../svg/auto-svg/AutoSvg";
import {CenteredText} from "../../svg/centered-text/CenteredText";
import {profiler} from "../../../utils/profiler";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";

export const RegularDigit = profiler.memo("RegularDigit", <T extends AnyPTM>({puzzle, digit, size, color = textColor, ...containerProps}: DigitProps<T>) => <AutoSvg
    width={size}
    height={size}
    {...containerProps}
>
    <RegularDigitSvgContent
        puzzle={puzzle}
        digit={digit}
        size={size}
        color={color}
    />
</AutoSvg>) as DigitPropsGenericFc;

export const RegularDigitSvgContent = profiler.memo("RegularDigitSvgContent", <T extends AnyPTM>(
    {digit, size, color, left = 0, top = 0}: DigitProps<T>
) => <CenteredText
    left={left}
    top={top}
    size={size}
    fill={color}
>
    {digit}
</CenteredText>) as DigitPropsGenericFc;

export const RegularDigitComponentType = <T extends AnyPTM>(): DigitComponentType<T> => ({
    component: RegularDigit,
    svgContentComponent: RegularDigitSvgContent,
    widthCoeff: 0.6,
});
