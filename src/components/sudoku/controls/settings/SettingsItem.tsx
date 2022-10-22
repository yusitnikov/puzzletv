/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import {FC} from "react";

interface SettingsItemProps {
    noLabel?: boolean;
}

const StyledSettingsItem = styled("div", {
    shouldForwardProp(propName) {
        return propName !== "noLabel";
    },
})(({noLabel}: SettingsItemProps) => ({
    marginBottom: "0.5em",
    "*": {
        cursor: noLabel ? undefined : "pointer",
    },
}));

export const SettingsItem: FC<SettingsItemProps> = ({noLabel, children}) => <StyledSettingsItem noLabel={noLabel}>
    {noLabel ? children : <label>{children}</label>}
</StyledSettingsItem>;
