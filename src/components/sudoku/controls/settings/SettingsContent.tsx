import {useState} from "react";
import {useLanguageCode, useTranslate} from "../../../../hooks/useTranslate";
import {textHeightCoeff} from "../../../app/globals";
import {saveBoolToLocalStorage, saveNumberToLocalStorage, saveStringToLocalStorage} from "../../../../utils/localStorage";
import {LocalStorageKeys} from "../../../../data/LocalStorageKeys";
import InputSlider from "react-input-slider";
import {PuzzleContext} from "../../../../types/sudoku/PuzzleContext";
import {myClientId} from "../../../../hooks/useMultiPlayer";
import {buildLink} from "../../../../utils/link";
import {Check, Share} from "@emotion-icons/material";
import {SettingsItem} from "./SettingsItem";
import {SettingsButton} from "./SettingsButton";
import {SettingsTextBox} from "./SettingsTextBox";
import {SettingsCheckbox} from "./SettingsCheckbox";

export interface SettingsContentProps<CellType, ProcessedExType = {}> {
    context: PuzzleContext<CellType, any, ProcessedExType>;
    cellSize: number;
}

export const SettingsContent = <CellType, ProcessedExType = {}>(
    props: SettingsContentProps<CellType, ProcessedExType>
) => {
    const {
        cellSize,
        context: {
            puzzle: {
                slug,
                params,
                getNewHostedGameParams,
                resultChecker,
                forceAutoCheckOnFinish,
                forceEnableConflictChecker,
                typeManager: {disableConflictChecker, settingsComponents = []},
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
    } = props;

    const language = useLanguageCode();
    const translate = useTranslate();

    const textSize = cellSize * textHeightCoeff;

    const [isCopied, setIsCopied] = useState(false);

    const handleChangeEnableConflictChecker = (value: boolean) => {
        onStateChange({enableConflictChecker: value});
        saveBoolToLocalStorage(LocalStorageKeys.enableConflictChecker, value);
    };

    const handleChangeAutoCheckOnFinish = (value: boolean) => {
        onStateChange({autoCheckOnFinish: value});
        saveBoolToLocalStorage(LocalStorageKeys.autoCheckOnFinish, value);
    };

    const handleChangeBackgroundOpacity = (value: number) => {
        onStateChange({backgroundOpacity: value});
        saveNumberToLocalStorage(LocalStorageKeys.backgroundOpacity, value);
    };

    const handleChangeNickname = (value: string) => {
        onStateChange({nickname: value});
        saveStringToLocalStorage(LocalStorageKeys.nickname, value);
    };

    return <div>
        <div style={{fontSize: textSize * 1.5, marginBottom: textSize}}>
            <strong>{translate("Settings")}</strong>
        </div>

        <SettingsItem noLabel={true}>
            <i>{translate(isEnabled ? "Multi-player mode" : "Single-player mode")}.</i>

            {getNewHostedGameParams && <SettingsButton
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
                            share: false,
                        }
                    ));
                }}
            >
                {translate("Host new game")}
            </SettingsButton>}

            {!getNewHostedGameParams && <SettingsButton
                type={"button"}
                cellSize={cellSize}
                onClick={() => {
                    window.open(window.location.origin + window.location.pathname + buildLink(
                        slug,
                        language,
                        {
                            ...params,
                            // ...getNewHostedGameParams?.(),
                            host: myClientId,
                            room: Math.random().toString().substring(2),
                            share: true,
                        }
                    ));
                }}
            >
                {translate("Start collective solve")}
            </SettingsButton>}
        </SettingsItem>

        {isEnabled && <SettingsItem>
            <div style={{display: "inline-flex", alignItems: "center"}}>
                <span>{translate("Share the link to the game")}:</span>

                <Share size={"1em"} style={{marginLeft: "0.5em"}}/>
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

        {isEnabled && <SettingsItem>
            <span>{translate("Nickname")}:</span>

            <SettingsTextBox
                type={"text"}
                cellSize={cellSize}
                value={nickname}
                onChange={(ev) => handleChangeNickname(ev.target.value)}
            />
        </SettingsItem>}

        {!disableConflictChecker && !forceEnableConflictChecker && <SettingsItem>
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

        {settingsComponents.map((Component, index) => <Component key={`custom-${index}`} {...props}/>)}
    </div>;
};
