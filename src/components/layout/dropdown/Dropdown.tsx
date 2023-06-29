/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import {ReactNode, useCallback, useState} from "react";
import {lightGreyColor, textColor} from "../../app/globals";
import {createPortal} from "react-dom";
import {useEventListener} from "../../../hooks/useEventListener";
import FocusTrap from "focus-trap-react";
import {runInAction} from "mobx";
import {profiler} from "../../../utils/profiler";
import {observer} from "mobx-react-lite";

interface DropdownItem {
    label: ReactNode;
    isSelected: boolean;
    href?: string;
    onClick?: () => void,
}

interface DropdownProps {
    className?: string;
    button: ReactNode;
    items: DropdownItem[];
    align?: "left" | "right";
}

export const Dropdown = observer(function DropdownFc({className, button, items, align = "left"}: DropdownProps) {
    profiler.trace();

    const [open, setOpen] = useState(false);
    const toggleOpen = useCallback(() => setOpen(open => !open), [setOpen]);
    const close = useCallback(() => setOpen(false), [setOpen]);

    return <>
        {open && <BackDrop onClose={close}/>}

        <div
            className={className}
            onClick={() => runInAction(toggleOpen)}
            style={{position: "relative", cursor: "pointer"}}
        >
            {button}

            {open && <FocusTrap focusTrapOptions={{
                allowOutsideClick: true,
                initialFocus: false,
            }}>
                <div style={{
                    position: "absolute",
                    zIndex: 2,
                    border: `1px solid ${textColor}`,
                    backgroundColor: lightGreyColor,
                    lineHeight: "1em",
                    marginTop: "0.25em",
                    right: align === "right" ? 0 : undefined,
                }}>
                    {items.map(({label, isSelected, href = "#", onClick}, index) => <StyledItem
                        key={index}
                        href={href}
                        active={isSelected}
                        onClick={onClick && ((ev) => {
                            onClick();
                            ev.preventDefault();
                        })}
                    >
                        {label}
                    </StyledItem>)}
                </div>
            </FocusTrap>}
        </div>
    </>;
});

const StyledItem = styled("a", {
    shouldForwardProp(propName) {
        return propName !== "active";
    },
})(({active}: {active: boolean}) => ({
    display: "flex",
    alignItems: "center",
    gap: "0.25em",
    whiteSpace: "nowrap",
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
