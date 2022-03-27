import {areSameRotatableDigits, cloneRotatableDigit, RotatableDigit} from "./RotatableDigit";
import {Set} from "../struct/Set";

export interface CellState {
    initialDigit?: RotatableDigit;
    usersDigit?: RotatableDigit;
    centerDigits: Set<RotatableDigit>;
    cornerDigits: Set<RotatableDigit>;
    colors: Set<number>;
}

export const emptyCellState: CellState = {
    centerDigits: new Set([], areSameRotatableDigits, cloneRotatableDigit),
    cornerDigits: new Set([], areSameRotatableDigits, cloneRotatableDigit),
    colors: new Set<number>([], (i1, i2) => i1 === i2, i => i),
}

export const cloneCellState = ({initialDigit, usersDigit, centerDigits, cornerDigits, colors}: CellState) => ({
    initialDigit: initialDigit && cloneRotatableDigit(initialDigit),
    usersDigit: usersDigit && cloneRotatableDigit(usersDigit),
    centerDigits: centerDigits.clone(),
    cornerDigits: cornerDigits.clone(),
    colors,
});

export const areCellStatesEqual = (
    {initialDigit, usersDigit, centerDigits, cornerDigits, colors}: CellState,
    {initialDigit: initialDigit2, usersDigit: usersDigit2, centerDigits: centerDigits2, cornerDigits: cornerDigits2, colors: colors2}: CellState
) =>
    typeof initialDigit === typeof initialDigit2 && (!initialDigit || areSameRotatableDigits(initialDigit, initialDigit2!)) &&
    typeof usersDigit === typeof usersDigit2 && (!usersDigit || areSameRotatableDigits(usersDigit, usersDigit2!)) &&
    centerDigits.equals(centerDigits2) && cornerDigits.equals(cornerDigits2) && colors.equals(colors2);
