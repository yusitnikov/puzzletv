import { CellDataProps, getDefaultCellDataColor } from "../../../components/sudoku/cell/CellDataProps";
import { CellDataComponentType } from "../../../components/sudoku/cell/CellDataComponentType";
import { ReactElement } from "react";
import { profiler } from "../../../utils/profiler";
import { AnyNumberPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { observer } from "mobx-react-lite";

export const DigitCellData = observer(function DigitCellData<T extends AnyNumberPTM>(props: CellDataProps<T>) {
    profiler.trace();

    const { puzzle, data: digit, size, isInitial, isValid, ...absoluteProps } = props;
    const {
        typeManager: {
            digitComponentType,
            cellDataDigitComponentType: { component: DigitComponent } = digitComponentType,
        },
    } = puzzle;

    return (
        <DigitComponent
            {...absoluteProps}
            puzzle={puzzle}
            digit={digit}
            size={size}
            color={getDefaultCellDataColor(props)}
        />
    );
}) as <T extends AnyNumberPTM>(props: CellDataProps<T>) => ReactElement;

export const DigitCellDataComponentType = <T extends AnyNumberPTM>(
    cellSizeCoeff?: number,
): CellDataComponentType<T> => ({
    component: DigitCellData,
    cellSizeCoeff,
});
