import {CellDataProps, getDefaultCellDataColor} from "../../../components/sudoku/cell/CellDataProps";
import {userDigitColor} from "../../../components/app/globals";
import {CellDataComponentType} from "../../../components/sudoku/cell/CellDataComponentType";
import {AnyRotatablePTM} from "../types/RotatablePTM";
import {profiler} from "../../../utils/profiler";
import {observer} from "mobx-react-lite";
import {ReactElement} from "react";

export const RotatableDigitCellData = observer(function RotatableDigitCellData<T extends AnyRotatablePTM>(props: CellDataProps<T>) {
    profiler.trace();

    const {
        puzzle,
        data,
        size,
        isInitial,
        isValid,
        ...absoluteProps
    } = props;
    const {
        typeManager: {
            digitComponentType,
            cellDataDigitComponentType: {
                component: DigitComponent,
            } = digitComponentType,
        },
        importOptions,
    } = puzzle;

    return <DigitComponent
        {...absoluteProps}
        puzzle={puzzle}
        digit={data.digit}
        size={size}
        color={getDefaultCellDataColor(props, data.sticky && !importOptions?.stickyDigits ? "#0c0" : userDigitColor)}
    />;
}) as <T extends AnyRotatablePTM>(props: CellDataProps<T>) => ReactElement;

export const RotatableDigitCellDataComponentType = <T extends AnyRotatablePTM>(): CellDataComponentType<T> => ({
    component: RotatableDigitCellData,
});
