import React, {ReactNode} from "react";
import {headerHeight, headerPadding, lightGreyColor, textColor} from "../../app/globals";
import {useLanguageCode, useTranslate} from "../../../hooks/useTranslate";
import {buildLink} from "../../../utils/link";
import {HorizontalMenu, MenuItem, VerticalMenu} from "../menu/Menu";
import {useWindowSize} from "../../../hooks/useWindowSize";

export interface PageLayoutProps {
    addPadding?: boolean;
    scrollable: boolean;
    title?: ReactNode;
    children: ReactNode;
}

export const PageLayout = ({addPadding = true, scrollable, title, children}: PageLayoutProps) => {
    const language = useLanguageCode();
    const translate = useTranslate();

    const {width: windowWidth} = useWindowSize();
    const showHorizontalMenu = windowWidth >= 800;

    const menuItems: MenuItem[] = [
        {
            name: translate("Home page"),
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
    ];

    return <div style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        touchAction: "none",
        userSelect: "none",
        color: textColor,
        fontFamily: "Lato, sans-serif",
    }}>
        <div style={{
            position: "absolute",
            left: 0,
            top: 0,
            right: 0,
            height: headerHeight,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: lightGreyColor,
            fontSize: headerHeight * 0.6,
            lineHeight: "1em",
            padding: `0 ${headerPadding}px`,
        }}>
            <div style={{
                display: "flex",
                alignItems: "center",
                columnGap: "0.5em",
            }}>
                {!showHorizontalMenu && <VerticalMenu items={menuItems}/>}

                <a
                    href={buildLink("", language)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        color: "inherit",
                        textDecoration: "none"
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
            </div>
        </div>

        <div style={{
            position: "absolute",
            left: 0,
            top: headerHeight,
            right: 0,
            bottom: 0,
            padding: addPadding ? headerPadding : 0,
            overflow: scrollable ? "auto" : "hidden",
        }}>
            {title && <h1 style={{marginTop: 0}}>{title}</h1>}

            {children}
        </div>
    </div>;
};
