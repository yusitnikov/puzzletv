import {ComparableSet, HashSet, SetInterface} from "../struct/Set";
import {SudokuTypeManager} from "./SudokuTypeManager";
import {CellColor} from "./CellColor";

export interface CellState<CellType> {
    usersDigit?: CellType;
    centerDigits: SetInterface<CellType>;
    cornerDigits: SetInterface<CellType>;
    colors: SetInterface<CellColor>;
}

export interface CellStateEx<CellType> extends CellState<CellType> {
    initialDigit?: CellType;
    excludedDigits: SetInterface<CellType>;
    isInvalid?: boolean;
}

export const getCellDataComparer = <CellType>(areSameCellData: SudokuTypeManager<CellType>["areSameCellData"]) =>
    (a: CellType, b: CellType) => areSameCellData(a, b, undefined, false);

export const createEmptyCellState = <CellType>({areSameCellData, cloneCellData, serializeCellData}: SudokuTypeManager<CellType>): CellState<CellType> => ({
    centerDigits: new ComparableSet([], getCellDataComparer(areSameCellData), cloneCellData, serializeCellData),
    cornerDigits: new ComparableSet([], getCellDataComparer(areSameCellData), cloneCellData, serializeCellData),
    colors: new HashSet<CellColor>(),
});

export const serializeCellState = <CellType>(
    {usersDigit, centerDigits, cornerDigits, colors}: CellState<CellType>,
    {serializeCellData}: SudokuTypeManager<CellType>
) => ({
    usersDigit: usersDigit ? serializeCellData(usersDigit) : undefined,
    centerDigits: centerDigits.serialize(),
    cornerDigits: cornerDigits.serialize(),
    colors: colors.serialize(),
});

export const unserializeCellState = <CellType>(
    {usersDigit, centerDigits, cornerDigits, colors}: any,
    {areSameCellData, cloneCellData, serializeCellData, unserializeCellData}: SudokuTypeManager<CellType>
): CellState<CellType> => ({
    usersDigit: usersDigit ? unserializeCellData(usersDigit) : undefined,
    centerDigits: ComparableSet.unserialize(centerDigits, getCellDataComparer(areSameCellData), cloneCellData, serializeCellData),
    cornerDigits: ComparableSet.unserialize(cornerDigits, getCellDataComparer(areSameCellData), cloneCellData, serializeCellData),
    colors: HashSet.unserialize<CellColor>(colors),
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
    colors: colors.clone(),
});

export const areCellStatesEqual = <CellType>(
    {areSameCellData}: SudokuTypeManager<CellType>,
    {usersDigit, centerDigits, cornerDigits, colors}: CellState<CellType>,
    {usersDigit: usersDigit2, centerDigits: centerDigits2, cornerDigits: cornerDigits2, colors: colors2}: CellState<CellType>
) =>
    typeof usersDigit === typeof usersDigit2 && (!usersDigit || areSameCellData(usersDigit, usersDigit2!, undefined, false)) &&
    centerDigits.equals(centerDigits2) && cornerDigits.equals(cornerDigits2) && colors.equals(colors2);
