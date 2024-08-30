/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import {Button, ButtonProps} from "../../../components/layout/button/Button";
import {observer} from "mobx-react-lite";
import {Check} from "@emotion-icons/material";

export const paragraphGap = "1em"

export const SubHeader = styled("h2")({margin: "0 0 0.25em"});
export const Paragraph = styled("div")({marginTop: paragraphGap});
export const LinkText = styled("span")({color: "blue"});
export const DeleteButton = styled("button")({
    position: "absolute",
    right: "0.1em",
    top: 0,
    bottom: 0,
    margin: "auto",
    font: "inherit",
    lineHeight: "1.4em",
    width: "1.4em",
    height: "1.4em",
    cursor: "pointer",
    padding: 0,
    background: "transparent",
    border: "none",
    outline: "none",
});

export const LargeButton = observer(function LargeButton({checked, children, ...props}: ButtonProps & {checked?: boolean}) {
    return <Button
        {...props}
        style={{
            ...props.style,
            padding: checked ? "0.5em 0.4em" : "0.5em 1em",
        }}
    >
        {checked && <Check size={"1em"} style={{marginRight: "0.2em"}}/>}{children}
    </Button>;
});
