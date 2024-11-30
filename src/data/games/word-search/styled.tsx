/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import { lightGreyColor } from "../../../components/app/globals";

export const GridItem = styled("div")({
    display: "flex",
    flexDirection: "column",
    gap: "1em",
    border: `1px solid ${lightGreyColor}`,
    borderRadius: "1em",
    padding: "1em",
    textAlign: "center",
});

export const GridItemTitle = styled("div")({
    fontWeight: "bold",
    fontSize: "120%",
});

export const GridItemList = styled("div")({
    display: "flex",
    flexDirection: "column",
    gap: "0.25em",
});
