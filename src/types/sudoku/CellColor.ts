import {
    blackColor,
    blueColor,
    greenColor,
    lightGreyColor,
    orangeColor,
    purpleColor,
    redColor,
    veryDarkGreyColor,
    yellowColor
} from "../../components/app/globals";

export enum CellColor {
    lightGrey,
    darkGrey,
    black,
    green,
    purple,
    orange,
    red,
    yellow,
    blue,
    white,
    shaded = black,
    unshaded = green,
}

export const cellColors: Record<CellColor, string> = {
    [CellColor.lightGrey]: lightGreyColor,
    [CellColor.darkGrey]: veryDarkGreyColor,
    [CellColor.black]: blackColor,
    [CellColor.green]: greenColor,
    [CellColor.purple]: purpleColor,
    [CellColor.orange]: orangeColor,
    [CellColor.red]: redColor,
    [CellColor.yellow]: yellowColor,
    [CellColor.blue]: blueColor,
    [CellColor.white]: "#ffffff",
};

export type CellColorValue = CellColor | string;

export const resolveCellColorValue = (value: CellColorValue) => typeof value === "string" ? value : cellColors[value as CellColor];
