import { PlainValueSet, SetInterface } from "../struct/Set";
import { PuzzleTypeManager } from "./PuzzleTypeManager";
import { CellColor } from "./CellColor";
import { CellDataSet } from "./CellDataSet";
import { AnyPTM } from "./PuzzleTypeMap";
import { PuzzleContext } from "./PuzzleContext";

export interface CellState<T extends AnyPTM> {
    usersDigit?: T["cell"];
    centerDigits: SetInterface<T["cell"]>;
    cornerDigits: SetInterface<T["cell"]>;
    colors: SetInterface<CellColor>;
}

export interface CellStateEx<T extends AnyPTM> extends CellState<T> {
    initialDigit?: T["cell"];
    excludedDigits: SetInterface<T["cell"]>;
    isInvalid?: boolean;
}

export const createEmptyCellState = <T extends AnyPTM>(context: PuzzleContext<T>): CellState<T> => ({
    centerDigits: new CellDataSet(context),
    cornerDigits: new CellDataSet(context),
    colors: new PlainValueSet<CellColor>(),
});

export const serializeCellState = <T extends AnyPTM>(
    { usersDigit, centerDigits, cornerDigits, colors }: CellState<T>,
    { serializeCellData }: PuzzleTypeManager<T>,
) => ({
    usersDigit: usersDigit !== undefined ? serializeCellData(usersDigit) : undefined,
    centerDigits: centerDigits.serialize(),
    cornerDigits: cornerDigits.serialize(),
    colors: colors.serialize(),
});

export const unserializeCellState = <T extends AnyPTM>(
    { usersDigit, centerDigits, cornerDigits, colors }: any,
    context: PuzzleContext<T>,
): CellState<T> => ({
    usersDigit: usersDigit !== undefined ? context.puzzle.typeManager.unserializeCellData(usersDigit) : undefined,
    centerDigits: CellDataSet.unserialize(context, centerDigits),
    cornerDigits: CellDataSet.unserialize(context, cornerDigits),
    colors: PlainValueSet.unserialize<CellColor>(colors),
});

export const isEmptyCellState = <T extends AnyPTM>(
    { usersDigit, centerDigits, cornerDigits, colors }: Partial<CellState<T>>,
    ignoreColors = false,
) => usersDigit === undefined && !centerDigits?.size && !cornerDigits?.size && (ignoreColors || !colors?.size);

export const cloneCellState = <T extends AnyPTM>(
    { cloneCellData }: PuzzleTypeManager<T>,
    { usersDigit, centerDigits, cornerDigits, colors }: CellState<T>,
) => ({
    usersDigit: usersDigit && cloneCellData(usersDigit),
    centerDigits: centerDigits.clone(),
    cornerDigits: cornerDigits.clone(),
    colors: colors.clone(),
});

export const areCellStatesEqual = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    { usersDigit, centerDigits, cornerDigits, colors }: CellState<T>,
    {
        usersDigit: usersDigit2,
        centerDigits: centerDigits2,
        cornerDigits: cornerDigits2,
        colors: colors2,
    }: CellState<T>,
) =>
    typeof usersDigit === typeof usersDigit2 &&
    (usersDigit === undefined || context.puzzle.typeManager.areSameCellData(usersDigit, usersDigit2!, context)) &&
    centerDigits.equals(centerDigits2) &&
    cornerDigits.equals(cornerDigits2) &&
    colors.equals(colors2);
