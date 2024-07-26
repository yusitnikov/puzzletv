/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import {darkGreyColor, lightGreyColor, textColor, textHeightCoeff} from "../../app/globals";
import {ButtonHTMLAttributes, useLayoutEffect, useRef} from "react";
import {isTouchDevice} from "../../../utils/isTouchDevice";
import {runInAction} from "mobx";
import {profiler} from "../../../utils/profiler";
import {observer} from "mobx-react-lite";

const StyledButton = styled("button", {
    shouldForwardProp(propName) {
        return propName !== "cellSize";
    }
})<{cellSize: number}>(({cellSize, disabled}) => [
    {
        display: "inline-flex",
        alignItems: "center",
        border: `1px solid ${darkGreyColor}`,
        outline: 0,
        backgroundColor: "#fff",
        fontSize: cellSize * textHeightCoeff,
    },
    !disabled && {
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
]);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    cellSize: number;
    autoFocus?: boolean;
}

export const Button = observer(function ButtonFc({autoFocus, children, onClick, ...buttonProps}: ButtonProps) {
    profiler.trace();

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
