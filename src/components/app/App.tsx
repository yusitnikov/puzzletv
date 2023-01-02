import React, {useMemo} from "react";
import {Puzzle} from "../sudoku/puzzle/Puzzle";
import {useRoute} from "../../hooks/useRoute";
import {AllPuzzles} from "../../data/puzzles/AllPuzzles";
import {useLanguageCode, useTranslate} from "../../hooks/useTranslate";
import {PageLayout} from "../layout/page-layout/PageLayout";
import {PuzzlesList} from "./PuzzlesList";
import {buildLink} from "../../utils/link";
import {PuzzleDefinition, PuzzleDefinitionLoader} from "../../types/sudoku/PuzzleDefinition";
import {GamesList} from "./GamesList";
import {HomePage} from "./HomePage";
import {ContactMe} from "./ContactMe";
import {ForSetters} from "./ForSetters";
import {FPuzzlesWizardPage} from "./FPuzzlesWizardPage";

export const App = () => {
    const {hash = "", slug, params} = useRoute();

    const language = useLanguageCode();
    const translate = useTranslate();

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

                if (!puzzle.getNewHostedGameParams && params.host && !params.share) {
                    continue;
                }

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

    switch (slug) {
        case "":
        case "home":
            return <PageLayout
                scrollable={true}
                title={translate("Welcome to Puzzle TV!")}
                addTitleSuffix={false}
            >
                <HomePage/>
            </PageLayout>;
        case "puzzles":
        case "list":
            return <PageLayout
                scrollable={true}
                title={translate("Puzzles")}
            >
                <PuzzlesList/>
            </PageLayout>;
        case "games":
            return <PageLayout
                scrollable={true}
                title={translate("Games")}
            >
                <GamesList/>
            </PageLayout>;
        case "for-setters":
            return <PageLayout
                scrollable={true}
                title={translate("For Setters")}
            >
                <ForSetters/>
            </PageLayout>;
        case "contacts":
            return <PageLayout
                scrollable={true}
                title={translate("Contacts")}
            >
                <ContactMe/>
            </PageLayout>;
        case "f-puzzles-wizard":
            return <PageLayout
                scrollable={true}
                title={translate("Import from f-puzzles")}
            >
                <FPuzzlesWizardPage load={params.load}/>
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
        <a href={buildLink("", language)}>{translate("Go to the home page")}</a>
    </PageLayout>;
};
