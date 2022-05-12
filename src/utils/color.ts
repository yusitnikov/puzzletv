import {RGB} from "../types/struct/RGB";

// convert #xyz to #xxyyzz
export const normalizeColorStr = (color: string) =>
    color.length === 4
        ? "#" + color[1] + color[1] + color[2] + color[2] + color[3] + color[3]
        : color;

export const colorStrToRgb = (color: string): RGB => {
    color = normalizeColorStr(color);

    return processRgb(
        {
            red: color.substring(1, 3),
            green: color.substring(3, 5),
            blue: color.substring(5, 7),
        },
        str => parseInt(str, 16)
    );
};

export const processRgb = <T1, T2>({red, green, blue}: RGB<T1>, processor: (color: T1) => T2): RGB<T2> => ({
    red: processor(red),
    green: processor(green),
    blue: processor(blue),
});

export const rgbToColorStr = (color: RGB) => {
    const {red, green, blue} = processRgb(color, num => Math.round(num).toString(16).padStart(2, "0"));

    return `#${red}${green}${blue}`;
};

export const lightenColorStr = (color: string) => rgbToColorStr(
    processRgb(
        colorStrToRgb(color),
        num => (num + 255) / 2
    )
);
