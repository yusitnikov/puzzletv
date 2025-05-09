import { CellDataProps, getDefaultCellDataColor } from "../../../components/puzzle/cell/CellDataProps";
import { CellDataComponentType } from "../../../components/puzzle/cell/CellDataComponentType";
import { JigsawPTM } from "../types/JigsawPTM";
import { profiler } from "../../../utils/profiler";
import { observer } from "mobx-react-lite";

export const JigsawDigitCellData = observer(function JigsawDigitCellDataFc(props: CellDataProps<JigsawPTM>) {
    profiler.trace();

    const { context, data, size, isInitial, isValid, angle = 0, ...absoluteProps } = props;
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
            digit={data.digit}
            angle={data.angle + angle}
            context={context}
            size={size}
            color={getDefaultCellDataColor(props)}
        />
    );
});

export const JigsawDigitCellDataComponentType = (supportRotation90: boolean): CellDataComponentType<JigsawPTM> => ({
    component: JigsawDigitCellData,
    // centermarks could be horizontal, so need to give space for them
    widthCoeff: supportRotation90 ? 1.1 : undefined,
});
