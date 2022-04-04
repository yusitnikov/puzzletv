import {Set} from "../struct/Set";
import {SudokuTypeManager} from "./SudokuTypeManager";

export interface CellState<CellType> {
    initialDigit?: CellType;
    usersDigit?: CellType;
    centerDigits: Set<CellType>;
    cornerDigits: Set<CellType>;
    colors: Set<number>;
}

export const createEmptyCellState = <CellType>({areSameCellData, cloneCellData}: SudokuTypeManager<CellType>): CellState<CellType> => ({
    centerDigits: new Set([], areSameCellData, cloneCellData),
    cornerDigits: new Set([], areSameCellData, cloneCellData),
    colors: new Set<number>([], (i1, i2) => i1 === i2, i => i),
});

export const cloneCellState = <CellType>(
    {cloneCellData}: SudokuTypeManager<CellType>,
    {initialDigit, usersDigit, centerDigits, cornerDigits, colors}: CellState<CellType>
) => ({
    initialDigit: initialDigit && cloneCellData(initialDigit),
    usersDigit: usersDigit && cloneCellData(usersDigit),
    centerDigits: centerDigits.clone(),
    cornerDigits: cornerDigits.clone(),
    colors,
});

export const areCellStatesEqual = <CellType>(
    {areSameCellData}: SudokuTypeManager<CellType>,
    {initialDigit, usersDigit, centerDigits, cornerDigits, colors}: CellState<CellType>,
    {initialDigit: initialDigit2, usersDigit: usersDigit2, centerDigits: centerDigits2, cornerDigits: cornerDigits2, colors: colors2}: CellState<CellType>
) =>
    typeof initialDigit === typeof initialDigit2 && (!initialDigit || areSameCellData(initialDigit, initialDigit2!)) &&
    typeof usersDigit === typeof usersDigit2 && (!usersDigit || areSameCellData(usersDigit, usersDigit2!)) &&
    centerDigits.equals(centerDigits2) && cornerDigits.equals(cornerDigits2) && colors.equals(colors2);
