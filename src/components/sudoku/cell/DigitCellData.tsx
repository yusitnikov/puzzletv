import {CellDataProps} from "./CellDataProps";
import {userDigitColor} from "../../app/globals";
import {CellDataComponentType} from "./CellDataComponentType";
import {RegularDigit, RegularDigitComponentType} from "../digit/RegularDigit";

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
