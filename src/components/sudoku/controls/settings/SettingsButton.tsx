/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import { textHeightCoeff } from "../../../app/globals";
import { Button } from "../../../layout/button/Button";

interface SettingsButtonProps {
    cellSize: number;
}

export const SettingsButton = styled(Button)(({ cellSize }: SettingsButtonProps) => ({
    padding: "0.25em",
    margin: 0,
    marginLeft: cellSize * textHeightCoeff,
    fontSize: "inherit",
    lineHeight: "inherit",
    fontWeight: "inherit",
    fontFamily: "inherit",
}));
