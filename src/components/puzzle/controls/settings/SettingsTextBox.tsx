/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import { textColor, textHeightCoeff } from "../../../app/globals";

interface SettingsTextBoxProps {
    cellSize: number;
}

export const SettingsTextBox = styled("input", {
    shouldForwardProp(propName) {
        return propName !== "cellSize";
    },
})(({ cellSize }: SettingsTextBoxProps) => ({
    padding: "0.25em",
    margin: 0,
    width: cellSize * 2,
    height: cellSize * textHeightCoeff,
    border: `1px solid ${textColor}`,
    outline: "none",
    cursor: "text",
    fontSize: "inherit",
    lineHeight: "inherit",
    fontWeight: "inherit",
    fontFamily: "inherit",
    "* + &": {
        marginLeft: cellSize * textHeightCoeff,
    },
}));
