import {memo} from "react";
import {textColor} from "../../app/globals";
import {DigitProps} from "./DigitProps";
import {DigitComponentType} from "./DigitComponentType";
import {AutoSvg} from "../../svg/auto-svg/AutoSvg";
import {CenteredText} from "../../svg/centered-text/CenteredText";

export const RegularDigit = memo<DigitProps>(({digit, size, color = textColor, ...containerProps}: DigitProps) => <AutoSvg
    width={size}
    height={size}
    {...containerProps}
    style={{color}}
>
    <RegularDigitSvgContent
        digit={digit}
        size={size}
    />
</AutoSvg>);

export const RegularDigitSvgContent = memo<DigitProps>(({digit, size, left = 0, top = 0}: DigitProps) => <CenteredText
    left={left}
    top={top}
    size={size}
>
    {digit}
</CenteredText>);

export const RegularDigitComponentType: DigitComponentType = {
    component: RegularDigit,
    svgContentComponent: RegularDigitSvgContent,
    widthCoeff: 0.6,
};
