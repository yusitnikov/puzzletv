import {useEffect, useState} from "react";
import {useLanguageCode, useTranslate} from "../../../../hooks/useTranslate";
import {textHeightCoeff} from "../../../app/globals";
import {
    saveBoolToLocalStorage,
    saveNumberToLocalStorage,
    saveStringToLocalStorage
} from "../../../../utils/localStorage";
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
import {SettingsSelect} from "./SettingsSelect";
import {PencilmarksCheckerMode} from "../../../../types/sudoku/PencilmarksCheckerMode";
import {LanguageCode} from "../../../../types/translations/LanguageCode";
import {shortenUrl} from "../../../../services/tinyUrl";

export interface SettingsContentProps<CellType, ExType, ProcessedExType = {}> {
    context: PuzzleContext<CellType, ExType, ProcessedExType>;
    cellSize: number;
}

export const SettingsContent = <CellType, ExType, ProcessedExType>(
    props: SettingsContentProps<CellType, ExType, ProcessedExType>
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
                typeManager: {disableConflictChecker, settingsComponents = [], getCellSelectionType},
            },
            state: {
                enableConflictChecker,
                pencilmarksCheckerMode,
                autoCheckOnFinish,
                backgroundOpacity,
                nickname,
                highlightSeenCells,
            },
            onStateChange,
            multiPlayer: {isEnabled},
        },
    } = props;

    const language = useLanguageCode();
    const translate = useTranslate();

    const textSize = cellSize * textHeightCoeff;

    const [isCopied, setIsCopied] = useState(false);

    const fullUrl = window.location.href;
    const [shortenedUrl, setShortenedUrl] = useState(fullUrl);
    useEffect(() => {
        if (isEnabled) {
            shortenUrl(fullUrl).then(setShortenedUrl);
        }
    }, [isEnabled, fullUrl]);

    const handleChangeEnableConflictChecker = (value: boolean) => {
        onStateChange({enableConflictChecker: value});
        saveBoolToLocalStorage(LocalStorageKeys.enableConflictChecker, value);
    };

    const handleChangePencilmarksCheckerMode = (value: PencilmarksCheckerMode) => {
        onStateChange({pencilmarksCheckerMode: value});
        saveNumberToLocalStorage(LocalStorageKeys.pencilmarksCheckerMode, value);
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

    const handleChangeHighlightSeenCells = (value: boolean) => {
        onStateChange({highlightSeenCells: value});
        saveBoolToLocalStorage(LocalStorageKeys.highlightSeenCells, value);
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
                    window.open(buildLink(
                        slug,
                        language,
                        {
                            ...getNewHostedGameParams(),
                            host: myClientId,
                            room: Math.random().toString().substring(2),
                            share: false,
                        },
                        true
                    ));
                }}
            >
                {translate("Host new game")}
            </SettingsButton>}

            {!getNewHostedGameParams && <SettingsButton
                type={"button"}
                cellSize={cellSize}
                onClick={() => {
                    window.open(buildLink(
                        slug,
                        language,
                        {
                            ...params,
                            // ...getNewHostedGameParams?.(),
                            host: myClientId,
                            room: Math.random().toString().substring(2),
                            share: true,
                        },
                        true
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
                    value={shortenedUrl}
                    onFocus={({target}) => target.select()}
                />

                <div style={{display: "inline-flex", alignItems: "center"}}>
                    <SettingsButton
                        type={"button"}
                        cellSize={cellSize}
                        onClick={async () => {
                            await window.navigator.clipboard.writeText(shortenedUrl);
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

        {!disableConflictChecker && !forceEnableConflictChecker && <>
            <SettingsItem>
                {translate("Highlight conflicts")}:

                <SettingsCheckbox
                    type={"checkbox"}
                    cellSize={cellSize}
                    checked={enableConflictChecker}
                    onChange={(ev) => handleChangeEnableConflictChecker(ev.target.checked)}
                />
            </SettingsItem>

            <SettingsItem>
                <span>{translate("Check pencilmarks")}:</span>

                <SettingsSelect
                    cellSize={cellSize}
                    disabled={!enableConflictChecker}
                    value={enableConflictChecker ? pencilmarksCheckerMode : PencilmarksCheckerMode.Off}
                    onChange={(ev) => handleChangePencilmarksCheckerMode(Number(ev.target.value))}
                >
                    <option value={PencilmarksCheckerMode.Off}>{translate("OFF")}</option>
                    <option value={PencilmarksCheckerMode.CheckObvious}>{translate({
                        [LanguageCode.en]: "Check obvious logic",
                        [LanguageCode.ru]: "Проверять очевидную логику",
                    })}</option>
                    <option value={PencilmarksCheckerMode.CheckAll}>{translate({
                        [LanguageCode.en]: "Check all",
                        [LanguageCode.ru]: "Проверять всё",
                    })}</option>
                </SettingsSelect>
            </SettingsItem>
        </>}

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

        {!getCellSelectionType && <SettingsItem>
            {translate("Highlight cells seen by selection")}:

            <SettingsCheckbox
                type={"checkbox"}
                cellSize={cellSize}
                checked={highlightSeenCells}
                onChange={(ev) => handleChangeHighlightSeenCells(ev.target.checked)}
            />
        </SettingsItem>}

        {settingsComponents.map((Component, index) => <Component key={`custom-${index}`} {...props}/>)}
    </div>;
};
