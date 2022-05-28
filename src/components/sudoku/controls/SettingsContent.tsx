/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import {FC} from "react";
import {useTranslate} from "../../../contexts/LanguageCodeContext";
import {textHeightCoeff} from "../../app/globals";
import {saveBoolToLocalStorage, saveNumberToLocalStorage} from "../../../utils/localStorage";
import {LocalStorageKeys} from "../../../data/LocalStorageKeys";
import InputSlider from "react-input-slider";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";

interface SizeProps {
    cellSize: number;
}

export interface SettingsContentProps<CellType, ProcessedGameStateExtensionType = {}> extends SizeProps {
    context: PuzzleContext<CellType, any, ProcessedGameStateExtensionType>;
}

export const SettingsContent = <CellType, ProcessedGameStateExtensionType = {}>(
    {cellSize, context: {puzzle: {resultChecker, typeManager: {disableConflictChecker}}, state: {enableConflictChecker, autoCheckOnFinish, backgroundOpacity}, onStateChange}}: SettingsContentProps<CellType, ProcessedGameStateExtensionType>
) => {
    const translate = useTranslate();

    const textSize = cellSize * textHeightCoeff;

    const handleChangeEnableConflictChecker = (value: boolean) => {
        onStateChange({enableConflictChecker: value} as any);
        saveBoolToLocalStorage(LocalStorageKeys.enableConflictChecker, value);
    };

    const handleChangeAutoCheckOnFinish = (value: boolean) => {
        onStateChange({autoCheckOnFinish: value} as any);
        saveBoolToLocalStorage(LocalStorageKeys.autoCheckOnFinish, value);
    };

    const handleChangeBackgroundOpacity = (value: number) => {
        onStateChange({backgroundOpacity: value} as any);
        saveNumberToLocalStorage(LocalStorageKeys.backgroundOpacity, value);
    };

    return <div>
        <div style={{fontSize: textSize * 1.5, marginBottom: textSize}}>
            <strong>{translate("Settings")}</strong>
        </div>

        {!disableConflictChecker && <SettingsItem>
            {translate("Highlight conflicts")}:

            <SettingsCheckbox
                type={"checkbox"}
                cellSize={cellSize}
                checked={enableConflictChecker}
                onChange={(ev) => handleChangeEnableConflictChecker(ev.target.checked)}
            />
        </SettingsItem>}

        {resultChecker && <SettingsItem>
            {translate("Auto-check on finish")}:

            <SettingsCheckbox
                type={"checkbox"}
                cellSize={cellSize}
                checked={autoCheckOnFinish}
                onChange={(ev) => handleChangeAutoCheckOnFinish(ev.target.checked)}
            />
        </SettingsItem>}

        <SettingsItem>
            {translate("Background color's opacity")}:<br/>

            <InputSlider
                axis={"x"}
                x={backgroundOpacity}
                xmin={0.1}
                xmax={1}
                xstep={0.1}
                onChange={({x}) => handleChangeBackgroundOpacity(x)}
            />
        </SettingsItem>
    </div>;
};

const StyledSettingsItem = styled("div")({
    marginBottom: "0.5em",
    "*": {
        cursor: "pointer",
    },
});

const SettingsItem: FC = ({children}) => <StyledSettingsItem>
    <label>
        {children}
    </label>
</StyledSettingsItem>;

const SettingsCheckbox = styled("input", {
    shouldForwardProp(propName) {
        return propName !== "cellSize";
    }
})(({cellSize}: SizeProps) => ({
    padding: 0,
    margin: 0,
    marginLeft: cellSize * textHeightCoeff,
    width: cellSize * textHeightCoeff * 0.8,
    height: cellSize * textHeightCoeff * 0.8,
}))