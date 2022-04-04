import {memo} from "react";
import {Absolute} from "../../layout/absolute/Absolute";
import {svgShadowStyle, textColor} from "../../app/globals";
import {DigitProps} from "./DigitProps";
import {DigitComponentType} from "./DigitComponentType";

export const RegularDigit = memo<DigitProps>(({digit, size, color = textColor, ...containerProps}: DigitProps) => <Absolute
    {...containerProps}
    style={{
        ...svgShadowStyle,
        color,
    }}
>
    <div
        style={{
            position: "absolute",
            fontSize: size,
            lineHeight: `${size}px`,
            transform: "translate(-50%, -50%)",
        }}
    >
        {digit}
    </div>
</Absolute>);

export const RegularDigitSvgContent = memo<DigitProps>(({digit, size, left = 0, top = 0}: DigitProps) => <text
    x={left}
    y={top}
    textAnchor={"middle"}
    alignmentBaseline={"central"}
    style={{
        fontSize: `${size}px`,
        lineHeight: `${size}px`,
    }}
>
    {digit}
</text>);

export const RegularDigitComponentType: DigitComponentType = {
    component: RegularDigit,
    svgContentComponent: RegularDigitSvgContent,
    widthCoeff: 0.6,
};
