import {
    blackColor,
    blueColor,
    greenColor,
    lightGreyColor,
    purpleColor,
    redColor,
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
}

export const cellColors: Record<CellColor, string> = {
    [CellColor.lightGrey]: lightGreyColor,
    [CellColor.darkGrey]: "#5f5f5f",
    [CellColor.black]: blackColor,
    [CellColor.green]: greenColor,
    [CellColor.purple]: purpleColor,
    [CellColor.orange]: "#eb7532",
    [CellColor.red]: redColor,
    [CellColor.yellow]: yellowColor,
    [CellColor.blue]: blueColor,
};
