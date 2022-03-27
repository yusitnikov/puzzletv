/** @jsxImportSource @emotion/react */
import {ButtonHTMLAttributes, ReactNode} from "react";
import {Absolute} from "../../layout/absolute/Absolute";
import {Position} from "../../../types/layout/Position";
import styled from "@emotion/styled";
import {lightGreyColor, textColor} from "../../app/globals";

export const controlButtonPaddingCoeff = 0.15;

const StyledContainer = styled(Absolute, {
    shouldForwardProp(propName: PropertyKey): boolean {
        return propName !== "isActive" && propName !== "opacityOnHover";
    }
})(({isActive, opacityOnHover}: {isActive?: boolean, opacityOnHover?: boolean}) => ({
    textAlign: "center",
    border: 0,
    padding: 0,
    margin: 0,
    cursor: "pointer",
    color: textColor,
    backgroundColor: isActive ? lightGreyColor : "white",
    "&:hover": {
        backgroundColor: lightGreyColor,
        opacity: opacityOnHover ? 0.8 : 1,
    },
}));

export interface ControlButtonProps extends Position, ButtonHTMLAttributes<HTMLButtonElement> {
    cellSize: number;
    checked?: boolean;
    flipDirection?: boolean;
    fullSize?: boolean;
    innerBorderWidth?: number;
    opacityOnHover?: boolean;
    children?: ReactNode | ((contentSize: number) => ReactNode);
}

export const ControlButton = ({children, left, top, cellSize, flipDirection, fullSize, innerBorderWidth, checked, ...otherProps}: ControlButtonProps) => {
    const contentSize = fullSize
        ? cellSize
        : cellSize * 0.7;
    const contentOffset = (cellSize - contentSize) / 2;

    return <StyledContainer
        tagName={"button"}
        type={"button"}
        left={cellSize * (1 + controlButtonPaddingCoeff) * (flipDirection ? top : left)}
        top={cellSize * (1 + controlButtonPaddingCoeff) * (flipDirection ? left : top)}
        width={cellSize}
        height={cellSize}
        borderWidth={3}
        isActive={checked}
        tabIndex={-1}
        {...otherProps}
    >
        <Absolute
            left={contentOffset}
            top={contentOffset}
            width={contentSize}
            height={contentSize}
            borderWidth={innerBorderWidth}
            style={{
                fontSize: contentSize,
                lineHeight: `${contentSize}px`,
            }}
        >
            {typeof children === "function" ? children(contentSize) : children}
        </Absolute>
    </StyledContainer>;
};
