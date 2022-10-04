import {CellDataProps, getDefaultCellDataColor} from "../../../components/sudoku/cell/CellDataProps";
import {CellDataComponentType} from "../../../components/sudoku/cell/CellDataComponentType";
import {RegularDigit, RegularDigitComponentType} from "../../../components/sudoku/digit/RegularDigit";
import {ComponentType} from "react";
import {DigitProps} from "../../../components/sudoku/digit/DigitProps";
import {profiler} from "../../../utils/profiler";

export const DigitCellData = (DigitComponent: ComponentType<DigitProps> = RegularDigit) =>
    profiler.memo("DigitCellData", (props: CellDataProps<number>) => {
        const {data: digit, size, isInitial, isValid, ...absoluteProps} = props;

        return <DigitComponent
            {...absoluteProps}
            digit={digit}
            size={size}
            color={getDefaultCellDataColor(props)}
        />;
    });

export const DigitCellDataComponentType = <ProcessedGameStateExtensionType,>(
    DigitComponent: ComponentType<DigitProps> = RegularDigit,
    widthCoeff = RegularDigitComponentType.widthCoeff,
): CellDataComponentType<number, ProcessedGameStateExtensionType> => ({
    component: DigitCellData(DigitComponent),
    widthCoeff,
});
