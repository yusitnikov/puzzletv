import styled from "@emotion/styled";
import { lighterGreyColor, textColor } from "../../../components/app/globals";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";
import { CrackTheCodePTM } from "../types/CrackTheCodePTM";

export const getSizes = (context: PuzzleContext<CrackTheCodePTM>) => {
    const { cellSize } = context;

    const fontSize = cellSize * 0.05;

    return {
        fontSize,
        lineHeight: fontSize * 1.15,
        gap: fontSize * 0.5,
    };
};

export const BaseInput = styled("input")({
    font: "inherit",
    lineHeight: "1.15rem",
    border: `1px solid ${textColor}`,
    boxSizing: "border-box",
});

// noinspection UnnecessaryLocalVariableJS
export const buttonHighlightColor = lighterGreyColor;
export const BaseButton = styled("button")({
    font: "inherit",
    cursor: "pointer",
    boxSizing: "border-box",
    borderRadius: 0,
    background: "none",
    ":hover, :active, :focus": {
        background: buttonHighlightColor,
    },
});
export const BorderlessButton = styled(BaseButton)({
    border: "none",
    padding: "0 0.5rem",
});
