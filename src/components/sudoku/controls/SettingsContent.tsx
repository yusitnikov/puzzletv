/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import {FC, useState} from "react";
import {useLanguageCode, useTranslate} from "../../../contexts/LanguageCodeContext";
import {textColor, textHeightCoeff} from "../../app/globals";
import {saveBoolToLocalStorage, saveNumberToLocalStorage, saveStringToLocalStorage} from "../../../utils/localStorage";
import {LocalStorageKeys} from "../../../data/LocalStorageKeys";
import InputSlider from "react-input-slider";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {Button} from "../../layout/button/Button";
import {myClientId} from "../../../hooks/useMultiPlayer";
import {buildLink} from "../../../utils/link";
import {Check} from "@emotion-icons/material";

interface SizeProps {
    cellSize: number;
}

export interface SettingsContentProps<CellType, ProcessedGameStateExtensionType = {}> extends SizeProps {
    context: PuzzleContext<CellType, any, ProcessedGameStateExtensionType>;
}

export const SettingsContent = <CellType, ProcessedGameStateExtensionType = {}>(
    {
        cellSize,
        context: {
            puzzle: {
                slug,
                getNewHostedGameParams,
                resultChecker,
                forceAutoCheckOnFinish,
                typeManager: {disableConflictChecker},
            },
            state: {
                enableConflictChecker,
                autoCheckOnFinish,
                backgroundOpacity,
                nickname,
            },
            onStateChange,
            multiPlayer: {isEnabled},
        },
    }: SettingsContentProps<CellType, ProcessedGameStateExtensionType>
) => {
    const language = useLanguageCode();
    const translate = useTranslate();

    const textSize = cellSize * textHeightCoeff;

    const [isCopied, setIsCopied] = useState(false);

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

    const handleChangeNickname = (value: string) => {
        onStateChange({nickname: value} as any);
        saveStringToLocalStorage(LocalStorageKeys.nickname, value);
    };

    return <div>
        <div style={{fontSize: textSize * 1.5, marginBottom: textSize}}>
            <strong>{translate("Settings")}</strong>
        </div>

        {getNewHostedGameParams && <>
            <SettingsItem noLabel={true}>
                <i>{translate(isEnabled ? "Multi-player mode" : "Single-player mode")}.</i>

                <SettingsButton
                    type={"button"}
                    cellSize={cellSize}
                    onClick={() => {
                        window.open(window.location.origin + window.location.pathname + buildLink(
                            slug,
                            language,
                            {
                                ...getNewHostedGameParams(),
                                host: myClientId,
                                room: Math.random().toString().substring(2),
                            }
                        ));
                    }}
                >
                    {translate("Host new game")}
                </SettingsButton>
            </SettingsItem>

            {isEnabled && <SettingsItem>
                <div>
                    {translate("Share the link to the game")}:
                </div>
                <div style={{marginTop: textSize * 0.25}}>
                    <SettingsTextBox
                        type={"text"}
                        readOnly={true}
                        cellSize={cellSize}
                        value={window.location.href}
                        onFocus={({target}) => target.select()}
                    />

                    <div style={{display: "inline-flex", alignItems: "center"}}>
                        <SettingsButton
                            type={"button"}
                            cellSize={cellSize}
                            onClick={async () => {
                                await window.navigator.clipboard.writeText(window.location.href);
                                setIsCopied(true);
                                window.setTimeout(() => setIsCopied(false), 1000);
                            }}
                        >
                            {translate("Copy")}
                        </SettingsButton>

                        <div style={{position: "relative", width: 1, height: textSize}}>
                            {isCopied && <Check size={textSize} style={{position: "absolute"}}/>}
                        </div>
                    </div>
                </div>
            </SettingsItem>}
        </>}

        {isEnabled && <SettingsItem>
            <span>{translate("Nickname")}:</span>

            <SettingsTextBox
                type={"text"}
                cellSize={cellSize}
                value={nickname}
                onChange={(ev) => handleChangeNickname(ev.target.value)}
            />
        </SettingsItem>}

        {!disableConflictChecker && <SettingsItem>
            {translate("Highlight conflicts")}:

            <SettingsCheckbox
                type={"checkbox"}
                cellSize={cellSize}
                checked={enableConflictChecker}
                onChange={(ev) => handleChangeEnableConflictChecker(ev.target.checked)}
            />
        </SettingsItem>}

        {resultChecker && !forceAutoCheckOnFinish && <SettingsItem>
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

interface SettingsItemProps {
    noLabel?: boolean;
}

const StyledSettingsItem = styled("div", {
    shouldForwardProp(propName) {
        return propName !== "noLabel";
    },
})(({noLabel}: SettingsItemProps) => ({
    marginBottom: "0.5em",
    "*": {
        cursor: noLabel ? undefined : "pointer",
    },
}));

const SettingsItem: FC<SettingsItemProps> = ({noLabel, children}) => <StyledSettingsItem noLabel={noLabel}>
    {noLabel ? children : <label>{children}</label>}
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
}));

const SettingsTextBox = styled("input", {
    shouldForwardProp(propName) {
        return propName !== "cellSize";
    }
})(({cellSize}: SizeProps) => ({
    padding: "0.25em",
    margin: 0,
    width: cellSize * 2,
    height: cellSize * textHeightCoeff,
    border: `1px solid ${textColor}`,
    outline: "none",
    cursor: "text",
    fontSize: "inherit",
    lineHeight: "inherit",
    fontWeight: "inherit",
    fontFamily: "inherit",
    "* + &": {
        marginLeft: cellSize * textHeightCoeff,
    },
}));

const SettingsButton = styled(Button)(({cellSize}: SizeProps) => ({
    padding: "0.25em",
    margin: 0,
    marginLeft: cellSize * textHeightCoeff,
    fontSize: "inherit",
    lineHeight: "inherit",
    fontWeight: "inherit",
    fontFamily: "inherit",
}));
