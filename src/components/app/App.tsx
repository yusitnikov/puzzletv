import React from "react";
import {Puzzle} from "../sudoku/puzzle/Puzzle";
import {useHash} from "../../hooks/useHash";
import AllPuzzles from "../../data/puzzles/AllPuzzles";
import {LanguageCode} from "../../types/translations/LanguageCode";
import {LanguageCodeContext, useLanguageCode, useTranslate} from "../../contexts/LanguageCodeContext";
import {AllowLmdContext} from "../../contexts/AllowLmdContext";

export const App = () => {
    let hash = useHash();

    let language = LanguageCode.en;

    for (const languageOption in LanguageCode) {
        const suffix = `-${languageOption}`;

        if (hash.endsWith(suffix)) {
            language = languageOption as LanguageCode;
            hash = hash.substring(0, hash.length - suffix.length);
            break;
        }
    }

    let allowLmd = false;
    if (hash.endsWith("-lmd")) {
        allowLmd = true;
        hash = hash.substring(0, hash.length - 4);
    }

    return <LanguageCodeContext.Provider value={language}>
        <AllowLmdContext.Provider value={allowLmd}>
            <AppContent hash={hash}/>
        </AllowLmdContext.Provider>
    </LanguageCodeContext.Provider>;
};

interface AppContentProps {
    hash: string;
}

const AppContent = ({hash}: AppContentProps) => {
    const language = useLanguageCode();
    const translate = useTranslate();

    if (!hash || hash === "list") {
        return <>
            <h1>{translate("Sudoku Puzzles")}</h1>

            <ul>
                {AllPuzzles.map(({slug, title, noIndex}) => !noIndex && <li key={slug}>
                    <a href={`#${slug}-${language}`}>{translate(title)}</a>
                </li>)}
            </ul>
        </>;
    }

    for (const puzzle of AllPuzzles) {
        if (hash === puzzle.slug) {
            return <Puzzle key={puzzle.slug} puzzle={puzzle}/>;
        }
    }

    return <>
        <h1>{translate("Oops, the puzzle not found!")}</h1>

        <a href={`#list-${language}`}>{translate("Check out the puzzles list")}</a>
    </>;
};
