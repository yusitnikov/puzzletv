import { ControlButtonItemProps, ControlButtonItemPropsGenericFc } from "./ControlButtonsManager";
import { ControlButton } from "./ControlButton";
import { Settings } from "@emotion-icons/material";
import { Modal } from "../../layout/modal/Modal";
import { Button } from "../../layout/button/Button";
import { globalPaddingCoeff } from "../../app/globals";
import { useTranslate } from "../../../hooks/useTranslate";
import { useCallback } from "react";
import { SettingsContent } from "./settings/SettingsContent";
import { AnyPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { observer } from "mobx-react-lite";
import { settings } from "../../../types/layout/Settings";
import { profiler } from "../../../utils/profiler";

export const SettingsButton: ControlButtonItemPropsGenericFc = observer(function SettingsButton<T extends AnyPTM>({
    context,
    top,
    left,
}: ControlButtonItemProps<T>) {
    profiler.trace();

    const { cellSizeForSidePanel: cellSize } = context;

    const translate = useTranslate();

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
                <Modal cellSize={cellSize} onClose={handleCloseSettings}>
                    <form
                        onSubmit={(ev) => {
                            handleCloseSettings();
                            ev.preventDefault();
                            return false;
                        }}
                    >
                        <div>
                            <SettingsContent cellSize={cellSize} context={context} />
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
                </Modal>
            )}
        </>
    );
});
