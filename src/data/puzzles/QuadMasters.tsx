import { PuzzleDefinitionLoader } from "../../types/puzzle/PuzzleDefinition";
import { createRegularGridSize, createRegularRegions } from "../../types/puzzle/GridSize";
import { LanguageCode } from "../../types/translations/LanguageCode";
import { generateRandomPuzzleDigits, getDailyRandomGeneratorSeed } from "../../utils/random";
import { QuadMastersTypeManager } from "../../puzzleTypes/quad-masters/types/QuadMastersTypeManager";
import { isValidFinishedPuzzleByConstraints } from "../../types/puzzle/Constraint";
import { getAutoRegionWidth } from "../../utils/regions";
import { RulesParagraph } from "../../components/puzzle/rules/RulesParagraph";
import { normalSudokuRulesApply } from "../ruleSnippets";
import {
    correctGuessRules,
    incorrectGuessMultiPlayerRules,
    incorrectGuessSinglePlayerRules,
    multiPlayerScoreRules,
    multiPlayerTurnsRules,
    phase,
    placeDigitRules,
    placeQuadRules,
    privatePencilmarksNote,
    quadBlackDigits,
    quadGreenDigits,
    quadGreyDigits,
    quadRedDigits,
    quadYellowDigits,
    singlePlayerScoreRules,
    twoPhasesGame,
} from "../../puzzleTypes/quad-masters/data/ruleSnippets";
import { RulesUnorderedList } from "../../components/puzzle/rules/RulesUnorderedList";
import { PartiallyTranslatable } from "../../types/translations/Translatable";
import { QuadMastersPTM } from "../../puzzleTypes/quad-masters/types/QuadMastersPTM";
import { translate } from "../../utils/translate";

export const getQuadMastersTitle = (
    daily: boolean,
    isQuadle: boolean,
    includeRandomWord?: boolean,
): PartiallyTranslatable => ({
    [LanguageCode.en]: (daily ? "Daily " : includeRandomWord ? "Random " : "") + (isQuadle ? "Quadle" : "Quad Masters"),
    [LanguageCode.ru]:
        (!daily && includeRandomWord ? "Случайный " : "") +
        (isQuadle ? "Quadle" : "Quad Masters") +
        (daily ? " дня" : ""),
});

export const generateQuadMasters = (
    slug: string,
    daily: boolean,
    isQuadle: boolean,
): PuzzleDefinitionLoader<QuadMastersPTM> => ({
    slug,
    noIndex: true,
    fulfillParams: ({ size = 9, regionWidth = getAutoRegionWidth(size), seed, ...other }) => ({
        size,
        regionWidth,
        seed: daily ? "daily" : (seed ?? Math.round(Math.random() * 1000000)),
        isRandom: !seed && !daily,
        ...other,
    }),
    loadPuzzle: ({ size: sizeStr, regionWidth: regionWidthStr, seed: seedStr, isRandom, host, ...otherParams }) => {
        const gridSize = Number(sizeStr);
        const regionWidth = Number(regionWidthStr);
        const randomSeed = daily ? getDailyRandomGeneratorSeed(isQuadle ? 1 : 0) : Number(seedStr);

        return {
            noIndex: true,
            extension: {},
            title: getQuadMastersTitle(daily, isQuadle),
            author: {
                [LanguageCode.en]: isQuadle ? "Maff and Chameleon" : "Maff",
                [LanguageCode.ru]: isQuadle ? "Maff и Хамелеона" : "Maff",
            },
            saveState: !isRandom,
            saveStateKey: `${slug}-${gridSize}-${regionWidth}-${randomSeed}`,
            getNewHostedGameParams: () => ({
                size: gridSize === 9 ? undefined : gridSize,
                regionWidth: regionWidth === getAutoRegionWidth(gridSize) ? undefined : regionWidth,
                seed: daily ? undefined : randomSeed,
                ...otherParams,
            }),
            solution: generateRandomPuzzleDigits(gridSize, regionWidth, randomSeed),
            typeManager: QuadMastersTypeManager(isQuadle),
            gridSize: createRegularGridSize(gridSize, regionWidth),
            regions: createRegularRegions(gridSize, gridSize, regionWidth),
            resultChecker: isValidFinishedPuzzleByConstraints,
            forceAutoCheckOnFinish: true,
            gridMargin: Math.max(0, (7 - gridSize) / 2),
            rules: () => (
                <>
                    <RulesParagraph>{translate(normalSudokuRulesApply)}.</RulesParagraph>
                    <RulesParagraph>{translate(host ? multiPlayerTurnsRules : twoPhasesGame)}.</RulesParagraph>
                    <RulesParagraph>{translate(phase)} 1:</RulesParagraph>
                    <RulesUnorderedList>
                        <li>{translate(placeQuadRules)}.</li>
                        {isQuadle && (
                            <>
                                <li>{translate(quadGreenDigits)}.</li>
                                <li>{translate(quadYellowDigits)}.</li>
                                <li>{translate(quadGreyDigits)}.</li>
                            </>
                        )}
                        {!isQuadle && (
                            <>
                                <li>{translate(quadBlackDigits)}.</li>
                                <li>{translate(quadRedDigits)}.</li>
                            </>
                        )}
                    </RulesUnorderedList>
                    <RulesParagraph>{translate(phase)} 2:</RulesParagraph>
                    <RulesUnorderedList>
                        <li>{translate(placeDigitRules)}.</li>
                        <li>{translate(correctGuessRules)}.</li>
                        <li>{translate(host ? incorrectGuessMultiPlayerRules : incorrectGuessSinglePlayerRules)}.</li>
                    </RulesUnorderedList>
                    <RulesParagraph>{translate(host ? multiPlayerScoreRules : singlePlayerScoreRules)}.</RulesParagraph>
                    {!!host && <RulesParagraph>{translate(privatePencilmarksNote)}.</RulesParagraph>}
                </>
            ),
        };
    },
});
