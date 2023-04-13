import {PlainValueSet, SetInterface} from "../struct/Set";
import {SudokuTypeManager} from "./SudokuTypeManager";
import {CellColor} from "./CellColor";
import {PuzzleDefinition} from "./PuzzleDefinition";
import {CellDataSet} from "./CellDataSet";
import {AnyPTM} from "./PuzzleTypeMap";

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

export const createEmptyCellState = <T extends AnyPTM>(
    puzzle: PuzzleDefinition<T>
): CellState<T["cell"]> => ({
    centerDigits: new CellDataSet(puzzle),
    cornerDigits: new CellDataSet(puzzle),
    colors: new PlainValueSet<CellColor>(),
});

export const serializeCellState = <T extends AnyPTM>(
    {usersDigit, centerDigits, cornerDigits, colors}: CellState<T["cell"]>,
    {serializeCellData}: SudokuTypeManager<T>
) => ({
    usersDigit: usersDigit ? serializeCellData(usersDigit) : undefined,
    centerDigits: centerDigits.serialize(),
    cornerDigits: cornerDigits.serialize(),
    colors: colors.serialize(),
});

export const unserializeCellState = <T extends AnyPTM>(
    {usersDigit, centerDigits, cornerDigits, colors}: any,
    puzzle: PuzzleDefinition<T>
): CellState<T["cell"]> => ({
    usersDigit: usersDigit ? puzzle.typeManager.unserializeCellData(usersDigit) : undefined,
    centerDigits: CellDataSet.unserialize(puzzle, centerDigits),
    cornerDigits: CellDataSet.unserialize(puzzle, cornerDigits),
    colors: PlainValueSet.unserialize<CellColor>(colors),
});

export const isEmptyCellState = ({usersDigit, centerDigits, cornerDigits, colors}: Partial<CellState<any>>, ignoreColors = false) =>
    usersDigit === undefined && !centerDigits?.size && !cornerDigits?.size && (ignoreColors || !colors?.size);

export const cloneCellState = <T extends AnyPTM>(
    {cloneCellData}: SudokuTypeManager<T>,
    {usersDigit, centerDigits, cornerDigits, colors}: CellState<T["cell"]>
) => ({
    usersDigit: usersDigit && cloneCellData(usersDigit),
    centerDigits: centerDigits.clone(),
    cornerDigits: cornerDigits.clone(),
    colors: colors.clone(),
});

export const areCellStatesEqual = <T extends AnyPTM>(
    {areSameCellData}: SudokuTypeManager<T>,
    {usersDigit, centerDigits, cornerDigits, colors}: CellState<T["cell"]>,
    {usersDigit: usersDigit2, centerDigits: centerDigits2, cornerDigits: cornerDigits2, colors: colors2}: CellState<T["cell"]>
) =>
    typeof usersDigit === typeof usersDigit2 && (!usersDigit || areSameCellData(usersDigit, usersDigit2!, undefined, false)) &&
    centerDigits.equals(centerDigits2) && cornerDigits.equals(cornerDigits2) && colors.equals(colors2);
