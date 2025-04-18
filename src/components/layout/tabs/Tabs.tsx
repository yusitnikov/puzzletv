/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import { HTMLAttributes, ReactNode, useState } from "react";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../utils/profiler";
import { useRoute } from "../../../hooks/useRoute";
import { buildLink } from "../../../utils/link";
import { headerPadding, lighterGreyColor, lightGreyColor } from "../../app/globals";

const padding = headerPadding;

export interface Tab {
    id: string;
    title: ReactNode;
    contents: ReactNode;
}

export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
    tabs: Tab[];
    urlParam?: string;
}

export const Tabs = observer(function Tabs({ tabs, urlParam, style, ...divProps }: TabsProps) {
    profiler.trace();

    const { slug, params } = useRoute();
    const [selectedTabIdState, setSelectedTabIdState] = useState(tabs[0].id);
    const selectedTabId = urlParam ? params[urlParam] : selectedTabIdState;
    const selectedTab = tabs.find(({ id }) => id === selectedTabId);

    return (
        <div
            {...divProps}
            style={{
                ...style,
                display: "flex",
                flexDirection: "column",
                gap: padding,
            }}
        >
            <StyledTabsWrapper>
                {tabs.map(({ id, title }) => (
                    <StyledButton
                        key={id}
                        type={"button"}
                        isSelected={selectedTabId === id}
                        onClick={() => {
                            if (urlParam) {
                                window.location.replace(buildLink(slug, { ...params, [urlParam]: id }, true));
                            } else {
                                setSelectedTabIdState(id);
                            }
                        }}
                    >
                        {title}
                    </StyledButton>
                ))}
            </StyledTabsWrapper>
            {selectedTab && <div style={{ flex: 1 }}>{selectedTab.contents}</div>}
        </div>
    );
});

const StyledTabsWrapper = styled("div")({
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: padding,
});

const StyledButton = styled("button")<{ isSelected: boolean }>(({ isSelected }) => ({
    padding,
    background: isSelected ? lighterGreyColor : "#fff",
    border: `1px solid ${lightGreyColor}`,
    borderRadius: padding / 2,
    font: "inherit",
    cursor: "pointer",
}));
