import {ControlButtonItemProps} from "./ControlButtonsManager";
import {ControlButton} from "./ControlButton";
import {Settings} from "@emotion-icons/material";
import {Modal} from "../../layout/modal/Modal";
import {Button} from "../../layout/button/Button";
import {globalPaddingCoeff} from "../../app/globals";
import {useTranslate} from "../../../hooks/useTranslate";
import {useCallback} from "react";
import {SettingsContent} from "./settings/SettingsContent";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";

export const SettingsButton = <T extends AnyPTM>({context, top, left}: ControlButtonItemProps<T>) => {
    const {
        cellSizeForSidePanel: cellSize,
        state: {isShowingSettings},
        onStateChange,
    } = context;

    const translate = useTranslate();

    const handleOpenSettings = useCallback(
        () => onStateChange({isShowingSettings: true}),
        [onStateChange]
    );
    const handleCloseSettings = useCallback(
        () => onStateChange({isShowingSettings: false}),
        [onStateChange]
    );

    return <>
        <ControlButton
            left={left}
            top={top}
            cellSize={cellSize}
            onClick={handleOpenSettings}
            title={translate("Open settings")}
        >
            <Settings/>
        </ControlButton>
        {isShowingSettings && <Modal cellSize={cellSize} onClose={handleCloseSettings}>
            <form
                onSubmit={(ev) => {
                    handleCloseSettings();
                    ev.preventDefault();
                    return false;
                }}
            >
                <div>
                    <SettingsContent cellSize={cellSize} context={context}/>
                </div>
                <div>
                    <Button
                        type={"submit"}
                        cellSize={cellSize}
                        onClick={handleCloseSettings}
                        style={{
                            marginTop: cellSize * globalPaddingCoeff,
                            padding: "0.5em 1em",
                        }}
                    >
                        OK
                    </Button>
                </div>
            </form>
        </Modal>}
    </>;
};
