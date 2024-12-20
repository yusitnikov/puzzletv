import { RGB } from "../types/struct/RGB";
import { average } from "./math";

// convert #xyz to #xxyyzz
export const normalizeColorStr = (color: string) =>
    color.length === 4 ? "#" + color[1] + color[1] + color[2] + color[2] + color[3] + color[3] : color;

export const colorStrToRgb = (color: string): RGB => {
    color = normalizeColorStr(color);

    return processRgb((str) => parseInt(str, 16), {
        red: color.substring(1, 3),
        green: color.substring(3, 5),
        blue: color.substring(5, 7),
    });
};

export const processRgb = <T1, T2>(processor: (...values: T1[]) => T2, ...colors: RGB<T1>[]): RGB<T2> => ({
    red: processor(...colors.map(({ red }) => red)),
    green: processor(...colors.map(({ green }) => green)),
    blue: processor(...colors.map(({ blue }) => blue)),
});

const colorPartToHex = (num: number) => Math.round(num).toString(16).padStart(2, "0");

export const rgbToColorStr = (color: RGB) => {
    const { red, green, blue } = processRgb(colorPartToHex, color);

    return `#${red}${green}${blue}`;
};

export const mixColorsStr = (color1: string, color2: string, coeff = 0.5) =>
    rgbToColorStr(
        processRgb(
            (value1, value2) => value1 * coeff + value2 * (1 - coeff),
            colorStrToRgb(color1),
            colorStrToRgb(color2),
        ),
    );

export const getAverageColorsStr = (colors: string[]) =>
    rgbToColorStr(processRgb((...args) => average(args), ...colors.map(colorStrToRgb)));

export const lightenColorStr = (color: string, coeff = 0.5) => mixColorsStr(color, "#fff", coeff);

export const rgba = (rgb: string, a: number) => normalizeColorStr(rgb) + colorPartToHex(a * 255);

export const parseColorWithOpacity = (color: string) => {
    if (/^#[0-9a-f]{8}$/i.test(color)) {
        return {
            rgb: color.substring(0, 7),
            a: parseInt(color.substring(7), 16) / 255,
        };
    } else {
        return { rgb: color };
    }
};
