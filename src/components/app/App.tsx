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
import {LanguageCode} from "../../types/translations/LanguageCode";
import {CaterpillarEditor, CaterpillarConsumer} from "./Caterpillar";
import {SyncedLabel} from "./SyncedLabel";
import {PuzzleImportSource} from "../../types/sudoku/PuzzleImportOptions";

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
                title={translate({
                    [LanguageCode.en]: "For setters",
                    [LanguageCode.ru]: "Для авторов головоломок",
                    [LanguageCode.de]: "Für Setter",
                })}
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
                    source={PuzzleImportSource.FPuzzles}
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
                    source={PuzzleImportSource.SudokuMaker}
                />
            </PageLayout>;
        }
        case "caterpillar-editor":
            return <PageLayout scrollable={false}>
                <CaterpillarEditor key={params.chunk} chunk={params.chunk}/>
            </PageLayout>;
        case "caterpillar-consumer":
            return <CaterpillarConsumer key={params.chunk} chunk={params.chunk}/>;
        case "label":
            if (params.channel) {
                return <SyncedLabel name={params.channel} isObs={params.obs}/>;
            }
            break;
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
