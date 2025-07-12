import { ReactElement, useEffect, useState } from "react";
import { translate } from "../../../../utils/translate";
import { textHeightCoeff } from "../../../app/globals";
import InputSlider from "react-input-slider";
import { PuzzleContext } from "../../../../types/puzzle/PuzzleContext";
import { myClientId } from "../../../../hooks/useMultiPlayer";
import { buildLink } from "../../../../utils/link";
import { Check, Share } from "@emotion-icons/material";
import { SettingsItem } from "./SettingsItem";
import { SettingsButton } from "./SettingsButton";
import { SettingsTextBox } from "./SettingsTextBox";
import { SettingsCheckbox } from "./SettingsCheckbox";
import { SettingsSelect } from "./SettingsSelect";
import { PencilmarksCheckerMode } from "../../../../types/puzzle/PencilmarksCheckerMode";
import { LanguageCode } from "../../../../types/translations/LanguageCode";
import { shortenUrl } from "../../../../services/tinyUrl";
import { AnyPTM } from "../../../../types/puzzle/PuzzleTypeMap";
import { AnimationSpeed } from "../../../../types/puzzle/AnimationSpeed";
import { observer } from "mobx-react-lite";
import { settings } from "../../../../types/layout/Settings";
import { profiler } from "../../../../utils/profiler";
import { useCopyToClipboard } from "../../../../hooks/useCopyToClipboard";

// Temporarily disable collective solve while it's buggy
const disableNetwork = true;

export interface SettingsContentProps<T extends AnyPTM> {
    context: PuzzleContext<T>;
    cellSize: number;
}

export const SettingsContent = observer(function SettingsContent<T extends AnyPTM>(props: SettingsContentProps<T>) {
    profiler.trace();

    const { cellSize, context } = props;

    const {
        puzzle: {
            slug,
            params,
            getNewHostedGameParams,
            resultChecker,
            forceAutoCheckOnFinish,
            typeManager: {
                disableBackgroundColorOpacity,
                disableConflictChecker,
                settingsComponents = [],
                getCellHighlight,
            },
        },
        multiPlayer: { isEnabled },
    } = context;

    const enableConflictChecker = settings.enableConflictChecker.get();

    const textSize = cellSize * textHeightCoeff;

    const [copy, isCopied] = useCopyToClipboard();

    const fullUrl = window.location.href;
    const [shortenedUrl, setShortenedUrl] = useState(fullUrl);
    useEffect(() => {
        if (isEnabled) {
            shortenUrl(fullUrl).then(setShortenedUrl);
        }
    }, [isEnabled, fullUrl]);

    return (
        <div>
            <div style={{ fontSize: textSize * 1.5, marginBottom: textSize }}>
                <strong>{translate("Settings")}</strong>
            </div>

            {!disableNetwork && (
                <SettingsItem noLabel={true}>
                    <i>{translate(isEnabled ? "Multi-player mode" : "Single-player mode")}.</i>

                    {getNewHostedGameParams && (
                        <SettingsButton
                            type={"button"}
                            cellSize={cellSize}
                            onClick={() => {
                                window.open(
                                    buildLink(
                                        slug,
                                        {
                                            ...getNewHostedGameParams(),
                                            host: myClientId,
                                            room: Math.random().toString().substring(2),
                                            share: false,
                                        },
                                        true,
                                    ),
                                );
                            }}
                        >
                            {translate("Host new game")}
                        </SettingsButton>
                    )}

                    {!getNewHostedGameParams && (
                        <SettingsButton
                            type={"button"}
                            cellSize={cellSize}
                            onClick={() => {
                                window.open(
                                    buildLink(
                                        slug,
                                        {
                                            ...params,
                                            // ...getNewHostedGameParams?.(),
                                            host: myClientId,
                                            room: Math.random().toString().substring(2),
                                            share: true,
                                        },
                                        true,
                                    ),
                                );
                            }}
                        >
                            {translate("Start collective solve")}
                        </SettingsButton>
                    )}
                </SettingsItem>
            )}

            {isEnabled && (
                <SettingsItem>
                    <div style={{ display: "inline-flex", alignItems: "center" }}>
                        <span>{translate("Share the link to the game")}:</span>

                        <Share size={"1em"} style={{ marginLeft: "0.5em" }} />
                    </div>
                    <div style={{ marginTop: textSize * 0.25 }}>
                        <SettingsTextBox
                            type={"text"}
                            readOnly={true}
                            cellSize={cellSize}
                            value={shortenedUrl}
                            onFocus={({ target }) => target.select()}
                        />

                        <div style={{ display: "inline-flex", alignItems: "center" }}>
                            <SettingsButton type={"button"} cellSize={cellSize} onClick={() => copy(shortenedUrl)}>
                                {translate("Copy")}
                            </SettingsButton>

                            <div style={{ position: "relative", width: 1, height: textSize }}>
                                {isCopied && <Check size={textSize} style={{ position: "absolute" }} />}
                            </div>
                        </div>
                    </div>
                </SettingsItem>
            )}

            {isEnabled && (
                <SettingsItem>
                    <span>{translate("Nickname")}:</span>

                    <SettingsTextBox
                        type={"text"}
                        cellSize={cellSize}
                        value={settings.nickname.get()}
                        onChange={(ev) => settings.nickname.set(ev.target.value)}
                    />
                </SettingsItem>
            )}

            {!disableConflictChecker && (
                <>
                    <SettingsItem>
                        {translate("Highlight conflicts")}:
                        <SettingsCheckbox
                            type={"checkbox"}
                            cellSize={cellSize}
                            checked={enableConflictChecker}
                            onChange={(ev) => settings.enableConflictChecker.set(ev.target.checked)}
                        />
                    </SettingsItem>

                    <SettingsItem>
                        <span>{translate("Check pencilmarks")}:</span>

                        <SettingsSelect
                            cellSize={cellSize}
                            disabled={!enableConflictChecker}
                            value={
                                enableConflictChecker
                                    ? settings.pencilmarksCheckerMode.get()
                                    : PencilmarksCheckerMode.Off
                            }
                            onChange={(ev) => settings.pencilmarksCheckerMode.set(Number(ev.target.value))}
                        >
                            <option value={PencilmarksCheckerMode.Off}>{translate("OFF")}</option>
                            <option value={PencilmarksCheckerMode.CheckObvious}>
                                {translate({
                                    [LanguageCode.en]: "Check obvious logic",
                                    [LanguageCode.ru]: "Проверять очевидную логику",
                                    [LanguageCode.de]: "Die offensichtliche Logik",
                                })}
                            </option>
                            <option value={PencilmarksCheckerMode.CheckAll}>
                                {translate({
                                    [LanguageCode.en]: "Check all",
                                    [LanguageCode.ru]: "Проверять всё",
                                    [LanguageCode.de]: "Alle überprüfen",
                                })}
                            </option>
                        </SettingsSelect>
                    </SettingsItem>
                </>
            )}

            {resultChecker && !forceAutoCheckOnFinish && (
                <SettingsItem>
                    {translate("Auto-check on finish")}:
                    <SettingsCheckbox
                        type={"checkbox"}
                        cellSize={cellSize}
                        checked={settings.autoCheckOnFinish.get()}
                        onChange={(ev) => settings.autoCheckOnFinish.set(ev.target.checked)}
                    />
                </SettingsItem>
            )}

            <SettingsItem>
                {translate("Flip keypad")}:
                <SettingsCheckbox
                    type={"checkbox"}
                    cellSize={cellSize}
                    checked={settings.flipKeypad.get()}
                    onChange={(ev) => settings.flipKeypad.set(ev.target.checked)}
                />
            </SettingsItem>

            {!disableBackgroundColorOpacity && (
                <SettingsItem>
                    {translate("Background color's opacity")}:<br />
                    <InputSlider
                        axis={"x"}
                        x={settings.backgroundOpacity.get()}
                        xmin={0.1}
                        xmax={1}
                        xstep={0.1}
                        onChange={({ x }) => settings.backgroundOpacity.set(x)}
                    />
                </SettingsItem>
            )}

            {!getCellHighlight && (
                <SettingsItem>
                    {translate("Highlight cells seen by selection")}:
                    <SettingsCheckbox
                        type={"checkbox"}
                        cellSize={cellSize}
                        checked={settings.highlightSeenCells.get()}
                        onChange={(ev) => settings.highlightSeenCells.set(ev.target.checked)}
                    />
                </SettingsItem>
            )}

            <SettingsItem>
                {translate({
                    [LanguageCode.en]: "Simplified graphics",
                    [LanguageCode.ru]: "Упрощенная графика",
                    [LanguageCode.de]: "Vereinfachte Grafiken",
                })}
                :
                <SettingsCheckbox
                    type={"checkbox"}
                    cellSize={cellSize}
                    checked={settings.simplifiedGraphics.get()}
                    onChange={(ev) => settings.simplifiedGraphics.set(ev.target.checked)}
                />
            </SettingsItem>

            <SettingsItem>
                <span>
                    {translate({
                        [LanguageCode.en]: "Animation speed",
                        [LanguageCode.ru]: "Скорость анимации",
                        [LanguageCode.de]: "Animationsgeschwindigkeit",
                    })}
                    :
                </span>

                <SettingsSelect
                    cellSize={cellSize}
                    value={settings.animationSpeed.get()}
                    onChange={(ev) => settings.animationSpeed.set(Number(ev.target.value))}
                >
                    <option value={AnimationSpeed.regular}>
                        {translate({
                            [LanguageCode.en]: "Regular",
                            [LanguageCode.ru]: "Обычная",
                            [LanguageCode.de]: "Regelmäßig",
                        })}
                    </option>
                    <option value={AnimationSpeed.immediate}>
                        {translate({
                            [LanguageCode.en]: "No animation",
                            [LanguageCode.ru]: "Без анимации",
                            [LanguageCode.de]: "Keine Animation",
                        })}
                    </option>
                    <option value={AnimationSpeed.slow}>
                        {translate({
                            [LanguageCode.en]: "Slow",
                            [LanguageCode.ru]: "Медленная",
                            [LanguageCode.de]: "Langsam",
                        })}
                    </option>
                </SettingsSelect>
            </SettingsItem>

            {settingsComponents.map((Component, index) => (
                <Component key={`custom-${index}`} {...props} />
            ))}
        </div>
    );
}) as <T extends AnyPTM>(props: SettingsContentProps<T>) => ReactElement;
