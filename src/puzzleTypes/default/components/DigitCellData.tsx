import { CellDataProps, getDefaultCellDataColor } from "../../../components/puzzle/cell/CellDataProps";
import { CellDataComponentType } from "../../../components/puzzle/cell/CellDataComponentType";
import { ReactElement } from "react";
import { profiler } from "../../../utils/profiler";
import { AnyNumberPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { observer } from "mobx-react-lite";

export const DigitCellData = observer(function DigitCellData<T extends AnyNumberPTM>(props: CellDataProps<T>) {
    profiler.trace();

    const { context, data: digit, size, isInitial, isValid, ...absoluteProps } = props;
    const {
        puzzle: {
            typeManager: {
                digitComponentType,
                cellDataDigitComponentType: { component: DigitComponent } = digitComponentType,
            },
        },
    } = context;

    return (
        <DigitComponent
            {...absoluteProps}
            context={context}
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
