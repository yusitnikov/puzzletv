/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import {lightGreyColor, textColor, textHeightCoeff} from "../../app/globals";
import {ButtonHTMLAttributes, useLayoutEffect, useRef} from "react";
import {isTouchDevice} from "../../../utils/isTouchDevice";
import {runInAction} from "mobx";
import {profiler} from "../../../utils/profiler";
import {observer} from "mobx-react-lite";

const StyledButton = styled("button", {
    shouldForwardProp(propName) {
        return propName !== "cellSize";
    }
})(({cellSize}: {cellSize: number}) => [
    {
        display: "inline-flex",
        alignItems: "center",
        cursor: "pointer",
        border: `1px solid ${textColor}`,
        outline: 0,
        "&:focus, &:active": {
            outline: `1px solid ${textColor}`,
        },
        backgroundColor: "#fff",
        fontSize: cellSize * textHeightCoeff,
    },
    !isTouchDevice && {
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
