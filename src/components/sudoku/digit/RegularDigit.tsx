import {memo} from "react";
import {textColor} from "../../app/globals";
import {DigitProps} from "./DigitProps";
import {DigitComponentType} from "./DigitComponentType";
import {AutoSvg} from "../../svg/auto-svg/AutoSvg";
import {CenteredText} from "../../svg/centered-text/CenteredText";
import {profiler} from "../../../utils/profiler";

export const RegularDigit = profiler.memo<DigitProps>("RegularDigit", ({digit, size, color = textColor, ...containerProps}: DigitProps) => <AutoSvg
    width={size}
    height={size}
    {...containerProps}
>
    <RegularDigitSvgContent
        digit={digit}
        size={size}
        color={color}
    />
</AutoSvg>);

export const RegularDigitSvgContent = profiler.memo<DigitProps>("RegularDigitSvgContent", ({digit, size, color, left = 0, top = 0}: DigitProps) => <CenteredText
    left={left}
    top={top}
    size={size}
    fill={color}
>
    {digit}
</CenteredText>);

export const RegularDigitComponentType: DigitComponentType = {
    component: RegularDigit,
    svgContentComponent: RegularDigitSvgContent,
    widthCoeff: 0.6,
};
