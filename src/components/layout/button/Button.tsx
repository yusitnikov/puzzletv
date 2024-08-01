/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import {darkGreyColor, lightGreyColor, textColor, textHeightCoeff} from "../../app/globals";
import {AnchorHTMLAttributes, ButtonHTMLAttributes, useLayoutEffect, useMemo, useRef} from "react";
import {isTouchDevice} from "../../../utils/isTouchDevice";
import {runInAction} from "mobx";
import {profiler} from "../../../utils/profiler";
import {observer} from "mobx-react-lite";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonHTMLAttributes<HTMLButtonElement>> {
    component?: "button" | "a";
    cellSize?: number;
    autoFocus?: boolean;
}

export const Button = observer(function ButtonFc({component = "button", autoFocus, children, onClick, ...buttonProps}: ButtonProps) {
    profiler.trace();

    const StyledButton = useMemo(() => styled(component as "button", {
        shouldForwardProp(propName) {
            return propName !== "cellSize";
        }
    })<{cellSize?: number, disabled?: boolean}>(({cellSize, disabled}) => [
        {
            display: "inline-flex",
            alignItems: "center",
            border: `1px solid ${darkGreyColor}`,
            outline: 0,
            backgroundColor: "#fff",
            fontSize: cellSize === undefined ? "inherit" : cellSize * textHeightCoeff,
            textDecoration: "none",
            padding: "1px 0.4em",
            fontFamily: "inherit",
        },
        !disabled && {
            color: "inherit",
            cursor: "pointer",
            border: `1px solid ${textColor}`,
            "&:focus, &:active": {
                outline: `1px solid ${textColor}`,
            },
        },
        !disabled && !isTouchDevice && {
            "&:hover": {
                backgroundColor: lightGreyColor,
            },
        },
    ]), [component]);

    const ref = useRef<HTMLButtonElement>(null);

    useLayoutEffect(() => {
        if (autoFocus) {
            ref.current?.focus();
        }
    }, [autoFocus]);

    return <StyledButton
        ref={ref}
        onClick={(ev) => runInAction(() => onClick?.(ev))}
        {...buttonProps}
    >
        {children}
    </StyledButton>;
});
