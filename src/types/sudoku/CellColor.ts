import {blackColor, blueColor, greenColor, lightGreyColor, redColor, yellowColor} from "../../components/app/globals";
import {lightenColorStr} from "../../utils/color";

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
    [CellColor.lightGrey]: lightenColorStr(lightGreyColor),
    [CellColor.darkGrey]: lightenColorStr("#5f5f5f"),
    [CellColor.black]: lightenColorStr(blackColor),
    [CellColor.green]: lightenColorStr(greenColor),
    [CellColor.purple]: lightenColorStr("#d23be7"),
    [CellColor.orange]: lightenColorStr("#eb7532"),
    [CellColor.red]: lightenColorStr(redColor),
    [CellColor.yellow]: lightenColorStr(yellowColor),
    [CellColor.blue]: lightenColorStr(blueColor),
};
