/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import {lightGreyColor, textColor, textHeightCoeff} from "../../app/globals";
import {ButtonHTMLAttributes, useLayoutEffect, useRef} from "react";

const StyledButton = styled("button", {
    shouldForwardProp(propName) {
        return propName !== "cellSize";
    }
})(({cellSize}: {cellSize: number}) => ({
    cursor: "pointer",
    border: `1px solid ${textColor}`,
    outline: 0,
    "&:focus, &:active": {
        outline: `1px solid ${textColor}`,
    },
    backgroundColor: "#fff",
    "&:hover": {
        backgroundColor: lightGreyColor,
    },
    fontSize: cellSize * textHeightCoeff,
}));

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    cellSize: number;
    autoFocus?: boolean;
}

export const Button = ({autoFocus, children, ...buttonProps}: ButtonProps) => {
    const ref = useRef<HTMLButtonElement>(null);

    useLayoutEffect(() => {
        if (autoFocus) {
            ref.current?.focus();
        }
    }, [autoFocus]);

    return <StyledButton
        ref={ref}
        {...buttonProps}
    >
        {children}
    </StyledButton>;
};
