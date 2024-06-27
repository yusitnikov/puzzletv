import React, {useMemo} from "react";
import {Puzzle} from "../sudoku/puzzle/Puzzle";
import {useRoute} from "../../hooks/useRoute";
import {AllPuzzles} from "../../data/puzzles/AllPuzzles";
import {useLanguageCode, useTranslate} from "../../hooks/useTranslate";
import {PageLayout} from "../layout/page-layout/PageLayout";
import {PuzzlesList} from "./PuzzlesList";
import {buildLink} from "../../utils/link";
import {loadPuzzle} from "../../types/sudoku/PuzzleDefinition";
import {GamesList} from "./GamesList";
import {HomePage} from "./HomePage";
import {ContactMe} from "./ContactMe";
import {ForSetters} from "./ForSetters";
import {WizardPage} from "./WizardPage";
import {HowToImport} from "./HowToImport";
import {useGesturesGlobalEvents} from "../../utils/gestures";
import {observer} from "mobx-react-lite";
import {useUpdateControlKeysState} from "../../hooks/useControlKeysState";
import {FPuzzlesGridParserFactory} from "../../data/puzzles/FPuzzles";
import {SudokuMakerGridParserFactory} from "../../data/puzzles/SudokuMaker";
import {LanguageCode} from "../../types/translations/LanguageCode";

interface AppProps {
    onPageLoaded?: () => void;
}

export const App = observer(({onPageLoaded}: AppProps) => {
    const {hash = "", slug, params} = useRoute();

    const language = useLanguageCode();
    const translate = useTranslate();

    useGesturesGlobalEvents();
    useUpdateControlKeysState();

    const puzzle = useMemo(() => {
        for (const puzzleOrLoader of AllPuzzles) {
            if (slug === puzzleOrLoader.slug) {
                const puzzle = loadPuzzle(puzzleOrLoader, params);

                if (!puzzle.getNewHostedGameParams && params.host && !params.share) {
                    continue;
                }

                return puzzle;
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
                <PuzzlesList onLoaded={onPageLoaded}/>
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
                title={translate("For setters")}
            >
                <ForSetters/>
            </PageLayout>;
        case "how-to-import-puzzle":
            return <PageLayout
                scrollable={true}
                title={translate("How to import puzzle")}
            >
                <HowToImport/>
            </PageLayout>;
        case "contacts":
            return <PageLayout
                scrollable={true}
                title={translate("Contacts")}
            >
                <ContactMe/>
            </PageLayout>;
        case "f-puzzles-wizard": {
            const title = translate({
                [LanguageCode.en]: "Import from f-puzzles",
                [LanguageCode.ru]: "Импорт из f-puzzles",
                [LanguageCode.de]: "Aus f-puzzles importieren",
            });

            return <PageLayout
                scrollable={true}
                title={title}
                hideTitleHeader={true}
            >
                <WizardPage
                    load={params.load}
                    slug={"f-puzzles"}
                    title={title}
                    typeLabel={"f-puzzles"}
                    gridParserFactory={FPuzzlesGridParserFactory}
                />
            </PageLayout>;
        }
        case "sudokumaker-wizard": {
            const title = translate({
                [LanguageCode.en]: "Import from SudokuMaker",
                [LanguageCode.ru]: "Импорт из SudokuMaker'а",
                [LanguageCode.de]: "Aus SudokuMaker importieren",
            });

            return <PageLayout
                scrollable={true}
                title={title}
                hideTitleHeader={true}
            >
                <WizardPage
                    load={params.load}
                    slug={"sudokumaker"}
                    title={title}
                    typeLabel={"SudokuMaker"}
                    gridParserFactory={SudokuMakerGridParserFactory}
                />
            </PageLayout>;
        }
    }

    if (puzzle) {
        return <PageLayout key={hash} scrollable={false} addPadding={false}>
            <Puzzle puzzle={puzzle}/>
        </PageLayout>;
    }

    return <PageLayout
        scrollable={true}
        title={translate("Oops, the puzzle not found!")}
    >
        <a href={buildLink("", language)}>{translate("Go to the home page")}</a>
    </PageLayout>;
});
