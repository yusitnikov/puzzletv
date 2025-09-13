import { ControlButtonItemProps, ControlButtonItemPropsGenericFc } from "./ControlButtonsManager";
import { ControlButton } from "./ControlButton";
import { Settings } from "@emotion-icons/material";
import { Modal } from "../../layout/modal/Modal";
import { useCallback } from "react";
import { SettingsContent } from "./settings/SettingsContent";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { observer } from "mobx-react-lite";
import { settings } from "../../../types/layout/Settings";
import { profiler } from "../../../utils/profiler";
import { translate } from "../../../utils/translate";

export const SettingsButton: ControlButtonItemPropsGenericFc = observer(function SettingsButton<T extends AnyPTM>({
    context,
    top,
    left,
}: ControlButtonItemProps<T>) {
    profiler.trace();

    const { cellSizeForSidePanel: cellSize } = context;

    const handleOpenSettings = useCallback(() => settings.toggle(true), []);
    const handleCloseSettings = useCallback(() => settings.toggle(false), []);

    return (
        <>
            <ControlButton
                left={left}
                top={top}
                cellSize={cellSize}
                onClick={handleOpenSettings}
                title={translate("Open settings")}
            >
                <Settings />
            </ControlButton>
            {settings.isOpened && (
                <Modal
                    cellSize={cellSize}
                    onClose={handleCloseSettings}
                    buttons={[{ label: "OK", type: "submit", form: "settings-form" }]}
                    autoFocusButtonIndex={false}
                >
                    <form
                        id={"settings-form"}
                        onSubmit={(ev) => {
                            handleCloseSettings();
                            ev.preventDefault();
                            return false;
                        }}
                    >
                        <div>
                            <SettingsContent cellSize={cellSize} context={context} />
                        </div>
                    </form>
                </Modal>
            )}
        </>
    );
});
