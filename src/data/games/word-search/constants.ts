import {darkBlueColor, darkGreenColor, orangeColor, purpleColor, redColor} from "../../../components/app/globals";
import {localStorageManager} from "../../../utils/localStorage";

export const clientColors = [
    darkBlueColor,
    redColor,
    darkGreenColor,
    purpleColor,
    orangeColor,
];

export const cellSize = 64;
export const smallCellSize = 32;

export const fieldSizePreference = {
    width: localStorageManager.getNumberManager<number>('wordSearchWidth', 5),
    height: localStorageManager.getNumberManager<number>('wordSearchHeight', 4),
};
