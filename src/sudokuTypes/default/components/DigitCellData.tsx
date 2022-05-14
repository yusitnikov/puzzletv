import {CellDataProps} from "../../../components/sudoku/cell/CellDataProps";
import {errorColor, userDigitColor} from "../../../components/app/globals";
import {CellDataComponentType} from "../../../components/sudoku/cell/CellDataComponentType";
import {RegularDigit, RegularDigitComponentType} from "../../../components/sudoku/digit/RegularDigit";
import {ComponentType} from "react";
import {DigitProps} from "../../../components/sudoku/digit/DigitProps";

export const DigitCellData = (DigitComponent: ComponentType<DigitProps> = RegularDigit) =>
    ({data: digit, size, state, isInitial, isValid = true, ...absoluteProps}: CellDataProps<number>) => <DigitComponent
        {...absoluteProps}
        digit={digit}
        size={size}
        color={!isValid ? errorColor : (isInitial ? undefined : userDigitColor)}
    />;

export const DigitCellDataComponentType = <ProcessedGameStateExtensionType,>(DigitComponent: ComponentType<DigitProps> = RegularDigit): CellDataComponentType<number, ProcessedGameStateExtensionType> => ({
    component: DigitCellData(DigitComponent),
    widthCoeff: RegularDigitComponentType.widthCoeff,
});
