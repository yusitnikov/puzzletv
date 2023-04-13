import {ControlButtonItemProps} from "./ControlButtonsManager";
import {useTranslate} from "../../../hooks/useTranslate";
import {ControlButton} from "./ControlButton";
import {saveBoolToLocalStorage} from "../../../utils/localStorage";
import {LocalStorageKeys} from "../../../data/LocalStorageKeys";
import {Grid} from "@emotion-icons/fluentui-system-filled";
import {CellSelectionColor} from "../cell/CellSelection";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";

export const MultiSelectionButton = <T extends AnyPTM>({context, top, left}: ControlButtonItemProps<T>) => {
    const {
        cellSizeForSidePanel: cellSize,
        state: {isMultiSelection},
        onStateChange,
    } = context;

    const translate = useTranslate();

    return <ControlButton
        top={top}
        left={left}
        cellSize={cellSize}
        innerBorderWidth={1}
        checked={isMultiSelection}
        onClick={() => {
            const newValue = !isMultiSelection;
            onStateChange({isMultiSelection: newValue});
            saveBoolToLocalStorage(LocalStorageKeys.enableMultiSelection, newValue);
        }}
        title={translate("Multi-selection")}
    >
        <Grid color={CellSelectionColor.mainCurrent}/>
    </ControlButton>;
};
