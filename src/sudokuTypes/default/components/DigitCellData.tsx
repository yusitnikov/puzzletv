import {CellDataProps} from "../../../components/sudoku/cell/CellDataProps";
import {userDigitColor} from "../../../components/app/globals";
import {CellDataComponentType} from "../../../components/sudoku/cell/CellDataComponentType";
import {RegularDigit, RegularDigitComponentType} from "../../../components/sudoku/digit/RegularDigit";
import {ComponentType} from "react";
import {DigitProps} from "../../../components/sudoku/digit/DigitProps";

export const DigitCellData = (DigitComponent: ComponentType<DigitProps> = RegularDigit) =>
    ({data: digit, size, state, isInitial, ...absoluteProps}: CellDataProps<number>) => <DigitComponent
        {...absoluteProps}
        digit={digit}
        size={size}
        color={isInitial ? undefined : userDigitColor}
    />;

export const DigitCellDataComponentType = (DigitComponent: ComponentType<DigitProps> = RegularDigit): CellDataComponentType<number> => ({
    component: DigitCellData(DigitComponent),
    widthCoeff: RegularDigitComponentType.widthCoeff,
});
