import { isValidFinishedPuzzleByEmbeddedSolution, PuzzleDefinition } from "../../types/puzzle/PuzzleDefinition";
import { AdventurePTM } from "../../puzzleTypes/adventure/types/AdventurePTM";
import { createCellsMapFromArray } from "../../types/puzzle/CellsMap";
import { LanguageCode } from "../../types/translations/LanguageCode";
import { AdventureTypeManager } from "../../puzzleTypes/adventure/types/AdventureTypeManager";
import { GridSize9, Regions9 } from "../../types/puzzle/GridSize";
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
    normalSudokuRulesApply,
} from "../ruleSnippets";
import { RulesParagraph } from "../../components/puzzle/rules/RulesParagraph";
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
import { lightOrangeColor, lightRedColor } from "../../components/app/globals";
import { PalindromeConstraint } from "../../components/puzzle/constraints/palindrome/Palindrome";
import { choiceTaken } from "../../puzzleTypes/adventure/types/AdventureGridState";
import { joinListSemantically } from "../../utils/array";

const adventureDef: choiceTaken = {
    initialDigits: {},
    constraints: [],
    rules: [],
    choices: {
        solveCells: [[8, 6]],
        topMessage:
            "You've arrived at the edge of your neighbor’s land. You mark your starting point and take in the sights before taking your first step.",
        options: [
            {
                choiceMessage: "Explore the nearby bogs",
                takenMessage:
                    "You find a species of grass snake you haven't seen before but know to be harmless. You sketch them (exaggerating their size) on your map.",
                solutionMessage: "grass snakes",
                consequences: {
                    initialDigits: { 0: { 6: 6 } },
                    constraints: [
                        WhispersConstraint(["R8C7", "R9C8", "R8C9", "R7C8", "R6C8"]),
                        WhispersConstraint(["R3C8", "R3C9", "R2C9", "R2C8", "R1C9"]),
                    ],
                    rules: [
                        `Grass snakes (${translate(germanWhispersTitle)}): ${translate(germanWhispersExplained())}`,
                    ],
                    choices: {
                        solveCells: [
                            [1, 8],
                            [2, 7],
                            [2, 8],
                            [6, 7],
                            [7, 6],
                            [7, 8],
                        ],
                        topMessage:
                            "You've made a detailed sketch of the snakes and tried unsuccessfully to coax one into a specimen jar before deciding to move on.",
                        options: [
                            {
                                choiceMessage: "You hear a whistling sound from over the hill",
                                takenMessage:
                                    "The whistling sound is a dust devil, a small whirlwind of dust and debris. It appears large and dies down quickly as it moves away from you.",
                                solutionMessage: "dust devils",
                                consequences: {
                                    initialDigits: { 4: { 8: 1 } },
                                    constraints: [
                                        ArrowConstraint("R5C4", ["R4C5", "R5C6", "R5C5"]),
                                        ArrowConstraint("R8C2", ["R7C1", "R6C2", "R6C3", "R7C4"]),
                                        ArrowConstraint("R7C7", ["R8C6", "R7C5"]),
                                    ],
                                    rules: [
                                        `Dust devils (arrows): ${translate(arrowsExplained)}, ${translate(canRepeatOnArrows)}`,
                                    ],
                                    choices: {
                                        solveCells: [
                                            [4, 3],
                                            [4, 5],
                                            [6, 3],
                                            [6, 4],
                                            [6, 6],
                                            [7, 1],
                                            [7, 5],
                                        ],
                                        topMessage:
                                            "You study the dust devils for a while, even managing to jump into the path of one before it dissipates. After wiping the dust from your face, you orient towards the distant edge of your map.",
                                        options: [
                                            {
                                                choiceMessage: "You catch a floral scent on the breeze",
                                                takenMessage:
                                                    "You follow the scent and find rows of lavender bushes, their flowers in full bloom.",
                                                solutionMessage: "lavender rows",
                                                consequences: {
                                                    initialDigits: { 8: { 4: 7 } },
                                                    constraints: [
                                                        RenbanConstraint(["R2C3", "R3C3", "R4C4"]),
                                                        RenbanConstraint(["R4C7", "R4C8", "R5C8"]),
                                                        RenbanConstraint(["R9C1", "R9C2", "R9C3"]),
                                                        WhispersConstraint([
                                                            "R1C1",
                                                            "R2C1",
                                                            "R3C1",
                                                            "R3C2",
                                                            "R2C2",
                                                            "R1C2",
                                                        ]),
                                                        ArrowConstraint("R3C7", ["R3C6", "R3C5"]),
                                                    ],
                                                    rules: [
                                                        `Lavender rows (${translate(renbanTitle)}): ${translate(renbanExplained())}`,
                                                    ],
                                                },
                                            },
                                            {
                                                choiceMessage:
                                                    "You notice some stones on the ground. They look too geometric to be natural",
                                                takenMessage:
                                                    "Sorting through the stones you find several which have been cut to be square or circular. They may have been used as tokens for trade.",
                                                solutionMessage: "stone tokens",
                                                consequences: {
                                                    initialDigits: { 1: { 1: 7 }, 4: { 0: 5 } },
                                                    constraints: [
                                                        EvenConstraint("R1C5"),
                                                        EvenConstraint("R2C6"),
                                                        EvenConstraint("R4C1"),
                                                        OddConstraint("R4C9"),
                                                        ArrowConstraint("R1C1", ["R2C1", "R3C2", "R4C2"]),
                                                        WhispersConstraint(["R4C2", "R4C3", "R3C4", "R2C5"]),
                                                    ],
                                                    rules: [
                                                        `Stone tokens (Even/Odd): ${translate(evenExplained)}, ${translate(oddExplained)}`,
                                                    ],
                                                },
                                            },
                                        ],
                                    },
                                },
                            },
                            {
                                choiceMessage: "You catch a glint of something golden",
                                takenMessage: "You discover a wild crop of wheat ready for harvest.",
                                solutionMessage: "wild wheat",
                                consequences: {
                                    initialDigits: { 3: { 2: 9 }, 7: { 3: 5 }, 8: { 2: 3 } },
                                    constraints: [
                                        WhispersConstraint(["R4C2", "R5C3", "R6C2"], true, 4, lightOrangeColor),
                                        WhispersConstraint(["R7C6", "R7C7"], true, 4, lightOrangeColor),
                                        WhispersConstraint(["R8C3", "R9C4", "R8C5"], true, 4, lightOrangeColor),
                                        WhispersConstraint(["R9C1", "R8C2", "R8C3", "R7C3", "R6C3"]),
                                    ],
                                    rules: [
                                        `Wild wheat (dutch whispers): Consecutive digits along the orange line must have difference of 4 or more`,
                                    ],
                                    choices: {
                                        solveCells: [
                                            [4, 2],
                                            [5, 2],
                                            [6, 2],
                                            [7, 2],
                                            [7, 1],
                                            [8, 0],
                                            [6, 5],
                                            [6, 6],
                                        ],
                                        topMessage:
                                            "You decide to collect some of the wheat. Maybe the town baker will teach you how to make bread. Looking through the gap in the wheat row, something catches your eye.",
                                        options: [
                                            {
                                                choiceMessage:
                                                    "You see some flat stones that look intentionally arranged",
                                                takenMessage:
                                                    "The flat stones appear to be the ruins of an old road with grass growing through the gaps.",
                                                solutionMessage: "road ruins",
                                                consequences: {
                                                    initialDigits: {},
                                                    constraints: [
                                                        PalindromeConstraint([
                                                            "R1C5",
                                                            "R2C5",
                                                            "R3C6",
                                                            "R2C6",
                                                            "R2C7",
                                                            "R3C7",
                                                            "R4C7",
                                                        ]),
                                                        PalindromeConstraint([
                                                            "R4C4",
                                                            "R4C5",
                                                            "R5C6",
                                                            "R6C7",
                                                            "R5C7",
                                                            "R5C8",
                                                        ]),
                                                        PalindromeConstraint(["R6C6", "R7C7"]),
                                                    ],
                                                    rules: [
                                                        `Road ruins (Palindrome): Digits on a grey line must be the same read backwards and forwards.`,
                                                    ],
                                                },
                                            },
                                            {
                                                choiceMessage:
                                                    "The sun glints off some black and white stones in the dirt",
                                                takenMessage:
                                                    "The stones are quartz. They are rounded and polished; maybe they were used in a game.",
                                                solutionMessage: "quartz stones",
                                                consequences: {
                                                    initialDigits: {},
                                                    constraints: [
                                                        KropkiDotConstraint("R1C5", "R2C5", false),
                                                        KropkiDotConstraint("R4C1", "R4C2", true),
                                                        KropkiDotConstraint("R4C6", "R5C6", true),
                                                        KropkiDotConstraint("R5C5", "R5C6", true),
                                                        WhispersConstraint(["R3C3", "R2C4", "R2C5", "R3C6"]),
                                                    ],
                                                    rules: [
                                                        `Quartz (Kropki dots): ${translate(whiteKropkiDotsExplained)}, ${translate(blackKropkiDotsExplained)}`,
                                                    ],
                                                },
                                            },
                                        ],
                                    },
                                },
                            },
                        ],
                    },
                },
            },
            {
                choiceMessage: "Investigate bare patches of ground between the nearby trees",
                takenMessage:
                    "The bare patch is a game trail. The local wildlife appear to use these paths to navigate to the top of the area's hills.",
                solutionMessage: "game trails",
                consequences: {
                    initialDigits: { 3: { 6: 8 }, 6: { 7: 3 } },
                    constraints: [
                        ThermometerConstraint(["R8C5", "R7C5", "R7C4", "R9C4", "R9C6"]),
                        ThermometerConstraint(["R5C6", "R4C5", "R4C3"]),
                        ThermometerConstraint(["R3C8", "R2C9", "R1C9", "R1C8", "R2C8", "R3C7"]),
                    ],
                    rules: [`Game trails (Thermometers): ${translate(thermometersExplained)}`],
                    choices: {
                        solveCells: [
                            [3, 2],
                            [3, 3],
                            [6, 3],
                            [6, 4],
                            [6, 5],
                            [7, 3],
                            [7, 5],
                            [8, 3],
                            [8, 4],
                            [8, 5],
                        ],
                        topMessage:
                            "You followed the game trail and arrived at the top of one of the area's hills. From this vantage point you see some large landscape features in the distance.",
                        options: [
                            {
                                choiceMessage: "You spot wooden planks in a field",
                                takenMessage:
                                    "You reach the planks and find that they were part of a fence around a pasture.",
                                solutionMessage: "pasture fences",
                                consequences: {
                                    initialDigits: {},
                                    constraints: [
                                        KillerCageConstraint(["R7C2", "R8C2", "R9C2"], 22),
                                        KillerCageConstraint(["R8C7", "R9C7", "R9C8", "R9C9", "R8C9"], 27),
                                        KillerCageConstraint(["R3C9", "R4C9", "R4C8"], 18),
                                        KillerCageConstraint(["R1C4", "R2C4", "R3C4", "R3C5"], 11),
                                    ],
                                    rules: [
                                        `Fences (Killer Cages): ${translate(killerCagesExplained)}, ${translate(cannotRepeatInCage)}`,
                                    ],
                                    choices: {
                                        solveCells: [
                                            [2, 4],
                                            [2, 8],
                                            [6, 1],
                                            [7, 1],
                                            [8, 1],
                                            [7, 6],
                                            [7, 8],
                                        ],
                                        topMessage:
                                            "You have fully mapped out the pastures on your map and calculated the area of each. Maybe someone in town will know what kind of animals were kept here.",
                                        options: [
                                            {
                                                choiceMessage:
                                                    "Adjacent to the pastures you see what appears to be the remnant of some stone structures",
                                                takenMessage:
                                                    "The stone structures seem like they may have once made up a town. Some are elevated while others are sunken in and may have been cellars.",
                                                solutionMessage: "town remnants",
                                                consequences: {
                                                    initialDigits: { 0: { 6: 6 }, 5: { 1: 3 } },
                                                    constraints: [
                                                        KillerCageConstraint(["R2C1", "R3C1", "R3C2"], 13),
                                                        MaxConstraint("R2C2"),
                                                        MaxConstraint("R6C1"),
                                                        MaxConstraint("R6C8"),
                                                        MinConstraint("R4C1"),
                                                        MinConstraint("R5C9"),
                                                        MinConstraint("R6C3"),
                                                        MinConstraint("R8C3"),
                                                    ],
                                                    rules: [
                                                        `Town remnants (Min/Max): In a grey cell with four arrows facing outwards, the digit in the cell must be greater than the digits in the four orthogonally neighboring cells. In a grey cell with four arrows facing inwards, the digit in the cell must be less than the digits in the four orthogonally neighboring cells.`,
                                                    ],
                                                },
                                            },
                                            {
                                                choiceMessage: "You see a small dirt mount nearby",
                                                takenMessage:
                                                    "It's an ant hill, and there are several red ants climbing onto your shoes. You back away and shake them off hoping they aren't fire ants.",
                                                solutionMessage: "red ant hills",
                                                consequences: {
                                                    initialDigits: { 0: { 6: 6, 8: 3 } },
                                                    constraints: [
                                                        LineConstraint(
                                                            ["R1C2", "R1C1", "R2C1", "R2C2", "R2C3"],
                                                            lightRedColor,
                                                        ),
                                                        LineConstraint(["R4C1", "R4C2", "R5C2", "R5C3"], lightRedColor),
                                                        LineConstraint(["R4C4", "R5C4", "R5C5"], lightRedColor),
                                                        LineConstraint(["R6C2", "R6C3", "R6C4"], lightRedColor),
                                                    ],
                                                    rules: [
                                                        `Red ants (Nabner lines): On red lines there may be no consecutive or repeated digits.`,
                                                    ],
                                                },
                                            },
                                        ],
                                    },
                                },
                            },
                            {
                                choiceMessage: "You see the refraction of sunlight off moving water",
                                takenMessage: "The water is a small stream that runs through the fields.",
                                solutionMessage: "streams",
                                consequences: {
                                    initialDigits: {},
                                    constraints: [
                                        RegionSumLineConstraint(["R6C8", "R7C7", "R8C8"]),
                                        RegionSumLineConstraint(["R4C7", "R4C6", "R4C5", "R5C5"]),
                                    ],
                                    rules: [
                                        "Streams (Region sum lines): There are some blue lines in the grid, each of which passes through multiple regions. The digits on each blue line have the same sum in each region it passes through.",
                                    ],
                                    choices: {
                                        solveCells: [
                                            [3, 5],
                                            [5, 7],
                                            [6, 6],
                                            [7, 7],
                                        ],
                                        topMessage:
                                            "You find the thinnest part of the stream and are able to jump across. You are excited to finish your adventure without wet socks and shoes.",
                                        options: [
                                            {
                                                choiceMessage: "You see a large square stone near some rubble",
                                                takenMessage:
                                                    "You think you have found the cornerstone of one of the old town’s buildings. Most of the text is worn away, but you are able to make out some of the numbers from the date.",
                                                solutionMessage: "cornerstones",
                                                consequences: {
                                                    initialDigits: {},
                                                    constraints: [
                                                        ThermometerConstraint(["R9C1", "R9C2", "R8C1"]),
                                                        ThermometerConstraint([
                                                            "R2C4",
                                                            "R1C3",
                                                            "R2C3",
                                                            "R3C3",
                                                            "R2C2",
                                                            "R3C1",
                                                        ]),
                                                        QuadConstraint("R5C2", [2, 4, 5]),
                                                        QuadConstraint("R3C6", [4, 5, 6]),
                                                        QuadConstraint("R6C8", [2, 3, 7]),
                                                    ],
                                                    rules: [
                                                        `Cornerstones (Quadruples): Digits in a circle must appear in at least one of the four surrounding cells.`,
                                                    ],
                                                },
                                            },
                                            {
                                                choiceMessage:
                                                    "What you first take as a massive clump of grass turns out to be a rotting wagon",
                                                takenMessage:
                                                    "As you investigate the wagon you find the wheels have rotted away and all that is left are the spokes. Some wheels have four spokes left and others only have two.",
                                                solutionMessage: "wagon spokes",
                                                consequences: {
                                                    initialDigits: { 1: { 1: 7 } },
                                                    constraints: [
                                                        VMarkConstraint("R1C2", "R1C3"),
                                                        XMarkConstraint("R3C1", "R4C1"),
                                                        XMarkConstraint("R8C1", "R9C1"),
                                                        XMarkConstraint("R6C1", "R6C2"),
                                                        XMarkConstraint("R1C7", "R2C7"),
                                                        XMarkConstraint("R2C6", "R2C7"),
                                                        XMarkConstraint("R3C6", "R2C6"),
                                                    ],
                                                    rules: [
                                                        `Rotten wagon wheels (X/V): ${translate(xExplained)}, ${translate(vExplained)}. ${translate(notAllXVGiven)}`,
                                                    ],
                                                },
                                            },
                                        ],
                                    },
                                },
                            },
                        ],
                    },
                },
            },
        ],
    },
};

export const ChooseYourOwnAdventure: PuzzleDefinition<AdventurePTM> = {
    noIndex: true,
    title: { [LanguageCode.en]: "Adventure is out there!" },
    author: { [LanguageCode.en]: "Tumbo" },
    extension: {
        rootChoiceTaken: adventureDef,
        intro: () => (
            <div>
                While plenty of 12-year-olds love adventure, most don't have bedrooms like yours: filled with fossil
                replicas, antique maps, and hiking gear. With heroes like Jane Goodall, John Muir, and Jacques Cousteau,
                you have wanted to go on an adventure of your own for years. Your parents, ever-cautious, have decided
                you are old enough and have gotten permission from some neighbors to explore their land. With your
                compass, specimen jars, and your map (this puzzle) ready to be filled in, you set off!
            </div>
        ),
    },
    slug: "choose-your-own-adventure",
    initialDigits: { 6: { 0: 1 }, 7: { 4: 1 }, 8: { 7: 2, 8: 9 } },
    rules: () => (
        <RulesParagraph>
            <summary>
                {translate(normalSudokuRulesApply)}. As you annotate your map (fill in digits) you will be presented
                with choices to decide what to explore next (causing new rules to appear). Upon choosing you may see new
                landmarks and notate them on your map (new given digits may appear).
            </summary>
        </RulesParagraph>
    ),
    typeManager: AdventureTypeManager(),
    gridSize: GridSize9,
    regions: Regions9,
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
    resultChecker: isValidFinishedPuzzleByEmbeddedSolution,
    successMessage: (context) =>
        `You are exhausted having fully filled in your map. The sun is getting low and you'll need to hurry to make it home before curfew. You can't wait to tell your parents about the ${joinListSemantically(context.gridExtension.choicesMadeSolutionStrings, translate("and"))}!`,
    /* lmdLink: "TODO",
    getLmdSolutionCode: ({ puzzle: { solution } }) =>
        indexes(9)
            .map((index) => solution![0][index])
            .join(""),*/
};
