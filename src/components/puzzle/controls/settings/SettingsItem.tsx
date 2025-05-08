/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import { FC } from "react";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../../utils/profiler";

interface SettingsItemProps {
    noLabel?: boolean;
}

const StyledSettingsItem = styled("div", {
    shouldForwardProp(propName) {
        return propName !== "noLabel";
    },
})(({ noLabel }: SettingsItemProps) => ({
    marginBottom: "0.5em",
    "*": {
        cursor: noLabel ? undefined : "pointer",
    },
}));

export const SettingsItem: FC<SettingsItemProps> = observer(function SettingsItemFc({ noLabel, children }) {
    profiler.trace();

    return <StyledSettingsItem noLabel={noLabel}>{noLabel ? children : <label>{children}</label>}</StyledSettingsItem>;
});
