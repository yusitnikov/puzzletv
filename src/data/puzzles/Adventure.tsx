import { FPuzzles } from "./Import";
import { PuzzleImportOptions } from "../../types/puzzle/PuzzleImportOptions";
import { PuzzleDefinition, PuzzleDefinitionLoader } from "../../types/puzzle/PuzzleDefinition";
import { NumberPTM } from "../../types/puzzle/PuzzleTypeMap";
import { AdventurePTM } from "../../puzzleTypes/adventure/types/AdventurePTM";
import { CellsMap, createCellsMapFromArray, mergeCellsMaps } from "../../types/puzzle/CellsMap";
import { LanguageCode } from "../../types/translations/LanguageCode";
import { AdventureTypeManager } from "../../puzzleTypes/adventure/types/AdventureTypeManager";
import { GridSize9, Regions9 } from "../../types/puzzle/GridSize";
import { Constraint, toDecorativeConstraint } from "../../types/puzzle/Constraint";
import { PuzzleContext } from "../../types/puzzle/PuzzleContext";
import { KropkiDotConstraint } from "../../components/puzzle/constraints/kropki-dot/KropkiDot";
import { WhispersConstraint } from "../../components/puzzle/constraints/whispers/Whispers";
import { translate } from "../../utils/translate";
import {
    blackKropkiDotsExplained,
    whiteKropkiDotsExplained,
    germanWhispersTitle,
    germanWhispersExplained,
    thermometersExplained,
    killerCagesExplained,
    cannotRepeatInCage
} from "../ruleSnippets";
import { RulesParagraph } from "../../components/puzzle/rules/RulesParagraph";
import { RulesUnorderedList } from "../../components/puzzle/rules/RulesUnorderedList";
import { ThermometerConstraint } from "../../components/puzzle/constraints/thermometer/Thermometer";
import { KillerCageConstraint } from "../../components/puzzle/constraints/killer-cage/KillerCage";
import { RegionSumLineConstraint } from "../../components/puzzle/constraints/region-sum-line/RegionSumLine";

export const Adventure1: PuzzleDefinitionLoader<AdventurePTM<NumberPTM>> = {
    loadPuzzle: () =>
        FPuzzles.loadPuzzle({
            load: "N4IgzglgXgpiBcBOANCALhNAbO8QGEALGAJxIE8ACAISwHsww6BbEVAQwFc1C6SEQAWXZYSdAOZsQJTjjAw0AgHJ9mIymE4ATOgGtOlGXMrsADqazkAdAB0AdgBEI4zGA0xT7EuzQwtlACMqdkoAd0JMGEodNBMSKIBjOjt5BO4IADcYW0dnV0oIOxMwiN9KBIgSBJxKZk4wWLNTGC8TWJx2BspkhKjCyh4ogDM6ThINMbFOOy1C8XKYLCwwHIAFMYsomLcvKNNMuljTOkK0NxHx9jsqas4YNzRRhIi7ecHKhaXkEohnuKixGgfH5yvQErpQhB5HFRjMBsQPvsModKMdTvCpuJCJQlBpfKY3HQhpREAAGaIwcTxe7fcKkKK4qHwqIZER3bpFQaog5oHIAJUOwP8t3utXYVDoWRIWDMgW4tXqsTsKJgAA9fHDRmcIFoolyqTqrFIDVoEABtM3AAC+yGttptdsdDud9oAushLS6nfafd7re7Pb6vcGgwG/SHw26PZGY8GwxGE6Ho4nY1HA6nY/Gg9nM+6QLMhkN6XZeubQL0lmBzSA+QBmfAARikdfwACYQK6HSAK8tq3zW/gAOzN+vDzu27uLXvwM01gAs+AArM2FwA2DtdntVmfzpfNxd78flqfb2d8wf4WvNi9zjcTrd9gAce9Q58Pm5PT8vzef7c7eYAR04dgtBkTYy0nSs+wHJtXwHdtX3rWCa3rP9UFZLA7lPBtkEXZBECPSDpzPBs22bUirzgsiqKvPMMKw81a2QQdCIfHc+VI4dX1Ix9mwHLiawHXi6LZe5zTnZBH1Yz92KEvj8EQEd8F4xCFI7dDROw3D8OkqD2IPAS+QPFSa1XIdmzM4SNMwsSZ1bZAJNXXTiN3ddXwXQyDzcmsDPUkB6Nss0mLwliPz0s8LxMt9FNfZ8oufRSRJs097KYudnNPHzv1fA9b1fMzKNM/BbyShiZxwxcMr7BcEN3QqjOorLaOssqzQkvCnLCly32Qt9ar5Z9et/PyAtPWt/1QCoqhwCC2LPGC/ICToYHwAQAGJECHRdNqkLUsEKFb1tJY6TqkEY7DQVa8DWk7TtQSEtB4BBSSsVs8JABEsUUeAXrerrMv7b88yW+QrpADatp21A9oOsGbtu0kzuSS6joRqQHqen7Xvez7CG+37F3+6DzOB5a4c2wdttW6HuH2uxDuuhHEdQc6UcZtH7p1TGCdQXH8exonZLU0nQfWimqd22nYdR26kYuuGmfRrnCGe7HeZgZw8dVv77xks810Wsmxch6mQBh+mFY5kBWct2XOcelWsbe9XNf5nXj3CrKrJAEGGfB8WobNqWLZlu7reR22w4xx2eY+jWvu1wndc96LDdF66A9N82/fhu3w/l0PjqVh3E5dhOnaTj3urMkrUF98mTcl7BpfZvObcL5mQGj0u49dxPBbPA80J9o2M8bmnm5D1uw/b6ei/t7m1d78uCYHmthpFnPM6bumc8VlmI474vF+d5etYrq08wSdhxFwS1/NEgRmDAcQkjIGAEjQeBKHwZIqR8WQPgIDJDAAAQnsAAdUWEkZgeo6DMkMDAZEmEMDJFAVIOaNZSJNjzNnOGhYCFDHnvnNm4NCGFiLpfVAmgEi9EYIIe4YAb64AIH/bwaBAGoJSOAuwUCsAwLgQg+IyD0hoKkEwFBwC7DmjwigCSOF7KrmYpJZATEmIKOUSgR8yAlF4Ucso7RwUHLIHsjhFAijkA4QkoObSTEtH4WMXheyhjLHKKUS4mxSizHaQkvZGx2jdHGPsigdRrjgkqKYjY/RejbEOK8SovxnYgA==",
        } as PuzzleImportOptions),
    noIndex: false,
    slug: "adventure1",
};

const S = undefined;
export const Adventure2: PuzzleDefinition<AdventurePTM<number>> = {
    
    title: { [LanguageCode.en]: "Adventure is out there!" },
    author: { [LanguageCode.en]: "Tumbo" },
    slug: "adventure2",
    initialDigits: { 8: { 4: 1 } },
    typeManager: AdventureTypeManager(),
    gridSize: GridSize9,
    regions: Regions9,
    // https://sudokumaker.app/?puzzle=N4IgZg9gTgtghgFwGoFMoGcCWEB2IBcIAjAHQCsJADCADQgAOArgF7MA2KBoOcMnhtEHEYIAFtAIhBAYxRs26AgG1QANzhtG-AJwBfGqGlwcAE0wnEKRfiJlK%2Bw8bMWEVgkQAcDkEdPnL1gBs3uqa-F4GPk7%2BrtZEACzx3gDmmKooePgIUFp0oVoEwZH5-GQhGgX4AMzevs4B7oERjn4ubjZVzVGtDfjaRS31se72xRU6tdFtcdoATOVhBElji-hdqemZ2bkgJQTzkXUx7bMey4PH1qeTPcPVs6MX0%2B4HauMEZYdTvR6Pu%2B99FJpDIEbYoPIAohAzagnLg-6rADsNyGJz%2BR2e%2BAe0JBWThENWekiG1xYIJlWRK0qNSp-ChxOBW3xCMqXT2%2BAGLNKKMu%2Bw8bIBnIxvVOAsJC0q5y5%2Bwl-BpbyRsvcPMxRCqQu%2BdzVXWFWr%2B7LFlU57M%2BCsqr2lgNpSxxTJ27PpZvCSvwlNAJLt8PZUo9sPtAItvrx-vF1vwppAQbJlvlluNgpdRKdMoZMODXoBEajzIdtr9GdWsezIYpLp9jPz5OdX1uJylJpVIvLaej7M5xYLpdTpJzAPWFfTVeV3c9Q6xecHlr0AF06NJcOhsnBMDgENYVCAEABPej8P7b3fuOhQFCpBfKSg0S%2BXog0W%2B32Y0R%2BP69Xu-vh9Pr%2Bvm8fr-PmgqkA4D4hoUDQLIGhIMgoDYLA%2BCIKgpC4KA8D4OgpDAhoLCsMRGg8LwjwaCIoicOw-CKMI4jqLI3DKOokjp28A85UoS8QHQNgIAAdwIMANHQeExDQGAID4VwMGUJR4lvKpZMvWZtFnJRAjwsgiLIPDAlwyDEVwxFp1nDjtw4LgfAgLioEkABiaQ7PswQxEwaQAGscCsaxKBIICQAAI0YNhfIAJTgMxGE8kgkl0JjdCAA
    solution: createCellsMapFromArray([
        [S, S, S, S, S, S, 6, 5, 3],
        [S, S, S, S, S, S, S, 8, 2],
        [S, S, S, S, S, S, S, 1, 7],
        [S, S, 9, 7, S, S, 8, 6, S],
        [S, S, S, S, S, S, S, 7, S],
        [S, S, S, S, S, S, S, 9, S],
        [1, S, S, 4, 2, 9, 5, 3, 6],
        [S, S, S, 5, 1, 3, 7, 4, 8],
        [S, S, S, 6, 7, 8, 1, 2, 9],
    ]),
    items: (context) => {
        return [
            ...getAdventureConstraints(context),
        ].map(toDecorativeConstraint);
    },
}

type choiceDefinitions = {
    solveCells: [number, number][]
    topMessage: string,
    option1ChoiceMessage: string
    option1TakenMessage: string
    option2ChoiceMessage: string
    option2TakenMessage: string
    option1: choiceTaken
    option2: choiceTaken
}

type choiceTaken = {
    initialDigits: CellsMap<number>
    constraints: Constraint<AdventurePTM, any>[]
    rules: string[]
    choices: choiceDefinitions | undefined
}

const adventure2Def: choiceTaken = {
    initialDigits: { 6: { 0: 1 }, 7: { 4: 1}, 8: { 7: 2, 8: 9}},
    constraints: [],
    rules: [],
    choices: {
        solveCells: [[8, 6]],
        topMessage: "FirstChoice",
        option1ChoiceMessage: "FirstChoice option 1",
        option1TakenMessage: "FirstChoice option 1 Taken",
        option2ChoiceMessage: "FirstChoice option 2",
        option2TakenMessage: "FirstChoice option 2 Taken",
        option1: {
            // https://sudokumaker.app/?puzzle=N4IgZg9gTgtghgFwGoFMoGcCWEB2IBcIAjAHQCsJADCADQgAOArgF7MA2KBoOcMnhtEHEYIAFtAIhBAYxRs26AgG1Q0uDgAmmDYhSL8ATjIA2AL41V6rToR6CRgBznLm7bv2PnINa5t3DZE4W3lZuth4mXj7W7vaBXgDmmABuKHj4CFCMKHTJcGzZBGbB0WH%2BACxBLjHhBABM5VGhfvpElETF1WWt7VUhvrH4bUR9pS0Ew6PNg8Od-TX%2Bk00DtfgODcsL%2BgDsxn15Bfx1m90EDgbHJdOr55dd42sXJw%2B3z4OvVyv%2BH-fvG8EHQpDLyA-jbN6rNp1SgQxaUOp3eanIbwxFjGao2E9aFYiaYz5bM51KZffQNGEE5FEBG4lE4ykPKFo65wmkMjFs36Q%2BEUrms5mkokkwn4cm06kCkVQ3lIxn4vnYyVU%2BWyjky9Hczmqm7E2m7YVUrVJVLpTLZXL5IFEcXtJVy6k2h3s7lOhV413air7S38ADM4o9Gv8xl9cyD%2BhDYZZEdDtMjiRSaQIZpyIFBEzjsYBPoI4Odiw96bWtLIlEa%2Bf0pfLbvwVZLZfr1c9lYb2cOGeCxqTGSyqaLiK7pt7FvbhlMAF06NJcOhMnBMDgEPoVCAEABPej8GXrzcTOhQFBJGfKSg0U%2Bnog0S%2BXuo0W%2B389nq-Pm93t%2BPi8vt-3mi%2B3--8oaEAwCyBoUDQL-SCgOgkCwLgqC-2A6DwLg4waDQtDthoLCsIcGg8LwjD0OwkjcPw8iiMw0jyII8cvB3fhynaOg2AXfwlCUYwDGw7jtkvYxLzIOpJyUOpQLqNCiCwjp8PHScQBgBcABFMDAMA0DSWQCFAkBZzXDguG8CA2AkQgAGJjG2MBKEswQxEwaQAGscD0fRKBIIgyFMCdvKAA
            initialDigits: { 0: {6: 6}},
            constraints: [WhispersConstraint(["R8C7", "R9C8", "R8C9", "R7C8", "R6C8"]),
                        WhispersConstraint(["R3C8", "R3C9", "R2C9", "R2C8", "R1C9"])],
            rules: [`${translate(germanWhispersTitle)}: ${translate(germanWhispersExplained())}`],
            choices: {
                solveCells: [[1, 8], [2, 7], [2, 8], [6, 7], [7, 6], [7, 8]],
                topMessage: "SecondChoice 1",
                option1ChoiceMessage: "SecondChoice 1 option 1",
                option1TakenMessage: "SecondChoice 1 option 1 Taken",
                option2ChoiceMessage: "SecondChoice 1 option 2",
                option2TakenMessage: "SecondChoice 1 option 2 Taken",
                option1: {
                    initialDigits: {},
                    constraints: [KropkiDotConstraint("R2C1", "R2C2", true)],
                    rules: [translate(blackKropkiDotsExplained)],
                    choices: undefined
                },
                option2: {
                    initialDigits: {},
                    constraints: [KropkiDotConstraint("R2C1", "R2C2", false)],
                    rules: [translate(whiteKropkiDotsExplained)],
                    choices: undefined
                }
            }
        },
        option2: {
            // https://sudokumaker.app/?puzzle=N4IgZg9gTgtghgFwGoFMoGcCWEB2IBcIAjAHQCsJADCADQgAOArgF7MA2KBoOcMnhtEHEYIAFtAIhBAYxRs26AgG1Q0uDgAmmDYhSL8RSgCZKAXxqr1WnQj0FDRo%2Bcubtu-WUPOQa1zbv4AOwAHE4WPlZutvrBsd6%2B1u4ERgAsAGzxkf76gWkpmX5J%2BKlm4QlRAUQmBYnR9salLrWVxmFNFR5eZVlFIW0RhXX4scE1HcnpY9kEufndgwEpwY0DzfppK%2BXTBg1TRQ6bPUNklKPzazPLe0Mj1wGpc%2B3bgZSPq%2BMGZ09FnocL%2BlU3lt9kYMuEAG5wNiMfgATm8kOh-ECdwB1XOHyIRC%2BIAA5phwSg8PgEFAYXRETCCDjgUMsUCjpVQaiCCcaYzOn8LvhfiygqE%2BbcMdsyAz-skyP1aQFAqK%2BUY5cKfqc%2Bbylccut8hn1BXF1ZVsfLJXzZWLuQq3vjCcTSeSQJT%2BEQ%2BSkls7XRCoVT8G8HckEZ64fLUt4rUSCLaUBSAwQAMzOq76-SwvJ85Nmj4pY0epGskMEsMksmR%2B3Rgz%2BnP4OOJ5Iq6velN19LpkVgrUBMit94t8tezu%2BoI9-g40M2otRitO8Ij8NjksV-rTwt2-vwgC6dGkuHQpLgmBwCH0KhACAAnvR%2BCtT%2Bf7HQoCh8VvlJQaM-n0QaO-30YaN-v6%2BXx%2BgFfj%2BIH-m%2BQEgb%2BNAxtBsEpDQ8HwWQNDIchMHoQhmFIShOEYTBiGYahOFpDQJEkYENAURRwQ0DRNFkaRlFMdRtGsQx5HMaxdGrt4V78DGlDPiA6BsBAADuBBgFC6DFmIaAwBAfC2BgyhKCk74xhpz5GLC65KGkFFkDRZAUWk5HIbklGBHpCofixFFECRqSruuwmnhwXA%2BBAolQJIADE0iBUFghiJg0gANY4Ho%2BiUCQMEgAARowbAJQASnAWiMDFJD5KYPGmEAA
            initialDigits: { 3: {6: 8}, 6: {7: 3}},
            constraints: [ThermometerConstraint(["R8C5", "R7C5", "R7C4", "R9C4", "R9C6"]),
                ThermometerConstraint(["R5C6", "R4C5", "R4C3"]),
                ThermometerConstraint(["R3C8", "R2C9", "R1C9", "R1C8", "R2C8", "R3C7"])],
            rules: [translate(thermometersExplained)],
            choices: {
                solveCells: [[3, 2], [3, 3], [6, 3], [6, 4], [6, 5], [7, 3], [7, 5], [8, 3], [8, 4], [8, 5]],
                topMessage: "SecondChoice 2",
                option1ChoiceMessage: "SecondChoice 2 option 1",
                option1TakenMessage: "SecondChoice 2 option 1 Taken",
                option2ChoiceMessage: "SecondChoice 2 option 2",
                option2TakenMessage: "SecondChoice 2 option 2 Taken",
                option1: {
                    initialDigits: {},
                    // https://sudokumaker.app/?puzzle=N4IgZg9gTgtghgFwGoFMoGcCWEB2IBcIAjAHQCsJADCADQgAOArgF7MA2KBoOcMnhtEHEYIAFtAIhBAYxRs26AgG1QANzhtG-AJwBfGqGlwcAE0wnEKRfgBMd-YeNmLCKwSI2AbA5BHT5y2siABYfdU1%2BAA4fP2dAghtKaINfJwDXIJtQlNj0t3xtbxy0l3ysmJL42zIbCv9S6zta4vqqjyLHVoz3bLUNLQI9Frju2yS6kfyPXpBwgfxkzsnMibzrAGZgxdSu-O1mpbWCTe3chvcD2f7%2BMlXzhcow68GniPdX%2BYB2O6qbU8rRutHik5joPvxvsMjrYZmcqh0QABzTCqFB4fAIKBaOiggj-XbWQo-UZEqH3MjjMm-exUwGRS5w0afTz45Z41nQhGMsoc%2B6eYLAw73IHE-LBZmixo0oVVdYUyUEZm8qqRba4-C3Wk8hX4fmCnZs-AilLI1HozHYq5vfBEcF4u34SF9a0zdWXdVDGUkhGmtEEC0oHHPI060le-Ish2eg2ctXBzWgX3mrGBq3zW0g4PrB1OtP8V3B5WjcqZ60JmP3EvO%2BYI9W59XbJP%2BlNB60ZxMov0Ylt5hI%2BJvdy0e3QAXTo0lw6ExcEwOAQ1hUIAQAE96Px9Su1%2B46FAUMjJ8pKDQj0eiDQz2ebDQr1eT8fzw-L9fn3fT4-nzeaOsvz-gjQ-3%2BZA0EBQHfmB-4QYBwHQeB34ARBIHQZ4NDIchnw0Oh6GRDQ2HYahKEYYRWE4SR%2BFoURJG4SOPibvwQJHiA6BsBAADuBBgBo6CpmIaAwBAfCuBgyhKMEZ7rGJR42NoY5KJ46FkNhZDoZ4aFAcyGGfDJNhAUQxHoUQyFZCOY6MSuHBcL4EDMVAkgAMTSA5jmCGImDSAA1jgVjWJQJDfiAABGjBsP5ABKcBmIw3kkKENGrnRlBnqkiL5IusjyAuZBAfyGHrCZboMnICjKF4X5-nKeXBkQpyFQunjaBhZ6fNhnz1ZElAVdaNi5mlRX4Eo34eNel42B16a2iZU7LuZ%2BCgK4AAeCAWRO1l2ZQa3rSA%2BhJfwhhWRIhC2etG26Cd1G6EAA
                    constraints: [KillerCageConstraint(["R7C2", "R8C2", "R9C2"], 22),
                        KillerCageConstraint(["R8C7", "R9C7", "R9C8", "R9C9", "R8C9"], 27),
                        KillerCageConstraint(["R3C9", "R4C9", "R4C8"], 18),
                        KillerCageConstraint(["R1C4", "R2C4", "R3C4", "R3C5"], 11)],
                    rules: [translate(killerCagesExplained),
                            translate(cannotRepeatInCage)],
                    choices: undefined
                },
                option2: {
                    initialDigits: {},
                    // https://sudokumaker.app/?puzzle=N4IgZg9gTgtghgFwGoFMoGcCWEB2IBcIAjAHQCsJADCADQgAOArgF7MA2KBoOcMnhtEHEYIAFtAIhBAYxRs26AgG1Q0uDgAmmDYhSL8RSgCZKAXxqr1WnQj0FDRo%2Bcubtu-WUPOQa1zbsGACzevtbuBAAcAGzBFj5Wbrb6RoFmcaGJAY5pLmFJBI6xuZn6RCYhCf76AOwxFX7h%2BLVR9XlZZEXxDflBrSUEUZQRfVUFqSON2d4AbnBsjPzD6ZWNgxM9ZEPrAZtLxaP4u9ulTsvdAQDMZKf7k%2BNxs-P8AJwzcwv2xwXXXwYpv2VOo8PvhXg93vxqr9-uCnp84gBzTDTFB4fAIKALOjAxa-Z4tM5tE6dDIHTYklYbSgE25UmkgHEEMG0rJAiEFaFEemkyYwlnJTYAsjcykBIhkPZdIn2CVvOH4SU8nr4vEi86lYVykHMqX9AyyxHI1EEDFYhnsgy-QKBRWi-TWyWM-Bs%2BU3c3ynVOsjeJEotGmlDYi0XK021UU9VMuqEvWBH6wkHew1%2Bk2YwPukFELX8EMxg5EZ5up0R6XOsN5xqaisbNWlqugJ30p1QhO45PG9FpoPyrPt-1djP8N2%2BjsB7va0wAXTo0lw6AxcEwOAQ%2BhUIAQAE96Pwcuut-wiHQoCgkXPlJQaBeL4ebzQjHeH1fLzRb4f7%2B-n0-Xw%2BPxcaH%2B-0CGggKAsgaDAsCAP-YCYNA8D4KgwDYPgiCaCiNCMOqGgsKwiIaDwvD0KI7CSNw-DyOI9CcJIgj8MnbxN23AgLkoC8QHQNgIAAdwIMA5nQdMxDQGAID4WwMGUJRAkPC4ZIvIxnmnJQoiwiVwKwqIqLA2psOqJSjDAogyKwrk70CSdp3YzcOC4HwIE4qBJAAYmkVy3MEMRMGkABrHA9H0SgSD-EAACNGDYEKACU4C0RgApIYIGP3AhUiAkA2CXAIlCUa40IvapKCUi4APvWTgMKyysBwBEOEik9sBwAAVCAEH43j%2BPTecNxs-BVHsiRCCcowUGkEKwDADzRC83z-IIQLxVMKdFqAA
                    constraints: [RegionSumLineConstraint(["R6C8", "R7C7", "R8C8"]),
                        RegionSumLineConstraint(["R4C7", "R4C6", "R4C5","R5C5"])],
                    rules: ["There are some blue lines in the grid, each of which passes through multiple regions. The digits on each blue line have the same sum in each region it passes through."],
                    choices: undefined
                }
            }
        }
    }
}

const getAdventureConstraints = (context: PuzzleContext<AdventurePTM>): Constraint<AdventurePTM, any>[] => {
    let constraints: Constraint<AdventurePTM, any>[] = [];
    let digits: CellsMap<number> = {};
    let rules: string[] = [];
    let currentChoice: choiceTaken | undefined = adventure2Def;
    var depth = 0;
    while (currentChoice !== undefined)
    {
        digits = mergeCellsMaps(digits, currentChoice.initialDigits);
        constraints = constraints.concat(currentChoice.constraints);
        rules = rules.concat(currentChoice.rules);
        if (currentChoice.choices !== undefined && (context.gridExtension.choicesMade.length === depth || context.gridExtension.choicesMade.length === depth + 1))
        {
            var solved = checkSolved(context, currentChoice.choices.solveCells)
            if (context.gridExtension.choicesMade.length === depth + 1 && !solved)
            {
                context.gridExtension.choicesMade.pop();
                currentChoice = undefined;
            }
            else if (context.gridExtension.choicesMade.length === depth + 1 && solved)
            {
                currentChoice = context.gridExtension.choicesMade[depth] === 1 ? currentChoice.choices.option1 : currentChoice.choices.option2;
            }
            else if (context.gridExtension.choicesMade.length === depth && solved)
            {
                context.stateExtension.messageChoice1 = currentChoice.choices.option1ChoiceMessage;
                context.stateExtension.messageChoice2 = currentChoice.choices.option2ChoiceMessage;
                context.stateExtension.messageChoice1Taken = currentChoice.choices.option1TakenMessage;
                context.stateExtension.messageChoice2Taken = currentChoice.choices.option2TakenMessage;
                context.stateExtension.message = currentChoice.choices.topMessage;
                currentChoice = undefined;
            }
            else
            {
                currentChoice = undefined;
            }
        }
        else if (currentChoice.choices !== undefined)
        {
            currentChoice = context.gridExtension.choicesMade[depth] === 1 ? currentChoice.choices.option1 : currentChoice.choices.option2;
        }
        else
        {
            currentChoice = undefined;
        }
        depth++;
    }
    context.puzzle.initialDigits = digits;
    context.puzzle.rules = () => (
        <>
            <RulesParagraph>
                <summary>
                    Normal sudoku rules apply.
                </summary>
            </RulesParagraph>
            
            <RulesParagraph>
                <RulesUnorderedList>
                    {rules.map(item => <li>{item}</li>)}
                </RulesUnorderedList>
            </RulesParagraph>
        </>
    )
    return constraints;
}

const checkSolved = (context: PuzzleContext<AdventurePTM>, solveCells: [number, number][]): boolean => {
    var solved = true;
    solveCells.forEach((cell: [number, number]) => {
        var userDigit = context.getCell(cell[0], cell[1])?.usersDigit;
        if (userDigit === undefined || userDigit !== context.puzzle.solution![cell[0]][cell[1]])
        {
            solved = false;
            return;
        }
    });
    return solved;
}