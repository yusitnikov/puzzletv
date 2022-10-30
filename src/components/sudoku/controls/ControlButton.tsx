/** @jsxImportSource @emotion/react */
import {ButtonHTMLAttributes, memo, MouseEvent, ReactNode} from "react";
import {Absolute} from "../../layout/absolute/Absolute";
import {Position} from "../../../types/layout/Position";
import {Size} from "../../../types/layout/Size";
import styled from "@emotion/styled";
import {lightGreyColor, textColor} from "../../app/globals";
import {EmotionIconBase} from "@emotion-icons/emotion-icon";

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
    [EmotionIconBase.toString()]: {
        verticalAlign: "top",
    },
}));

export interface ControlButtonProps extends Position, Partial<Size>, ButtonHTMLAttributes<HTMLButtonElement> {
    cellSize: number;
    checked?: boolean;
    fullWidth?: boolean;
    fullHeight?: boolean;
    innerBorderWidth?: number;
    opacityOnHover?: boolean;
    children?: ReactNode | ((contentSize: number) => ReactNode);
    childrenOnTopOfBorders?: boolean;
}

export const ControlButton = memo((
    {
        children,
        childrenOnTopOfBorders,
        left,
        top,
        width = 1,
        height = 1,
        cellSize,
        fullWidth,
        fullHeight,
        innerBorderWidth,
        checked,
        ...otherProps
    }: ControlButtonProps
) => {
    const containerWidth = cellSize * (width + controlButtonPaddingCoeff * (width - 1));
    const containerHeight = cellSize * (height + controlButtonPaddingCoeff * (height - 1));
    const contentHeight = fullHeight
        ? cellSize
        : cellSize * 0.7;
    const contentWidth = fullWidth ? containerWidth : contentHeight;

    return <StyledContainer
        tagName={"button"}
        type={"button"}
        left={cellSize * (1 + controlButtonPaddingCoeff) * left}
        top={cellSize * (1 + controlButtonPaddingCoeff) * top}
        width={containerWidth}
        height={containerHeight}
        borderWidth={3}
        isActive={checked}
        tabIndex={-1}
        pointerEvents={true}
        onMouseDown={(ev: MouseEvent<HTMLButtonElement>) => ev.stopPropagation()}
        childrenOnTopOfBorders={childrenOnTopOfBorders}
        {...otherProps}
    >
        <Absolute
            left={(containerWidth - contentWidth) / 2}
            top={(containerHeight - contentHeight) / 2}
            width={contentWidth}
            height={contentHeight}
            borderWidth={innerBorderWidth}
            childrenOnTopOfBorders={childrenOnTopOfBorders}
            style={{
                fontSize: contentHeight,
                lineHeight: `${contentHeight}px`,
            }}
        >
            {typeof children === "function" ? children(contentHeight) : children}
        </Absolute>
    </StyledContainer>;
});
