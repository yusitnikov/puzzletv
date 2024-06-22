/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import {ReactNode} from "react";
import {observer} from "mobx-react-lite";
import {profiler} from "../../../utils/profiler";
import {useRoute} from "../../../hooks/useRoute";
import {useLanguageCode} from "../../../hooks/useTranslate";
import {buildLink} from "../../../utils/link";
import {headerPadding, lighterGreyColor, lightGreyColor} from "../../app/globals";

const padding = headerPadding;

export interface Tab {
    id: string;
    title: ReactNode;
    contents: ReactNode;
}

export interface TabsProps {
    tabs: Tab[];
    urlParam?: string;
}

export const Tabs = observer(function Tabs({tabs, urlParam = "tab"}: TabsProps) {
    profiler.trace();

    const {slug, params} = useRoute();
    const language = useLanguageCode();
    const selectedTabId = params[urlParam];
    const selectedTab = tabs.find(({id}) => id === selectedTabId);

    return <div>
        <StyledTabsWrapper>
            {tabs.map(({id, title}) => <StyledButton
                key={id}
                type={"button"}
                isSelected={selectedTabId === id}
                onClick={() => window.location.replace(buildLink(slug, language, {...params, [urlParam]: id}, true))}
            >
                {title}
            </StyledButton>)}
        </StyledTabsWrapper>
        {selectedTab && <div style={{marginTop: padding}}>{selectedTab.contents}</div>}
    </div>;
});

const StyledTabsWrapper = styled("div")({
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: padding,
});

const StyledButton = styled("button")<{isSelected: boolean}>(({isSelected}) => ({
    padding,
    background: isSelected ? lighterGreyColor : "#fff",
    border: `1px solid ${lightGreyColor}`,
    borderRadius: padding / 2,
    font: "inherit",
    cursor: "pointer",
}));
