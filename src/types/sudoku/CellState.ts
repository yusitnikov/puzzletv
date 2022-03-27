import {RotatableDigit} from "./RotatableDigit";

export interface CellState {
    initialDigit?: RotatableDigit;
    usersDigit?: RotatableDigit;
    centerDigits?: RotatableDigit[];
    cornerDigits?: RotatableDigit[];
    colors?: number[];
}
