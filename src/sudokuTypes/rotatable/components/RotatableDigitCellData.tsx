import {CellDataProps, getDefaultCellDataColor} from "../../../components/sudoku/cell/CellDataProps";
import {userDigitColor} from "../../../components/app/globals";
import {CellDataComponentType} from "../../../components/sudoku/cell/CellDataComponentType";
import {AnyRotatablePTM} from "../types/RotatablePTM";

export const RotatableDigitCellData = <T extends AnyRotatablePTM>(props: CellDataProps<T>) => {
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
    } = puzzle;

    return <DigitComponent
        {...absoluteProps}
        puzzle={puzzle}
        digit={data.digit}
        size={size}
        color={getDefaultCellDataColor(props, data.sticky ? "#0c0" : userDigitColor)}
    />;
};

export const RotatableDigitCellDataComponentType = <T extends AnyRotatablePTM>(): CellDataComponentType<T> => ({
    component: RotatableDigitCellData,
});
