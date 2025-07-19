import { isValidFinishedPuzzleByEmbeddedSolution, PuzzleDefinition } from "../../types/puzzle/PuzzleDefinition";
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
    cannotRepeatInCage,
    arrowsExplained,
    renbanExplained,
    renbanTitle,
    canRepeatOnArrows,
    xExplained,
    vExplained,
    notAllXVGiven,
    evenExplained,
    oddExplained,
    normalSudokuRulesApply
} from "../ruleSnippets";
import { RulesParagraph } from "../../components/puzzle/rules/RulesParagraph";
import { RulesUnorderedList } from "../../components/puzzle/rules/RulesUnorderedList";
import { ThermometerConstraint } from "../../components/puzzle/constraints/thermometer/Thermometer";
import { KillerCageConstraint } from "../../components/puzzle/constraints/killer-cage/KillerCage";
import { RegionSumLineConstraint } from "../../components/puzzle/constraints/region-sum-line/RegionSumLine";
import { QuadConstraint } from "../../components/puzzle/constraints/quad/Quad";
import { MaxConstraint, MinConstraint } from "../../components/puzzle/constraints/min-max/MinMax";
import { LineConstraint } from "../../components/puzzle/constraints/line/Line";
import { VMarkConstraint, XMarkConstraint } from "../../components/puzzle/constraints/xv/XV";
import { ArrowConstraint } from "../../components/puzzle/constraints/arrow/Arrow";
import { RenbanConstraint } from "../../components/puzzle/constraints/renban/Renban";
import { EvenConstraint } from "../../components/puzzle/constraints/even/Even";
import { OddConstraint } from "../../components/puzzle/constraints/odd/Odd";
import { lightOrangeColor } from "../../components/app/globals";
import { PalindromeConstraint } from "../../components/puzzle/constraints/palindrome/Palindrome";

export const ChooseYourOwnAdventure: PuzzleDefinition<AdventurePTM<number>> = {
    
    title: { [LanguageCode.en]: "Adventure is out there!" },
    author: { [LanguageCode.en]: "Tumbo" },
    slug: "choose-your-own-adventure",
    initialDigits: { 8: { 4: 1 } },
    typeManager: AdventureTypeManager(),
    gridSize: GridSize9,
    regions: Regions9,
    // https://sudokumaker.app/?puzzle=N4IgZg9gTgtghgFwGoFMoGcCWEB2IBcIAjAHQCsJADCADQgAOArgF7MA2KBoOcMnhtEHEYIAFtAIhBAYxRs26AgG1QANzhtG-AJwBfGmo1aCRfYc38ALGZDqLBAEw27x-AA5nR-gHYbAc0xVFDx8BCgtOhd%2BADZPe3wyONcAZiT%2BVIMQAKCQsIjbLwJfTKiCRMzs4II8lEjC-FMS%2Br0m%2BNjW12sO-g8KwKrQ8NqC%2BKdugl7zVzGpmLSCDNmy-37cobr4rqX8FtBKtfzShpWc6vWR12LtmYurE4GajdddrNWzw-qr24X5477TwYfeKTb74drbcoQ37g0Ego4vI5bUE3I6LUFfI6NbYY%2BpozG-OH1GFHSHI34I%2BpI-bvYb48buX5famA2mU%2B4HVmjdk0p46X6k5mPUF4onQ8m-G6C84k7ks3kmWVC1GK6WfX5Ut5y2Hq-m-NFSoGuGEGzmXFWGnrm038LGvAFK%2BqSzUO%2BJ6AC6dGkuHQYTgmBwCEU%2BBUIAQAE96PxKDZw5GTHQoCgAt7lJQaGm00QaFmsw4aHm8xn09mS7n8%2BWi5nS%2BWCzRknWG5YaE2m2QaG22-Wu82e632-3u-WWz2O-3ojRx%2BPvDRp9O3DR5-PJxOZ6u5wuN8up2uN4u3TGI%2BlKGmQOg2BAAO4EMAadDDMRoGAQPgINBBpRKSxZ5LftMObQeko0TTmQ85kNO0RTm23hTt4boeqe4YcFwIBeueUCSAAxNIOG4YIYiYNIADWOAoOgQaUCQ9YgAARowbA0QASnAAAmmCMBRJDWLo%2B66EAA
    solution: createCellsMapFromArray([
        [9, 1, 4, 2, 8, 7, 6, 5, 3],
        [3, 7, 5, 1, 9, 6, 4, 8, 2],
        [8, 2, 6, 3, 5, 4, 9, 1, 7],
        [2, 4, 9, 7, 3, 1, 8, 6, 5],
        [5, 6, 8, 9, 4, 2, 3, 7, 1],
        [7, 3, 1, 8, 6, 5, 2, 9, 4],
        [1, 8, 7, 4, 2, 9, 5, 3, 6],
        [6, 9, 2, 5, 1, 3, 7, 4, 8],
        [4, 5, 3, 6, 7, 8, 1, 2, 9],
    ]),
    resultChecker: (context) => {
        return isValidFinishedPuzzleByEmbeddedSolution(context);
    },
    successMessage: "TestSuccessMessage",
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

const adventureDef: choiceTaken = {
    initialDigits: { 6: { 0: 1 }, 7: { 4: 1}, 8: { 7: 2, 8: 9}},
    constraints: [],
    rules: [],
    choices: {
        solveCells: [[8, 6]],
        topMessage: "You've arrived at the edge of your neighbors land, marking your starting point and taking in the sights before taking your first step.",
        option1ChoiceMessage: "Explore the nearby bogs",
        option1TakenMessage: "You find a species of garter snake you haven't seen before and sketch them (not to scale) on your map.",
        option2ChoiceMessage: "Investigate the bare patches ground between the nearby trees",
        option2TakenMessage: "The bare patch is a game trail, the local wildlife appear to use these paths to navigate to the top of the areas hills.",
        option1: {
            // https://sudokumaker.app/?puzzle=N4IgZg9gTgtghgFwGoFMoGcCWEB2IBcIAjAHQCsJADCADQgAOArgF7MA2KBoOcMnhtEHEYIAFtAIhBAYxRs26AgG1Q0uDgAmmDYhSL8ATjIA2AL41V6rToR6CRgBznLm7bv2PnINa5t3DZE4W3lZuth4mXj7W7vaBXgDmmABuKHj4CFCMKHTJcGzZBGbB0WH%2BACxBLjHhBABM5VGhfvpElETF1WWt7VUhvrH4bUR9pS0Ew6PNg8Od-TX%2Bk00DtfgODcsL%2BgDsxn15Bfx1m90EDgbHJdOr55dd42sXJw%2B3z4OvVyv%2BH-fvG8EHQpDLyA-jbN6rNp1SgQxaUOp3eanIbwxFjGao2E9aFYiaYz5bM51KZffQNGEE5FEBG4lE4ykPKFo65wmkMjFs36Q%2BEUrms5mkokkwn4cm06kCkVQ3lIxn4vnYyVU%2BWyjky9Hczmqm7E2m7YVUrVJVLpTLZXL5IFEcXtJVy6k2h3s7lOhV413air7S38ADM4o9Gv8xl9cyD%2BhDYZZEdDtMjiRSaQIZpyIFBEzjsYBPoI4Odiw96bWtLIlEa%2Bf0pfLbvwVZLZfr1c9lYb2cOGeCxqTGSyqaLiK7pt7FvbhlMAF06NJcOhMnBMDgEPoVCAEABPej8GXrzcTOhQFBJGfKSg0U%2Bnog0S%2BXuo0W%2B389nq-Pm93t%2BPi8vt-3mi%2B3--8oaEAwCyBoUDQL-SCgOgkCwLgqC-2A6DwLg4waDQtDthoLCsIcGg8LwjD0OwkjcPw8iiMw0jyII8cvB3fhynaOg2AXfwlCUYwDGw7jtkvYxLzIOpJyUOpQLqNCiCwjp8PHScQBgBcABFMDAMA0DSWQCFAkBZzXDguG8CA2AkQgAGJjG2MBKEswQxEwaQAGscD0fRKBIIgyFMCdvKAA
            initialDigits: { 0: {6: 6}},
            constraints: [WhispersConstraint(["R8C7", "R9C8", "R8C9", "R7C8", "R6C8"]),
                        WhispersConstraint(["R3C8", "R3C9", "R2C9", "R2C8", "R1C9"])],
            rules: [`Garter Snakes (${translate(germanWhispersTitle)}): ${translate(germanWhispersExplained())}`],
            choices: {
                solveCells: [[1, 8], [2, 7], [2, 8], [6, 7], [7, 6], [7, 8]],
                topMessage: "You've made a detailed sketch of the snakes and tried unsuccessfully to coax one into a specimen jar before deciding to move on.",
                option1ChoiceMessage: "You hear a whistling sound from over the hill",
                option1TakenMessage: "The whistling sound is a dust devil, a small whirlwind of dust and debris. They appear large and die down quickly as they move away from you.",
                option2ChoiceMessage: "You catch a glint of something golden",
                option2TakenMessage: "You discover a wild crop of wheat ready for harvest.",
                option1: {
                    // https://sudokumaker.app/?puzzle=N4IgZg9gTgtghgFwGoFMoGcCWEB2IBcIAjAHQCsJADCADQgAOArgF7MA2KBoOcMnhtEHEYIAFtAIhBAYxRs26AgG1Q0uDgAmmDYhSL8ATgBMAFgC%2BNVeq06EegiaLnLINZu279xgGwWr723t8AGYDAA4-V2sPO30wg18XNxtPB0ojSIBzTAA3FDx8BChGFDocuDYSgkTQcsr%2BMkjkmKDTJujA-SJKIhqogNT8Mko%2B5s6CbqIIpI7BkwNKdoHYggNjJZSV-Hnp-02ggHZ1meXD712QOqr8DJP9uOO9lv1gsMW754J426fxkO9nL9BmEARtPv8LmNBkcfpcKtciJErvwDmC-uF3kCtiZzmjBhi8diwrCoVs2h8-iZiYTDgkaV1Hv17gQyKNZti6RS5pysUF5n1kat6QRybV4fwSezWm9hfgiIzsnkCkUSmVxRNZQSuVturLddq%2BTKDfoqZimeDTbKDmFIVL9AdccaHBdFfkCCrSnD6hqnSEwoDzX9XgHBdskeqbuHvYYo9dGi5Q8FY-w2acupQzaGDHqM5q%2Bq7lcVPaHEQmI0my9HUZXriGI7a0xMjGbSUEiM29R3fZbu0beSa%2B16EVlcm7CkW1dHYQX3ROh-xswBdOjSXDoIpwTA4BD6FQgBAAT3o-DNh%2BPEzoUBQ2TXykoNHv96INGfz6MNHf78fD5fv7fH4A78nz-ADPxoYJwMgkwaGg6CyBoeD4Ig5CYNQuCEIwlCINg1DEIw7waAIgiDhoEiSLCGgKIoojCNIujyMoxiaOI%2BjGKoxdIjPfgTB6Og2C3IIlCUbwDFI0SDmfbxnzIIxlyUIx4KMAiiBI3pKMXZcQBgLcABFMDAMA0HyWQWTodcDw4LhXAgNgJEIABibwDjAEYDkEMRMGkABrHA9H0SgSCIRpOKPbjKAokAACNGDYSL0AAdUwMQAEEoCgCAAHdd1AaLYoAYTkBRlG8ShNLgNLMt3YT73OBCwg0yJcsigr5F3AEyoqrLlGEuDYIIkwSLIA4GpcJqWqK-AlFCDr0q6yaptE4Jn0cGDSo4zTzMs-AcpiyKrKwZgTxICKwEweRJHsgyrrAQR13Srz%2BFADzvN89B-Kod9rNsqALrgP7-pAMwLCETqrOeny-IIALKHgr67JAez-oBuhRBQOANAAZUwQ6oZIYJgrMDizCAA
                    initialDigits: {4: {8: 1}},
                    constraints: [ArrowConstraint("R5C4", ["R4C5", "R5C6", "R5C5"]),
                        ArrowConstraint("R8C2", ["R7C1", "R6C2", "R6C3", "R7C4"]),
                        ArrowConstraint("R7C7", ["R8C6", "R7C5"])],
                    rules: [`${translate(arrowsExplained)}, ${translate(canRepeatOnArrows)}`],
                    choices: {
                        solveCells: [[4, 3], [4, 5], [6, 3], [6, 4], [6, 6], [7, 1], [7, 5]],
                        topMessage: "You study the dust devils for a while, even managing to jump into the path of one before it dissipates. After wiping the dust from your face you orient towards the distant edge of your map.",
                        option1ChoiceMessage: "You catch a floral scent on the breeze",
                        option1TakenMessage: "You follow the scent and find rows of lavendar bushes, their flowers in full bloom.",
                        option2ChoiceMessage: "ThirdChoice 1 option 2",
                        option2TakenMessage: "ThirdChoice 1 option 2 Taken",
                        option1: {
                            // https://sudokumaker.app/?puzzle=N4IgZg9gTgtghgFwGoFMoGcCWEB2IBcIAjAHQCsJADCADQgAOArgF7MA2KBoOcMnhtEHEYIAFtAIhBAYxRs26AgG1Q0uDgAmmDYhSL8ATgBMAFgC%2BNVeq06EegiaLnLINZu279xgGwWr723t8AGYDAA4-V2sPO30wg18XNxtPB0ojSIBzTAA3FDx8BChGFDocuDYSgkTQcsr%2BMkjkmKDTJujA-SJKIhqogNT8Mko%2B5s6CbqIIpI7BkwNKdoHYggNjJZSV-Hnp-02ggHZ1meXD712QOqr8DJP9uOO9lv1gsMW754J426fxkO9nL9BmEARtPv8LmNBkcfpcKtciJErvwDmC-uF3kCtiZzmjBhi8diwrCoVs2h8-iZiYTDgkaV1Hv17gQyKNZti6RS5pysUF5n1kat6QRybV4fwSezWm9hfgiIzsnkCkUSmVxRNZQSuVturLddq%2BTKDfoqZimeDTbKDmFIVL9AdccaHBdFfkCCrSnD6hqnSEwoDzX9XgHBdskeqbuHvYYo9dGi5Q8FY-w2acupQzaGDHqM5q%2Bq7lcVPaHEQmI0my9HUZXriGI7a0xMjGbSUEiM29R3fZbu0beSa%2B16EVlcm7CkW1dHYQX3ROh-xswBdOjSXDoIpwTA4BD6FQgBAAT3o-DNh%2BPEzoUBQ2TXykoNHv96INGfz6MNHf78fD5fv7fH4A78nz-ADPxoYJwMgkwaGg6CyBoeD4Ig5CYNQuCEIwlCINg1DEIw7waAIgiDhoEiSLCGgKIoojCNIujyMoxiaOI%2BjGKoxdIjPfgTB6Og2C3IIlCUbwDFI0SDmfbxnzIIxlyUIx4KMAiiBI3pKLk%2B9RKmF8tKfRdlxAGAtwAEUwMAwDQfJZBZOh1wPDguFcCA2AkQgAGJvAOMARgOQQxEwaQAGscD0fRKBIIhGk4o9uMoCiQAAI0YNgEvQAB1TAxAAQSgKAIAAd13UAkpSgBhOQFGUbxKAMuBcoK3dhPvc4ELCfTIhKhLyvkXcAVq%2BrCuUYS4NggiTBIsgDnalxOu6yr8CUUJ%2BrywaFsW0TgmfRwYJqjiZuSrqKt3UxloaobTA-CCjFkjiDLshz8GKg7HKwZgTxIeKwEweRJDc8z-rAQR1zywL%2BFAfygpC9Awqod8nJcqBfrgZGUZAMwLCEAbHIh4LQoIcLKHg%2BHXJANyUdRuhRBQOANAAZUwN78ZIYIoui89tgzPiBMaog33vYIapoRbkNg4I5IOd8Dggg4TH02zDwe1RnJJv6fO8vzRAC3HoaZyL0Y4swgA
                            initialDigits: {8: {4: 7}},
                            constraints: [RenbanConstraint(["R2C3", "R3C3", "R4C4"]),
                                RenbanConstraint(["R4C7", "R4C8", "R5C8"]),
                                RenbanConstraint(["R9C1", "R9C2", "R9C3"]),
                                WhispersConstraint(["R1C1", "R2C1", "R3C1", "R3C2", "R2C2", "R1C2"]),
                                ArrowConstraint("R3C7", ["R3C6", "R3C5"])],
                            rules: [`Lavendar Rows (${translate(renbanTitle)}): ${translate(renbanExplained())})`],
                            choices: undefined
                        },
                        option2: {
                            initialDigits: {4: {0: 5}},
                            constraints: [EvenConstraint("R1C4"),
                                EvenConstraint("R1C5"),
                                EvenConstraint("R2C6"),
                                EvenConstraint("R6C5"),
                                OddConstraint("R4C1"),
                                OddConstraint("R4C9"),
                                ArrowConstraint("R1C1", ["R2C1", "R3C2", "R4C2"]),
                                WhispersConstraint(["R4C2", "R4C3", "R3C4", "R2C5"])],
                            rules: [`${translate(evenExplained)}, ${translate(oddExplained)}`],
                            choices: undefined
                        }
                    }
                },
                option2: {
                    // https://sudokumaker.app/?puzzle=N4IgZg9gTgtghgFwGoFMoGcCWEB2IBcIAjAHQCsJADCADQgAOArgF7MA2KBoOcMnhtEHEYIAFtAIhBAYxRs26AgG1Q0uDgAmmDYhSL8AdgMAmAL41V6rToR6CRAMyVzoAG5w2jfgBYXINZrauvoAnJRmFv5WQbahlM6RAdbBBA5hfgDmmK4oePgIUF507p78AGx%2BJV4EZJUe1fgOfkkxdoYGFYnRNm2OCZaBPaGdA8mxBCEAHCNRgyn4RJREMy1DBN5Tzd3zBpO%2BXXPjhmWTdaUEEaOt%2Brv9s2O9l-fXEyvbR9N3q-OTIU-fRwcJi2hzau32bnq-CIZwaBhBD30RGBB0RF1OkSyOTyBSKICq-BCCJe%2BG8RAhzzWpO8FIBbW8DgxVypxhOsPKxKpZC%2B73pFIJBBmAvwTMp8zI3n%2BvP0ZBRzPFtOlNWM-KhBHhqJJ3M582RUtB%2BmMouFMM1VKmorpSPCPINNXiOqOt0dYLZZvm3lFWNyBFxKGKaoW7IIxsDGvlR2MtrR%2BCjwfwRMiwtqScDTVT53wQsD2czichmae3pxhX9%2BMDKdAxd9pYDmdNBYa6cb-HD5czqszoY78crIGr%2BVr7abLv0NMtSupE7tU-jDf72R9g7xwqLi5LK8DRIAunRpLh0AU4JgcAh9CoQAgAJ70fh3a%2B3%2Bx0KAoLIH5SUGifz9EGi-3-GDQgGAd%2BX5-uBAFAVBoE-hBUHATQDiIch3g0KhqFkDQmGYUhuFofhGFYUReFIeh%2BHYURZQ0FRVEGDQdF0ZMNBMUxNHUfRHGMcx3FsbRnHcSx25%2BA%2BPhLHQbAnm0ShKGUIT0XJBi-mUv5kMYu5KMYmGsn%2BdHLMx6neHRZA0ZhZSoSY267iAMAngAIpgYBgGguSyDUdCHleHBcP4EBsBIhAAMRlAYYCUMFghiJg0gANY4Ho%2BiUCQRC1MJN6ib%2BIASXF55KGQcllJQ6llJhBimQY6lGohTHeGUll0DZOD2Y5zk4K5pLudeXn4Kovn%2BSAAWOXABXUHQkUxdlCVJSlQmmEAA
                    initialDigits: { 3: { 2: 9 }, 7: { 3: 5 }, 8: { 2: 3 } },
                    constraints: [WhispersConstraint(["R4C2", "R5C3", "R6C2"], true, 4, lightOrangeColor),
                        WhispersConstraint(["R7C6", "R7C7"], true, 4, lightOrangeColor),
                        WhispersConstraint(["R8C3", "R9C4", "R8C5"], true, 4, lightOrangeColor),
                        WhispersConstraint(["R9C1", "R8C2", "R8C3", "R7C3", "R6C3"])],
                    // TODO dutch whispers
                    rules: [`Wild wheat (dutch whispers): TODO`],
                    choices: {
                        solveCells: [[4, 2], [5, 2], [6, 2], [7, 2], [7, 1], [8, 0], [6, 5], [6, 6]],
                        topMessage: "ThirdChoice 2",
                        option1ChoiceMessage: "ThirdChoice 2 option 1",
                        option1TakenMessage: "ThirdChoice 2 option 1 Taken",
                        option2ChoiceMessage: "ThirdChoice 2 option 2",
                        option2TakenMessage: "ThirdChoice 2 option 2 Taken",
                        option1: {
                            // https://sudokumaker.app/?puzzle=N4IgZg9gTgtghgFwGoFMoGcCWEB2IBcIAjAHQCsJADCADQgAOArgF7MA2KBoOcMnhtEHEYIAFtAIhBAYxRs26AgG1QANzhtG-AJwBfGmo1aCRfYc38ALGZDqLBAEw27x-AA5nR-gHYbAc0xVFDx8BCgtOhd%2BADZPe3wyONcAZiT%2BVINbLwJfTKiCRLzs-FMi%2BL0y11jKqzSCDxrHOvdmp0b8avMU5sKu2vaKvpNm3KH8NrHrTICgkLCIrPKR5oyx0rGGsc7F116d-j38jubN-YJBs-wpsYnL1cvRy-WHlebno9Oj7ZnggnmUSLFQ7FW5HC5Ha4gH5zcIAp4nZbtSFHUHFcFA17tbZfZro%2BK3aF-WGA%2BJ7QmhYnw9r3I6PCEIpE9fyBX4UhZHGnFbHFOnFT7FZ7k-4k1wElkw9lo3QAXTo0lw6DCcEwOAQinwKhACAAnvR%2BJQbDq9SY6FAUAEFcpKDRrdaiDR7faHDRnc7bTaHZ6nS6fe67V6fa6aMlg6HLDRw%2BGyDRo9GQ-GI4mozGUwmQ5HE7GU9EaDmc94aAWC24aCWS3nc4Wq8XS7WK-nq7Wy9LDbqrJR7SA2CqUOqlEpotpC0PvPbovayA5ZUoHNGHDmiAWiDm3NPLAWyHno9Fw94p7KQDAVQARTBgMBoYKyAp0RXajhcEDytgSQgAYmi3jAlE-gjEmGkABrHBe3VSgSCIRJW2NK4OzobsQL7JQyCHaJKGnaJo28bdvGnBwS2SEtLGiaUDyPHBT3PS8cGvK5bx1B98FAZ9XxAN9zzgNDqDof8gMQsCIKgzIjXbZ0ux7JDkmtZJ7UsCdZOdSxkmnZIQwccNIIdcMHBDIh02nMhrTQ0j6PvfhmIgF8oEkN84Ds%2By-1EADgNAghwMg3QZU8oA
                            initialDigits: {},
                            constraints: [PalindromeConstraint(["R1C5", "R2C5", "R3C6", "R2C6", "R2C7", "R3C7", "R4C7"]),
                                PalindromeConstraint(["R4C4", "R4C5", "R5C6", "R6C7", "R5C7", "R5C8"]),
                                PalindromeConstraint(["R6C6", "R7C7"])],
                            //TODO
                            rules: [],
                            choices: undefined
                        },
                        option2: {
                            // https://sudokumaker.app/?puzzle=N4IgZg9gTgtghgFwGoFMoGcCWEB2IBcIAjAHQCsJADCADQgAOArgF7MA2KBoOcMnhtEHEYIAFtAIhBAYxRs26AgG1QANzhtG-AJwBfGmo1aCRfYc38ALGZDqLBAEw27x-AA5nR-gHYbAc0xVFDx8BCgtOhd%2BADZPe3wyONcAZiT%2BVINbLwJfTKiCRLzs-FMi%2BL0y11jKqzSCDxrHOvdmp0b8avMU5sKu2vaKvpNm3KH8NrHrTICgkLCIrPKR5oyx0rGGsc7F116d-j38jubN-YJBs-wpsYnL1cvRy-WHlebno9Oj7aPD4tuji5Ha4gGbBAjzFCRYrvYqfYqPIGtZqA4q-eL3L7Nb7FFHxW6gubhSGXPYE8FEqHxGHo5btYEfZr01H%2BQJg0IUu5Y2kbN4s2bkhZHfGswmCnG6AC6dGkuHQYTgmBwCEU%2BBUIAQAE96PxKDZNdqTHQoCgArLlJQaBaLUQaDabQ4aA6HVbLba3fbHZ6Xdb3Z6nTRkgGg5YaCGQ2QaBGI4GY6G4%2BHI4nY4Gw3Go4nojRM5nvDRc7m3DRC4Xs1m8%2BWC0Wq6WcxWq8WJXqtVZKDaQGxFSgVUolNFtHn%2B94bdEbWQHFKlA4Iw5M0Rc0RM24J5Zc2RsxHoiHvOOaJPrQ6iIGHMkJVKQDBFQARTBgMBoYKyAp0OUajhcEAytgSQgAYmi3jASh-0EMRMGkABrHAuxVSgSCIRImwNK5WzoDsoO7JQyH7aJKAnaII28DdvAnBxC2SQtLGiU86AvHBr1ve8cEfK5n01N98FAT9vxAH9bzgHDqDoUCIPQmC4IQzJ9X4BwUI-CxuxuOgUAAEz8GI4TxJTVJ8BE-i0tSCkSM8oL8RBWWUM8ICCKAoEwZSUAAORNMygnou9jSYrsBRQRDpMoC05K0BSnn0-hD0lOgTJc-glEs6zbPspzTIQVkACUzIgFUIUlXRdCAA
                            initialDigits: {},
                            constraints: [KropkiDotConstraint("R1C5", "R2C5", false),
                                KropkiDotConstraint("R4C1", "R4C2", true),
                                KropkiDotConstraint("R4C6", "R5C6", true),
                                KropkiDotConstraint("R5C5", "R5C6", true),
                                WhispersConstraint(["R3C3", "R2C4", "R2C5", "R3C6"])],
                            rules: [`${translate(whiteKropkiDotsExplained)}, ${translate(blackKropkiDotsExplained)}`],
                            choices: undefined
                        }
                    }
                }
            }
        },
        option2: {
            // https://sudokumaker.app/?puzzle=N4IgZg9gTgtghgFwGoFMoGcCWEB2IBcIAjAHQCsJADCADQgAOArgF7MA2KBoOcMnhtEHEYIAFtAIhBAYxRs26AgG1Q0uDgAmmDYhSL8RSgCZKAXxqr1WnQj0FDRo%2Bcubtu-WUPOQa1zbv4AOwAHE4WPlZutvrBsd6%2B1u4ERgAsAGzxkf76gWkpmX5J%2BKlm4QlRAUQmBYnR9salLrWVxmFNFR5eZVlFIW0RhXX4scE1HcnpY9kEufndgwEpwY0DzfppK%2BXTBg1TRQ6bPUNklKPzazPLe0Mj1wGpc%2B3bgZSPq%2BMGZ09FnocL%2BlU3lt9kYMuEAG5wNiMfgATm8kOh-ECdwB1XOHyIRC%2BIAA5phwSg8PgEFAYXRETCCDjgUMsUCjpVQaiCCcaYzOn8LvhfiygqE%2BbcMdsyAz-skyP1aQFAqK%2BUY5cKfqc%2Bbylccut8hn1BXF1ZVsfLJXzZWLuQq3vjCcTSeSQJT%2BEQ%2BSkls7XRCoVT8G8HckEZ64fLUt4rUSCLaUBSAwQAMzOq76-SwvJ85Nmj4pY0epGskMEsMksmR%2B3Rgz%2BnP4OOJ5Iq6velN19LpkVgrUBMit94t8tezu%2BoI9-g40M2otRitO8Ij8NjksV-rTwt2-vwgC6dGkuHQpLgmBwCH0KhACAAnvR%2BCtT%2Bf7HQoCh8VvlJQaM-n0QaO-30YaN-v6%2BXx%2BgFfj%2BIH-m%2BQEgb%2BNAxtBsEpDQ8HwWQNDIchMHoQhmFIShOEYTBiGYahOFpDQJEkYENAURRwQ0DRNFkaRlFMdRtGsQx5HMaxdGrt4V78DGlDPiA6BsBAADuBBgFC6DFmIaAwBAfC2BgyhKCk74xhpz5GLC65KGkFFkDRZAUWk5HIbklGBHpCofixFFECRqSruuwmnhwXA%2BBAolQJIADE0iBUFghiJg0gANY4Ho%2BiUCQMEgAARowbAJQASnAWiMDFJD5KYPGmEAA
            initialDigits: { 3: {6: 8}, 6: {7: 3}},
            constraints: [ThermometerConstraint(["R8C5", "R7C5", "R7C4", "R9C4", "R9C6"]),
                ThermometerConstraint(["R5C6", "R4C5", "R4C3"]),
                ThermometerConstraint(["R3C8", "R2C9", "R1C9", "R1C8", "R2C8", "R3C7"])],
            rules: [`Game trails (Thermometers): ${translate(thermometersExplained)}`],
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
                    rules: [`${translate(killerCagesExplained)}, ${translate(cannotRepeatInCage)}`],
                    choices: {
                        solveCells: [[2, 4], [2, 8], [6, 1], [7, 1], [8, 1], [7, 6], [7, 8]],
                        topMessage: "ThirdChoice 3",
                        option1ChoiceMessage: "ThirdChoice 3 option 1",
                        option1TakenMessage: "ThirdChoice 3 option 1 Taken",
                        option2ChoiceMessage: "ThirdChoice 3 option 2",
                        option2TakenMessage: "ThirdChoice 3 option 2 Taken",
                        option1: {
                            initialDigits: { 0: { 6: 6}, 5: { 1: 3 }},
                            // https://sudokumaker.app/?puzzle=N4IgZg9gTgtghgFwGoFMoGcCWEB2IBcIAjAHQCsJADCADQgAOArgF7MA2KBoOcMnhtEHEYIAFtAIhBAYxRs26AgG1QANzhtG-AJwBfGqGlwcAE0wnEKRfgBMd-YeNmLCKwSI2AbA5BHT5y2siABYfdU1%2BAA4fP2dAghtKaIMQAHNMVRQ8fAQoLTpwrQJvFNiA12ttEsd-FzdbUNKncvqbMhsY5rrrOw6m2vj8D2rfLsGQsI0i-D1%2BuIqEpM6BhaGbRrUpqOX5%2Bo8dlusAZmDkmt3KvvPDghOz0ZW9q5BC-jID7oJIykmIglnNn8hr9pgB2D6DGz3MqffBHH4pV7-EH8cFzG4NCGrEbpTLZXL5F5bL5Y%2BpVUmVEYwwZkJbo2G9Cm3SLPamrUGeaFjVaRLmPaxU7mtPkXYrBBHXWHwpn4YIcny4rIEAkoArEuEyo60mUckUY3kogjvemQvWwzzizUStIZJU5PKqolAoiG-D3JH4NGA6YbJ3TZ4egEPUUzHG2-EOtVAo4y8km7Hu9VBtn1Tmu42gRURwkel2I9Ux-NAr1%2B-i%2Bj1myHl9UZ4MY9aukYeksVhXh5WR0vuNt4js59XPLN9x2B3QAXTo0lw6FycEwOAQ1hUIAQAE96PxrWuN%2B46FAUOlp8pKDQTyeiDQLxebDQbzez6fL0-r7fXw-z8-X3eaEcf3-gjQAEAWQNAgSBv4QYBUHAaBsGQb%2BQFQWBsGeDQqGoaCNCYZhkQ0LhuHoWhWHETheFkYRGEkWR%2BFjj4278PCJ4gOgbAQAA7gQYAaOgjpiGgMAQHwrgYMoSjBBeRwSSeNjaBOSieJhZC4WQmGeBhIEclhoJyW0l6kZhRCoesY4Tsxa4cFwvgQKxUCSAAxNIjlOYIYiYNIADWOBWNYlAkL%2BIAAEaMGwAUAEpwGYjA%2BSQoR0euDGUBeoypPUy6yPIS5kCBFpYUcpkevYpRyAoyheD%2BAFavl6pENCxVLp42hYReoK4aCjXfFVQI2CW6UlfgSi-h4t7XjYnXTEQeaGHVyiNTVl6yVG40xqZM6rhZ%2BCgK4AAeCCWVONn2ZQR3HSA%2BjJfwhjWRIhB2cdJ26A9KT0e4lA3r4039UQJ7BGBo10Kt62XQdN13UdRxHKdcU7kMlD%2Bb1S7BABnggXKt7af95kXVZwMgLdoPg5DtG6EAA
                            constraints: [KillerCageConstraint(["R2C1", "R3C1", "R3C2"], 13),
                                MaxConstraint("R2C2"),
                                MaxConstraint("R6C1"),
                                MaxConstraint("R6C8"),
                                MinConstraint("R4C1"),
                                MinConstraint("R5C9"),
                                MinConstraint("R6C3"),
                                MinConstraint("R8C3")],
                            // TODO min/max
                            rules: [],
                            choices: undefined
                        },
                        // TODO
                        option2: {
                            initialDigits: { 0: { 6: 6, 8: 3} },
                            // https://sudokumaker.app/?puzzle=N4IgZg9gTgtghgFwGoFMoGcCWEB2IBcIAjAHQCsJADCADQgAOArgF7MA2KBoOcMnhtEHEYIAFtAIhBAYxRs26AgG1QANzhtG-AJwBfGqGlwcAE0wnEKRfgBMd-YeNmLCKwSI2AbA5BHT5y2siABYfdU1%2BAA4fP2dAghtKaIMQAHNMVRQ8fAQoLTpwrQJvFNiA12ttEtB0zOzc-JBC-gBmGKdyt1syG3b-Fy67XtKOgaCvPriK91CU5oI9Ef742yTJzvHZtQ0i-GTHZen8D3Wxghbg-d9Rle1hg6mui6uys%2BP7pp3%2BMlOVyMowl8FoCIu4QbsAOy-I42F43I4tAFzIH4RbbUH4KFLR7WGxba6HLrVNIZLIEBooAoouGEyrE163enwrpkNbYjYJezst4tSIfBlHCGeGk4giREUc-BM2kJCVvTzBJEPSWI6FdYJCtW4rnKnmsrUEIVyv5Xeb4H7clawg1SxU21UpWpknJ5SmfDFEcFRL2Gn34fFmj5mtEE0Wo4lO%2BquqkYtqWo5VG3Cv0hgVE00oi01UlRxpmz3I2N%2BrHo3YB6k2vF%2BrOhyVVwu7Ylmkvu3ZXSPk6Ot-gF7N1Tt5lEfDsuwcYvQAXTo0lw6FycEwOAQ1hUIAQAE96PwlWvNz26FAUOlZ8pKDQz2eiDQr1ebDQ73eL%2Bfry-b-f30-L6-3w%2BaC0-wBwQ0EBQFkDQYFgf%2BUHATBoHgfB0H-iBMEQfBng0Oh6EQjQ2HYZEND4fhmEYThpF4QRFHEVhZEUYRE4%2BBuW7nJQZ4gOgbAQAA7gQYAaOgbpiGgMAQHwrgYMoSjBFeLTSWeNjaFOSieNhZD4WQ2GeFhYFCjhEKKTYYFEOR2FEOheITlObEbhwXC%2BBAHFQJIADE0iuW5ghiJg0gANY4FY1iUCQ-4gAARowbAhQASnAZiMAFJChAxe7MVe1ypF0q6yPIK5kGBCo4S0lmBvycgKMoXh-kBLRkEVKJEC8pUrp42g4VeEL4RCLX-LVGI2C2WVlfgSj-h4963jYPW7EQnqWXO642fgoCuAAHggtkzg5zksdt1D6Gl-CGPZEiEE5O0sSAuiXSkjH8IkLF0Gwi4Zauy3uOQdDrgQgU1q9%2BDfR9X3kD4v3-SAn3HEDKS-aQYFg29P0JO9cMQz8imgCDSPgy0kPo-DAP4NjCMo-jwQ4yAv02JjBCk6jNAvXjyMUETlOw%2BDTPA%2BcVPmkDaPk5zrP8xzBNczTQs0yTPOzdZB1rqIXm%2Bf5gNELDG3HSATlgJrLSaZrF26PRuhAA
                            constraints: [LineConstraint(["R1C2", "R1C1", "R2C1", "R2C2", "R2C3"]),
                                LineConstraint(["R4C1", "R4C2", "R5C2", "R5C3"]),
                                LineConstraint(["R4C4", "R5C4", "R5C5"]),
                                LineConstraint(["R6C2", "R6C3", "R6C4"])],
                            // TODO nabner
                            rules: [],
                            choices: undefined
                        }
                    }
                },
                option2: {
                    initialDigits: {},
                    // https://sudokumaker.app/?puzzle=N4IgZg9gTgtghgFwGoFMoGcCWEB2IBcIAjAHQCsJADCADQgAOArgF7MA2KBoOcMnhtEHEYIAFtAIhBAYxRs26AgG1Q0uDgAmmDYhSL8RSgCZKAXxqr1WnQj0FDRo%2Bcubtu-WUPOQa1zbsGACzevtbuBAAcAGzBFj5Wbrb6RoFmcaGJAY5pLmFJBI6xuZn6RCYhCf76AOwxFX7h%2BLVR9XlZZEXxDflBrSUEUZQRfVUFqSON2d4AbnBsjPzD6ZWNgxM9ZEPrAZtLxaP4u9ulTsvdAQDMZKf7k%2BNxs-P8AJwzcwv2xwXXXwYpv2VOo8PvhXg93vxqr9-uCnp84gBzTDTFB4fAIKALOjAxa-Z4tM5tE6dDIHTYklYbSgE25UmkgHEEMG0rJAiEFaFEemkyYwlnJTYAsjcykBIhkPZdIn2CVvOH4SU8nr4vEi86lYVykHMqX9AyyxHI1EEDFYhnsgy-QKBRWi-TWyWM-Bs%2BU3c3ynVOsjeJEotGmlDYi0XK021UU9VMuqEvWBH6wkHew1%2Bk2YwPukFELX8EMxg5EZ5up0R6XOsN5xqaisbNWlqugJ30p1QhO45PG9FpoPyrPt-1djP8N2%2BjsB7va0wAXTo0lw6AxcEwOAQ%2BhUIAQAE96Pwcuut-wiHQoCgkXPlJQaBeL4ebzQjHeH1fLzRb4f7%2B-n0-Xw%2BPxcaH%2B-0CGggKAsgaDAsCAP-YCYNA8D4KgwDYPgiCaCiNCMOqGgsKwiIaDwvD0KI7CSNw-DyOI9CcJIgj8MnbxN23AgLkoC8QHQNgIAAdwIMA5nQdMxDQGAID4WwMGUJRAkPC4ZIvIxnmnJQoiwiVwKwqIqLA2psOqJSjDAogyKwrk70CSdp3YzcOC4HwIE4qBJAAYmkVy3MEMRMGkABrHA9H0SgSD-EAACNGDYEKACU4C0RgApIYIGP3AhUiAkA2CXAIlCUa40IvapKCUi4APvWTgMKyysBwBEOEik9sBwAAVCAEH43j%2BPTecNxs-BVHsiRCCcowUGkEKwDADzRC83z-IIQLxVMKdFqAA
                    constraints: [RegionSumLineConstraint(["R6C8", "R7C7", "R8C8"]),
                        RegionSumLineConstraint(["R4C7", "R4C6", "R4C5","R5C5"])],
                    rules: ["There are some blue lines in the grid, each of which passes through multiple regions. The digits on each blue line have the same sum in each region it passes through."],
                    choices: {
                        solveCells: [[3,5], [5,7], [6,6], [7, 7]],
                        topMessage: "ThirdChoice 4",
                        option1ChoiceMessage: "ThirdChoice 4 option 1",
                        option1TakenMessage: "ThirdChoice 4 option 1 Taken",
                        option2ChoiceMessage: "ThirdChoice 4 option 2",
                        option2TakenMessage: "ThirdChoice 4 option 2 Taken",
                        option1: {
                            initialDigits: {},
                            // https://sudokumaker.app/?puzzle=N4IgZg9gTgtghgFwGoFMoGcCWEB2IBcIAjAHQCsJADCADQgAOArgF7MA2KBoOcMnhtEHEYIAFtAIhBAYxRs26AgG1QANzhtG-AJwBfGmo1aCRfYc38ALGZDqLBAEw27x-AA5nR-gHZP9-ABsfq5kwfwAzGEEkQa2XgS%2BsS78oUnx%2BKZp-npZrkG5VlHuRU4FBB5l%2BKXmeUUxNSlF1pU5DSZFiW1VTUWtcf6d-a71Q-yZoADmmKooePgIUFp0yeVF%2BV2pG2tFFV19K-jNXdWj0R1F46f4gwcjB5cHu1frV5tXJwf76UcgUzNzCyWVwe6SeBxu3xKvSKbz%2BswIgJQy3Sd3SLwO6PSX38H3SsOm8PmiyRwLq50qP0ePUqb1u20qEP8TzhAOJyP8lxZCLZ7xsXKJQM%2BugAunRpLh0As4JgcAhFPgVCAEABPej8Sg2FVqkx0KAoKYS5SUGjG41EGjm80OGjW62mk0Wx1Wm0u%2B1mp0u200cLe32WGj%2B-1kGjB4M%2B8MByNBkMxiM%2BwOR0MxgI0FMp7w0DMZtw0HM5tOpzNF7O50sF9PF0t54Wa1URSjGkDoNgQADuBDAGnQJLEaBgED4CDQ8qUSks5vCE%2BNDm0oqUAQzZBzZAzAXTwe86e8c4cwaIJYzRBTDksc6IXqIVrNZrcc%2B81u8PoC4WFoqbKo4XBA4pbUEkAGJpCA4DBDETBpAAaxwFB0HlSgSB9EAACNGDYJCACU4AAE0wRg4JIaxa21Q5KH9EA2BlGDlCUMhrQCY1vEoOdwnDa1JwDJi3ywHAJg4dD9WwHAABUIAQLsOy7ElJWVT98FAH8JEIf8HBQaQkLAMBQNEcCoJg-CiFCIixkoa1vzkBRlC4j9%2BHkiBfwAhtHMoFiQF0IzomcsULBHWyoGgv98BXOgcKmOVlDYzMa1icU-LQRxgxAELMDChV-RTMgot8-yCHHYLMFCkdrWDU8RToaTZNAbjeJQAAZSiJIUFA3JrXQgA
                            constraints: [ThermometerConstraint(["R9C1", "R9C2", "R8C1"]),
                                ThermometerConstraint(["R2C4", "R1C3", "R2C3", "R3C3", "R2C2", "R3C1"]),
                                QuadConstraint("R5C2", [2, 4, 5]),
                                QuadConstraint("R3C6", [4, 5, 6]),
                                QuadConstraint("R6C8", [2, 3, 7])],
                            // TODO quad
                            rules: [],
                            choices: undefined
                        },
                        option2: {
                            initialDigits: { 1: {1: 7}},
                            // https://sudokumaker.app/?puzzle=N4IgZg9gTgtghgFwGoFMoGcCWEB2IBcIAjAHQCsJADCADQgAOArgF7MA2KBoOcMnhtEHEYIAFtAIhBAYxRs26AgG1Q0uDgAmmDYhSL8ADgCcAJgC%2BNVeq06EegsYAsFq5u279AZgPnLINW629vhEzn4BNh4OAGxhrpF2%2BiaOlC7%2B1u6JBCYmqeEZQUnJaRGZwUS5JQVR%2BNGe0WkA5pgAbih4%2BAhQjCh0LXBsPQQA7FWBNRUN%2BeNZIXHpM8HRlAZjCeUVa2X6pmn9g-yr0%2Bv6y1uFBN558duXBtcLJ3cPpRchvjdvnmQfj7f4yQe%2ByG%2BCMewGIKI5xqJh%2B0NmFXmrwmxT8wP4YLREP4o2O-1RoHRBChfmabQ6XR6fWxDnhwSMU0%2BKKR1VmZEoLMWXmGRyZbMojJARNBdKS82Fv2RsxMREFUuCOU5TwB7NFxLIctZwU8Ly1%2BiIZF5QpphjVoM1XIIDLNBsFwsxfPKhqarXaBEpvWNB2JZs8lTxb0cjiNwvFJt%2B9vB3vwZBd5Pd3U9ws8ZqDRvlO1iZoM9VTcKx0djpNdFMT1OjJMJJpTAYmuwLIKV-zTZo1rYtyrbDf4dpNuKr0aNZLdnTLXshcZHHvLIN%2Bw9LVPHGLMAF06NJcOgunBMDgEPoVCAEABPej8B4ns-EuhQFDNTfKSg0J9Pog0N9vkw0L9fl-P98AZ%2B37AX%2Br6AcBP40J4UEwY4NBwXBZA0EhSHQWh8EYYhyHYeh0EIRhKHYdENDEcRww0OR5EGDQ1HUaRJEUYxVE0Sx9FkUxLG0SuaSXvwOpPiA6BsBAADuBBgAM6CemIaAwBAfB2BgyhKI4b6eGpT4mEYa5KNE5GGsh5HRGRSHDGRww6bC77MeRsrfo4K5roJJ4cFw-gQMJUCSAAxNIfn%2BYIYiYNIADWOB6PolAkNBIAAEaMGwsUAEpwFojCRSQzg8ae-ApHBIBsLuwRKEoPwkU%2BwyUDpnhoV%2B6nwVVTlYDgjQcEld7YDgAAqEAIJJ4mSZ6W7Hq5%2BCqB5EiEN5JgoNIsVgGAgWiMFYURQQUUGmY2VXgClBfv4BwHgOkICSgGiNPwRDfFGIJISAZ0XdkN2Xad52XUWx0vXQD38ASS7Eq9j34H6z0A99b0EI4H3-SEgMYlCTnhY0iCuso3HcWYQA
                            constraints: [VMarkConstraint("R1C2", "R1C3"),
                                XMarkConstraint("R3C1", "R4C1"),
                                XMarkConstraint("R8C1", "R9C1"),
                                XMarkConstraint("R6C1", "R6C2"),
                                XMarkConstraint("R1C7", "R2C7"),
                                XMarkConstraint("R2C6", "R2C7"),
                                XMarkConstraint("R3C6", "R2C6")],
                            rules: [`${translate(xExplained)}, ${translate(vExplained)}. ${translate(notAllXVGiven)}`],
                            choices: undefined
                        }
                    }
                }
            }
        }
    }
}

const getAdventureConstraints = (context: PuzzleContext<AdventurePTM>): Constraint<AdventurePTM, any>[] => {
    let constraints: Constraint<AdventurePTM, any>[] = [];
    let digits: CellsMap<number> = {};
    let rules: string[] = [];
    let currentChoice: choiceTaken | undefined = adventureDef;
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
                    {translate(normalSudokuRulesApply)}. As you annotate your map (fill in digits) you will be presented with choices to decide what to explore next (causing new rules to appear). Upon choosing you may see new landmarks and notate them on your map (new given digits may appear).
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