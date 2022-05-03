import {Set} from "../struct/Set";
import {SudokuTypeManager} from "./SudokuTypeManager";

export interface CellState<CellType> {
    usersDigit?: CellType;
    centerDigits: Set<CellType>;
    cornerDigits: Set<CellType>;
    colors: Set<number>;
}

export const createEmptyCellState = <CellType>({areSameCellData, cloneCellData}: SudokuTypeManager<CellType>): CellState<CellType> => ({
    centerDigits: new Set([], (a, b) => areSameCellData(a, b, undefined, false), cloneCellData),
    cornerDigits: new Set([], (a, b) => areSameCellData(a, b, undefined, false), cloneCellData),
    colors: new Set<number>([], (i1, i2) => i1 === i2, i => i),
});

export const isEmptyCellState = ({usersDigit, centerDigits, cornerDigits, colors}: Partial<CellState<any>>, ignoreColors = false) =>
    usersDigit === undefined && !centerDigits?.size && !cornerDigits?.size && (ignoreColors || !colors?.size);

export const cloneCellState = <CellType>(
    {cloneCellData}: SudokuTypeManager<CellType>,
    {usersDigit, centerDigits, cornerDigits, colors}: CellState<CellType>
) => ({
    usersDigit: usersDigit && cloneCellData(usersDigit),
    centerDigits: centerDigits.clone(),
    cornerDigits: cornerDigits.clone(),
    colors,
});

export const areCellStatesEqual = <CellType>(
    {areSameCellData}: SudokuTypeManager<CellType>,
    {usersDigit, centerDigits, cornerDigits, colors}: CellState<CellType>,
    {usersDigit: usersDigit2, centerDigits: centerDigits2, cornerDigits: cornerDigits2, colors: colors2}: CellState<CellType>
) =>
    typeof usersDigit === typeof usersDigit2 && (!usersDigit || areSameCellData(usersDigit, usersDigit2!, undefined, false)) &&
    centerDigits.equals(centerDigits2) && cornerDigits.equals(cornerDigits2) && colors.equals(colors2);
