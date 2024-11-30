/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import { ReactElement } from "react";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../utils/profiler";
import { useLanguageCode } from "../../../hooks/useTranslate";
import { allLanguageCodes, LanguageCode, languageNames } from "../../../types/translations/LanguageCode";
import { darkGreyColor } from "../../app/globals";
import { Dropdown } from "../dropdown/Dropdown";
import { useRoute } from "../../../hooks/useRoute";
import { buildLink } from "../../../utils/link";

export const LanguageSelector = observer(function LanguageSelector() {
    profiler.trace();

    const currentLanguage = useLanguageCode();
    const { slug, params } = useRoute();

    return (
        <Dropdown
            align={"right"}
            button={<StyledFlag>{flags[currentLanguage]}</StyledFlag>}
            items={allLanguageCodes.map((language) => ({
                label: (
                    <>
                        <StyledFlag>{flags[language]}</StyledFlag>
                        {languageNames[language]}
                    </>
                ),
                isSelected: language === currentLanguage,
                href: buildLink(slug, language, params),
            }))}
        />
    );
});

const flags: Record<LanguageCode, ReactElement> = {
    [LanguageCode.en]: (
        <>
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: "#012169",
                }}
            />

            <div
                style={{
                    position: "absolute",
                    inset: "42% -50%",
                    background: "#fff",
                    transform: "rotate(35deg)",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    inset: "47% -50%",
                    background: "#c8102e",
                    transform: "rotate(35deg)",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    inset: "42% -50%",
                    background: "#fff",
                    transform: "rotate(-35deg)",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    inset: "47% -50%",
                    background: "#c8102e",
                    transform: "rotate(-35deg)",
                }}
            />

            <div
                style={{
                    position: "absolute",
                    inset: "35% 0",
                    background: "#fff",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    inset: "0 35%",
                    background: "#fff",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    inset: "42% 0",
                    background: "#c8102e",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    inset: "0 42%",
                    background: "#c8102e",
                }}
            />
        </>
    ),
    [LanguageCode.ru]: (
        <>
            <div
                style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 0,
                    height: "33%",
                    background: "#fff",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: "33%",
                    height: "34%",
                    background: "#0033a0",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: "67%",
                    height: "33%",
                    background: "#da291c",
                }}
            />
        </>
    ),
    [LanguageCode.de]: (
        <>
            <div
                style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 0,
                    height: "33%",
                    background: "#000",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: "33%",
                    height: "34%",
                    background: "#d00",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: "67%",
                    height: "33%",
                    background: "#fc0",
                }}
            />
        </>
    ),
};

const StyledFlag = styled("div")({
    position: "relative",
    width: "1em",
    height: "1em",
    border: `1px solid ${darkGreyColor}`,
    borderRadius: "50%",
    overflow: "hidden",
    cursor: "pointer",
});
