/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import {CSSProperties, useCallback, useState} from "react";
import {Menu} from "@emotion-icons/material";
import {headerHeight, lightGreyColor, textColor} from "../../app/globals";
import {useLanguageCode} from "../../../hooks/useTranslate";
import {buildLink} from "../../../utils/link";
import {createPortal} from "react-dom";
import {useEventListener} from "../../../hooks/useEventListener";
import FocusTrap from "focus-trap-react";
import {useRoute} from "../../../hooks/useRoute";
import {runInAction} from "mobx";
import {profiler} from "../../../utils/profiler";
import {observer} from "mobx-react-lite";

const fontSize = headerHeight * 0.5;

export interface MenuItem {
    name: string;
    slug: string;
    fallbackSlugs?: string[];
}

const isCurrentMenuItem = ({slug: itemSlug, fallbackSlugs = []}: MenuItem, slug: string): boolean =>
    itemSlug === slug || fallbackSlugs.includes(slug);

export interface MenuProps {
    className?: string;
    style?: CSSProperties;

    items: MenuItem[];
}

interface StyledMenuItemProps {
    active: boolean;
}

export const VerticalMenu = observer(function VerticalMenuFc({className, style, items}: MenuProps) {
    profiler.trace();

    const language = useLanguageCode();
    const {slug} = useRoute();

    const [open, setOpen] = useState(false);
    const toggleOpen = useCallback(() => setOpen(open => !open), [setOpen]);
    const close = useCallback(() => setOpen(false), [setOpen]);

    return <>
        {open && <BackDrop onClose={close}/>}

        <div
            className={className}
            onClick={() => runInAction(toggleOpen)}
            style={{
                ...style,
                cursor: "pointer",
            }}
        >
            <Menu size={"1em"}/>

            {open && <FocusTrap focusTrapOptions={{
                allowOutsideClick: true,
                initialFocus: false,
            }}>
                <div style={{
                    position: "absolute",
                    zIndex: 2,
                    border: `1px solid ${textColor}`,
                    backgroundColor: lightGreyColor,
                    fontSize,
                    lineHeight: "1em",
                }}>
                    {items.map((item, index) => <StyledVerticalMenuItem
                        key={index}
                        href={buildLink(item.slug, language)}
                        active={isCurrentMenuItem(item, slug)}
                    >
                        {item.name}
                    </StyledVerticalMenuItem>)}
                </div>
            </FocusTrap>}
        </div>
    </>;
});

const StyledVerticalMenuItem = styled("a", {
    shouldForwardProp(propName) {
        return propName !== "active";
    },
})(({active}: StyledMenuItemProps) => ({
    display: "block",
    color: textColor,
    padding: "0.2em 0.5em",
    border: "none",
    outline: "none",
    textDecoration: "none",
    background: active ? "rgba(0, 0, 0, 0.1)" : undefined,
    "&:focus, &:active, &:hover": {
        background: "rgba(0, 0, 0, 0.1)",
    },
}));

export const HorizontalMenu = observer(function HorizontalMenuFc({className, style, items}: MenuProps) {
    profiler.trace();

    const language = useLanguageCode();
    const {slug} = useRoute();

    return <div
        className={className}
        style={{
            ...style,
            fontSize,
            lineHeight: "1em",
        }}
    >
        {items.map((item, index) => <StyledHorizontalMenuItem
            key={index}
            href={buildLink(item.slug, language)}
            active={isCurrentMenuItem(item, slug)}
        >
            {item.name}
        </StyledHorizontalMenuItem>)}
    </div>;
});

const StyledHorizontalMenuItem = styled("a", {
    shouldForwardProp(propName) {
        return propName !== "active";
    },
})(({active}: StyledMenuItemProps) => ({
    marginLeft: "0.2em",
    color: textColor,
    padding: "0.1em 0.5em",
    border: "none",
    outline: "none",
    textDecoration: "none",
    background: active ? "rgba(0, 0, 0, 0.1)" : undefined,
    "&:focus, &:active, &:hover": {
        background: "rgba(0, 0, 0, 0.1)",
    },
}));

interface BackDropProps {
    onClose: () => void;
}

const BackDrop = observer(function BackDropFc({onClose}: BackDropProps) {
    profiler.trace();

    useEventListener(window, "keydown", ({code}) => {
        if (code === "Escape") {
            onClose();
        }
    });

    return createPortal(
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 1,
            }}
            onClick={() => runInAction(onClose)}
        />,
        window.document.body
    );
});
