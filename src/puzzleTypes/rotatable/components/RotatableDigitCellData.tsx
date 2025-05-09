import { CellDataProps, getDefaultCellDataColor } from "../../../components/puzzle/cell/CellDataProps";
import { userDigitColor } from "../../../components/app/globals";
import { CellDataComponentType } from "../../../components/puzzle/cell/CellDataComponentType";
import { RotatableDigitPTM } from "../types/RotatablePTM";
import { profiler } from "../../../utils/profiler";
import { observer } from "mobx-react-lite";

export const RotatableDigitCellData = observer(function RotatableDigitCellDataFc(
    props: CellDataProps<RotatableDigitPTM>,
) {
    profiler.trace();

    const { context, data, size, isInitial, isValid, ...absoluteProps } = props;
    const {
        puzzle: {
            typeManager: {
                digitComponentType,
                cellDataDigitComponentType: { component: DigitComponent } = digitComponentType,
            },
            importOptions,
        },
    } = context;

    return (
        <DigitComponent
            {...absoluteProps}
            context={context}
            digit={data.digit}
            size={size}
            color={getDefaultCellDataColor(
                props,
                data.sticky && !importOptions?.stickyDigits ? "#0c0" : userDigitColor,
            )}
        />
    );
});

export const RotatableDigitCellDataComponentType: CellDataComponentType<RotatableDigitPTM> = {
    component: RotatableDigitCellData,
};
