import React, {useMemo} from "react";
import {Puzzle} from "../sudoku/puzzle/Puzzle";
import {useHash} from "../../hooks/useHash";
import {AllPuzzles} from "../../data/puzzles/AllPuzzles";
import {LanguageCodeContext, useLanguageCode, useTranslate} from "../../contexts/LanguageCodeContext";
import {AllowLmdContext} from "../../contexts/AllowLmdContext";
import {PageLayout} from "../layout/page-layout/PageLayout";
import {PuzzlesList} from "./PuzzlesList";
import {buildLink, parseLink} from "../../utils/link";
import {PuzzleDefinition, PuzzleDefinitionLoader} from "../../types/sudoku/PuzzleDefinition";

export const App = () => {
    let hash = useHash();

    const {slug, params} = useMemo(() => parseLink(hash), [hash]);

    return <LanguageCodeContext.Provider value={params.lang}>
        <AllowLmdContext.Provider value={!!params.lmd}>
            <AppContent hash={hash} slug={slug} params={params}/>
        </AllowLmdContext.Provider>
    </LanguageCodeContext.Provider>;
};

interface AppContentProps {
    hash: string;
    slug: string;
    params: any;
}

const AppContent = ({hash = ""}: AppContentProps) => {
    const language = useLanguageCode();
    const translate = useTranslate();

    const {slug, params} = useMemo(() => parseLink(hash), [hash]);

    const puzzle = useMemo(() => {
        for (const puzzleOrLoader of AllPuzzles) {
            if (slug === puzzleOrLoader.slug) {
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
    }, [slug, params]);

    if (!slug || slug === "list") {
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
        <a href={buildLink("list", language)}>{translate("Check out the puzzles list")}</a>
    </PageLayout>;
};
