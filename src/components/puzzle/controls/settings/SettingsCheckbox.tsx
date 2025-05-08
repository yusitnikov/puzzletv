/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import { textHeightCoeff } from "../../../app/globals";

interface SettingsCheckboxProps {
    cellSize: number;
}

export const SettingsCheckbox = styled("input", {
    shouldForwardProp(propName) {
        return propName !== "cellSize";
    },
})(({ cellSize }: SettingsCheckboxProps) => ({
    padding: 0,
    margin: 0,
    marginLeft: cellSize * textHeightCoeff,
    width: cellSize * textHeightCoeff * 0.8,
    height: cellSize * textHeightCoeff * 0.8,
}));
