/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import React, {FC, ReactNode} from "react";
import {headerHeight, headerPadding, lightGreyColor, textColor} from "../../app/globals";
import {useLanguageCode, useTranslate} from "../../../hooks/useTranslate";
import {buildLink} from "../../../utils/link";
import {HorizontalMenu, MenuItem, VerticalMenu} from "../menu/Menu";
import {useWindowSize} from "../../../hooks/useWindowSize";
import {Title} from "../title/Title";
import {observer} from "mobx-react-lite";
import {profiler} from "../../../utils/profiler";
import {LanguageSelector} from "../language-selector/LanguageSelector";
import {LanguageCode} from "../../../types/translations/LanguageCode";

export interface PageLayoutProps {
    addPadding?: boolean;
    scrollable: boolean;
    title?: ReactNode;
    hideTitleHeader?: boolean;
    addTitleSuffix?: boolean;
    children: ReactNode;
}

export const PageLayout = observer(function PageLayout(
    {addPadding = true, scrollable, title, hideTitleHeader, addTitleSuffix = true, children}: PageLayoutProps
) {
    profiler.trace();

    const language = useLanguageCode();
    const translate = useTranslate();

    const {width: windowWidth} = useWindowSize();
    const showHorizontalMenu = windowWidth >= 800;

    const menuItems: MenuItem[] = [
        {
            name: translate({
                [LanguageCode.en]: "Home page",
                [LanguageCode.ru]: showHorizontalMenu ? "Домашняя" : "Домашняя страница",
                [LanguageCode.de]: "Startseite",
            }),
            slug: "",
            fallbackSlugs: ["home"],
        },
        {
            name: translate("Puzzles"),
            slug: "puzzles",
            fallbackSlugs: ["list"],
        },
        {
            name: translate("Games"),
            slug: "games",
        },
        {
            name: translate({
                [LanguageCode.en]: "For setters",
                [LanguageCode.ru]: showHorizontalMenu ? "Для авторов" : "Для авторов головоломок",
                [LanguageCode.de]: "Für Setter",
            }),
            slug: "for-setters",
        },
    ];

    return <StyledPageContainer>
        {title && <Title>{title}{addTitleSuffix && " – Puzzle TV"}</Title>}

        <StyledHeaderContainer>
            <StyledHorizontalFlex style={{width: "100%"}}>
                <StyledHorizontalFlex style={{flex: "1 0 0"}}>
                    {!showHorizontalMenu && <VerticalMenu items={menuItems}/>}

                    <a
                        href={buildLink("", language)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            color: "inherit",
                            textDecoration: "none",
                            fontSize: headerHeight * 0.6,
                        }}
                        title={translate("Go to the home page")}
                    >
                        <span>Puzzle</span>
                        <svg style={{width: headerHeight * 1.2, height: headerHeight, marginLeft: "0.2em"}}
                             viewBox={"0 0 30 25"}>
                            <rect x={2} y={5} width={26} height={15} fill={textColor} stroke={textColor}/>
                            <line x1={8} y1={5} x2={5} y2={1} stroke={textColor}/>
                            <line x1={22} y1={5} x2={25} y2={1} stroke={textColor}/>
                            <line x1={4} y1={8} x2={14} y2={8} stroke={"#fff"}/>
                            <line x1={9} y1={8} x2={9} y2={18} stroke={"#fff"}/>
                            <line x1={16} y1={7.5} x2={21} y2={18} stroke={"#fff"}/>
                            <line x1={26} y1={7.5} x2={21} y2={18} stroke={"#fff"}/>
                        </svg>
                    </a>

                    {showHorizontalMenu && <HorizontalMenu items={menuItems}/>}
                </StyledHorizontalFlex>

                <div><LanguageSelector/></div>
            </StyledHorizontalFlex>
        </StyledHeaderContainer>

        <div style={{
            position: "absolute",
            left: 0,
            top: headerHeight,
            right: 0,
            bottom: 0,
            padding: addPadding ? headerPadding : 0,
            overflow: scrollable ? "auto" : "hidden",
        }}>
            {!hideTitleHeader && title && <PageTitle>{title}</PageTitle>}

            {children}
        </div>
    </StyledPageContainer>;
});

export const PageTitle: FC = observer(function PageTitle({children}) {
    profiler.trace();

    return <h1 style={{marginTop: 0}}>{children}</h1>;
});


const StyledPageContainer = styled("div")`
  position: absolute;
  inset: 0;
  overflow: hidden;
  color: ${textColor};
  font-family: Lato, sans-serif;
`;

const StyledHeaderContainer = styled("div")({
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    height: headerHeight,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: lightGreyColor,
    fontSize: headerHeight * 0.5,
    lineHeight: "1em",
    padding: `0 ${headerPadding}px`,
});

const StyledHorizontalFlex = styled("div")({
    display: "flex",
    alignItems: "center",
    columnGap: "0.5em",
});
