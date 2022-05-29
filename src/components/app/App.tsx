import React, {useMemo} from "react";
import {Puzzle} from "../sudoku/puzzle/Puzzle";
import {useHash} from "../../hooks/useHash";
import {AllPuzzles} from "../../data/puzzles/AllPuzzles";
import {LanguageCode} from "../../types/translations/LanguageCode";
import {LanguageCodeContext, useLanguageCode, useTranslate} from "../../contexts/LanguageCodeContext";
import {AllowLmdContext} from "../../contexts/AllowLmdContext";
import {PageLayout} from "../layout/page-layout/PageLayout";
import {PuzzlesList} from "./PuzzlesList";
import {addLanguageToLink} from "../../utils/link";
import {PuzzleDefinition, PuzzleDefinitionLoader} from "../../types/sudoku/PuzzleDefinition";

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

const AppContent = ({hash = ""}: AppContentProps) => {
    const language = useLanguageCode();
    const translate = useTranslate();

    const {mainHash, params} = useMemo(() => {
        const [mainHash, ...encodedParams] = hash.split(":");

        const params: Record<string, any> = {};

        for (const encodedParam of encodedParams) {
            const [key, ...valueParts] = encodedParam.split("=");
            const value = valueParts.join();
            params[key] = valueParts.length ? value : true;
        }

        return {mainHash, params};
    }, [hash]);

    const puzzle = useMemo(() => {
        for (const puzzleOrLoader of AllPuzzles) {
            if (mainHash === puzzleOrLoader.slug) {
                const loader = puzzleOrLoader as PuzzleDefinitionLoader<any, any, any>;

                const fulfilledParams = typeof loader.loadPuzzle === "function"
                    ? loader.fulfillParams(params)
                    : params;

                const puzzle = typeof loader.loadPuzzle === "function"
                    ? loader.loadPuzzle(fulfilledParams)
                    : puzzleOrLoader as PuzzleDefinition<any, any, any>;

                return {
                    ...puzzle,
                    slug: puzzleOrLoader.slug,
                    params: {
                        ...puzzle.params,
                        ...fulfilledParams,
                    },
                };
            }
        }

        return undefined;
    }, [mainHash, params]);

    if (!mainHash || mainHash === "list") {
        return <PageLayout scrollable={true}>
            <PuzzlesList/>
        </PageLayout>;
    }

    if (puzzle) {
        return <PageLayout scrollable={false} addPadding={false}>
            <Puzzle key={hash} puzzle={puzzle}/>
        </PageLayout>;
    }

    return <PageLayout
        scrollable={true}
        title={translate("Oops, the puzzle not found!")}
    >
        <a href={addLanguageToLink("#list", language)}>{translate("Check out the puzzles list")}</a>
    </PageLayout>;
};
