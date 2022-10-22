/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import {textColor, textHeightCoeff} from "../../../app/globals";

interface SettingsSelectProps {
    cellSize: number;
}

export const SettingsSelect = styled("select", {
    shouldForwardProp(propName) {
        return propName !== "cellSize";
    }
})(({cellSize}: SettingsSelectProps) => ({
    padding: "0.25em",
    margin: 0,
    // width: cellSize * 2,
    border: `1px solid ${textColor}`,
    outline: "none",
    fontSize: "inherit",
    lineHeight: "inherit",
    fontWeight: "inherit",
    fontFamily: "inherit",
    "* + &": {
        marginLeft: cellSize * textHeightCoeff,
    },
}));
