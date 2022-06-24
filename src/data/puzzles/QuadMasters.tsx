import {PuzzleDefinitionLoader} from "../../types/sudoku/PuzzleDefinition";
import {createRegularFieldSize} from "../../types/sudoku/FieldSize";
import {LanguageCode} from "../../types/translations/LanguageCode";
import {generateRandomPuzzleDigits, getDailyRandomGeneratorSeed} from "../../utils/random";
import {QuadMastersSudokuTypeManager} from "../../sudokuTypes/quad-masters/types/QuadMastersSudokuTypeManager";
import {QuadMastersGameState} from "../../sudokuTypes/quad-masters/types/QuadMastersGameState";
import {isValidFinishedPuzzleByConstraints} from "../../types/sudoku/Constraint";
import {getAutoRegionWidth} from "../../utils/regions";
import {RulesParagraph} from "../../components/sudoku/rules/RulesParagraph";
import {normalSudokuRulesApply} from "../ruleSnippets";
import {
    correctGuessRules,
    incorrectGuessMultiPlayerRules,
    incorrectGuessSinglePlayerRules,
    multiPlayerScoreRules,
    multiPlayerTurnsRules,
    phase,
    placeDigitRules,
    placeQuadRules, privatePencilmarksNote,
    quadBlackDigits, quadGreenDigits, quadGreyDigits,
    quadRedDigits, quadYellowDigits,
    singlePlayerScoreRules,
    twoPhasesGame
} from "../../sudokuTypes/quad-masters/data/ruleSnippets";
import {RulesUnorderedList} from "../../components/sudoku/rules/RulesUnorderedList";
import {PartiallyTranslatable} from "../../types/translations/Translatable";

export const getQuadMastersTitle = (daily: boolean, isQuadle: boolean, includeRandomWord?: boolean): PartiallyTranslatable => ({
    [LanguageCode.en]: (daily ? "Daily " : (includeRandomWord ? "Random " : "")) + (isQuadle ? "Quadle" : "Quad Masters"),
    [LanguageCode.ru]: (!daily && includeRandomWord ? "Случайный " : "") + (isQuadle ? "Quadle" : "Quad Masters") + (daily ? " дня" : ""),
});

export const generateQuadMasters = (slug: string, daily: boolean, isQuadle: boolean): PuzzleDefinitionLoader<number, QuadMastersGameState, QuadMastersGameState> => ({
    slug,
    noIndex: true,
    fulfillParams: (
        {
            size = 9,
            regionWidth = getAutoRegionWidth(size),
            seed,
            ...other
        }
    ) => ({
        size,
        regionWidth,
        seed: daily ? "daily" : (seed ?? Math.round(Math.random() * 1000000)),
        isRandom: !seed && !daily,
        ...other
    }),
    loadPuzzle: ({size: sizeStr, regionWidth: regionWidthStr, seed: seedStr, isRandom, host, ...otherParams}) => {
        const fieldSize = Number(sizeStr);
        const regionWidth = Number(regionWidthStr);
        const randomSeed = daily ? getDailyRandomGeneratorSeed() : Number(seedStr);

        return {
            noIndex: true,
            title: getQuadMastersTitle(daily, isQuadle),
            author: {
                [LanguageCode.en]: isQuadle ? "Maff and Chameleon" : "Maff",
                [LanguageCode.ru]: isQuadle ? "Maff и Хамелеона" : "Maff",
            },
            slug,
            saveState: !isRandom,
            saveStateKey: `${slug}-${fieldSize}-${regionWidth}-${randomSeed}`,
            getNewHostedGameParams: () => ({
                size: fieldSize === 9 ? undefined : fieldSize,
                regionWidth: regionWidth === getAutoRegionWidth(fieldSize) ? undefined : regionWidth,
                seed: daily ? undefined : randomSeed,
                ...otherParams,
            }),
            typeManager: QuadMastersSudokuTypeManager(generateRandomPuzzleDigits(fieldSize, regionWidth, randomSeed), isQuadle),
            fieldSize: createRegularFieldSize(fieldSize, regionWidth),
            resultChecker: isValidFinishedPuzzleByConstraints,
            forceAutoCheckOnFinish: true,
            fieldMargin: Math.max(0, (7 - fieldSize) / 2),
            rules: translate => <>
                <RulesParagraph>{translate(normalSudokuRulesApply)}.</RulesParagraph>
                <RulesParagraph>{translate(host ? multiPlayerTurnsRules : twoPhasesGame)}.</RulesParagraph>
                <RulesParagraph>{translate(phase)} 1:</RulesParagraph>
                <RulesUnorderedList>
                    <li>{translate(placeQuadRules)}.</li>
                    {isQuadle && <>
                        <li>{translate(quadGreenDigits)}.</li>
                        <li>{translate(quadYellowDigits)}.</li>
                        <li>{translate(quadGreyDigits)}.</li>
                    </>}
                    {!isQuadle && <>
                        <li>{translate(quadBlackDigits)}.</li>
                        <li>{translate(quadRedDigits)}.</li>
                    </>}
                </RulesUnorderedList>
                <RulesParagraph>{translate(phase)} 2:</RulesParagraph>
                <RulesUnorderedList>
                    <li>{translate(placeDigitRules)}.</li>
                    <li>{translate(correctGuessRules)}.</li>
                    <li>{translate(host ? incorrectGuessMultiPlayerRules : incorrectGuessSinglePlayerRules)}.</li>
                </RulesUnorderedList>
                <RulesParagraph>{translate(host ? multiPlayerScoreRules : singlePlayerScoreRules)}.</RulesParagraph>
                {!!host && <RulesParagraph>{translate(privatePencilmarksNote)}.</RulesParagraph>}
            </>,
        };
    },
});
