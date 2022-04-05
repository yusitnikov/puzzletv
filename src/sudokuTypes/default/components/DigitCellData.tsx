import {CellDataProps} from "../../../components/sudoku/cell/CellDataProps";
import {userDigitColor} from "../../../components/app/globals";
import {CellDataComponentType} from "../../../components/sudoku/cell/CellDataComponentType";
import {RegularDigit, RegularDigitComponentType} from "../../../components/sudoku/digit/RegularDigit";

export const DigitCellData = ({data: digit, size, state, isInitial, ...absoluteProps}: CellDataProps<number>) => <RegularDigit
    {...absoluteProps}
    digit={digit}
    size={size}
    color={isInitial ? undefined : userDigitColor}
/>;

export const DigitCellDataComponentType: CellDataComponentType<number> = {
    component: DigitCellData,
    widthCoeff: RegularDigitComponentType.widthCoeff,
};
