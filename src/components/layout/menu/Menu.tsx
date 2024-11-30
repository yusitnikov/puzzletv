/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import { textColor } from "../../app/globals";
import { Menu } from "@emotion-icons/material";
import { useLanguageCode } from "../../../hooks/useTranslate";
import { buildLink } from "../../../utils/link";
import { useRoute } from "../../../hooks/useRoute";
import { profiler } from "../../../utils/profiler";
import { observer } from "mobx-react-lite";
import { Dropdown } from "../dropdown/Dropdown";

export interface MenuItem {
    name: string;
    slug: string;
    fallbackSlugs?: string[];
}

const isCurrentMenuItem = ({ slug: itemSlug, fallbackSlugs = [] }: MenuItem, slug: string): boolean =>
    itemSlug === slug || fallbackSlugs.includes(slug);

export interface MenuProps {
    items: MenuItem[];
}

interface StyledMenuItemProps {
    active: boolean;
}

export const VerticalMenu = observer(function VerticalMenuFc({ items }: MenuProps) {
    profiler.trace();

    const language = useLanguageCode();
    const { slug } = useRoute();

    return (
        <Dropdown
            button={<Menu size={"1.2em"} />}
            items={items.map((item) => ({
                label: item.name,
                isSelected: isCurrentMenuItem(item, slug),
                href: buildLink(item.slug, language),
            }))}
        />
    );
});

export const HorizontalMenu = observer(function HorizontalMenuFc({ items }: MenuProps) {
    profiler.trace();

    const language = useLanguageCode();
    const { slug } = useRoute();

    return (
        <div>
            {items.map((item, index) => (
                <StyledHorizontalMenuItem
                    key={index}
                    href={buildLink(item.slug, language)}
                    active={isCurrentMenuItem(item, slug)}
                >
                    {item.name}
                </StyledHorizontalMenuItem>
            ))}
        </div>
    );
});

const StyledHorizontalMenuItem = styled("a", {
    shouldForwardProp(propName) {
        return propName !== "active";
    },
})(({ active }: StyledMenuItemProps) => ({
    marginLeft: "0.2em",
    color: textColor,
    padding: "0.1em 0.5em",
    border: "none",
    outline: "none",
    textDecoration: "none",
    background: active ? "rgba(0, 0, 0, 0.1)" : undefined,
    "&:focus, &:active, &:hover": {
        background: "rgba(0, 0, 0, 0.1)",
    },
}));
