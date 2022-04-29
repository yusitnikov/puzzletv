import {memo} from "react";
import {textColor} from "../../app/globals";
import {DigitProps} from "./DigitProps";
import {DigitComponentType} from "./DigitComponentType";
import {AutoSvg} from "../../svg/auto-svg/AutoSvg";

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

export const RegularDigitSvgContent = memo<DigitProps>(({digit, size, left = 0, top = 0}: DigitProps) => <text
    x={left}
    y={top}
    textAnchor={"middle"}
    alignmentBaseline={"central"}
    style={{
        fontSize: `${size}px`,
        lineHeight: `${size}px`,
    }}
    fill={"currentColor"}
>
    {digit}
</text>);

export const RegularDigitComponentType: DigitComponentType = {
    component: RegularDigit,
    svgContentComponent: RegularDigitSvgContent,
    widthCoeff: 0.6,
};
