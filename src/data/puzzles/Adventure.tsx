import { isValidFinishedPuzzleByEmbeddedSolution, PuzzleDefinition } from "../../types/puzzle/PuzzleDefinition";
import { AdventurePTM } from "../../puzzleTypes/adventure/types/AdventurePTM";
import { createCellsMapFromArray } from "../../types/puzzle/CellsMap";
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
import { lightOrangeColor, lightRedColor } from "../../components/app/globals";
import { PalindromeConstraint } from "../../components/puzzle/constraints/palindrome/Palindrome";
import { choiceTaken } from "../../puzzleTypes/adventure/types/AdventureGridState";
import { ReactNode } from "react";


const adventureDef: choiceTaken = {
    initialDigits: {},
    constraints: [],
    rules: [],
    choices: {
        solveCells: [[8, 6]],
        topMessage: "You've arrived at the edge of your neighbor’s land. You mark your starting point and take in the sights before taking your first step.",
        option1ChoiceMessage: "Explore the nearby bogs",
        option1TakenMessage: "You find a species of grass snake you haven't seen before but know to be harmless. You sketch them (exaggerating their size) on your map.",
        option1SolutionMessage: "grass snakes",
        option2ChoiceMessage: "Investigate bare patches of ground between the nearby trees",
        option2TakenMessage: "The bare patch is a game trail. The local wildlife appear to use these paths to navigate to the top of the area's hills.",
        option2SolutionMessage: "game trails",
        option1: {
            initialDigits: { 0: {6: 6}},
            constraints: [WhispersConstraint(["R8C7", "R9C8", "R8C9", "R7C8", "R6C8"]),
                        WhispersConstraint(["R3C8", "R3C9", "R2C9", "R2C8", "R1C9"])],
            rules: [`Grass snakes (${translate(germanWhispersTitle)}): ${translate(germanWhispersExplained())}`],
            choices: {
                solveCells: [[1, 8], [2, 7], [2, 8], [6, 7], [7, 6], [7, 8]],
                topMessage: "You've made a detailed sketch of the snakes and tried unsuccessfully to coax one into a specimen jar before deciding to move on.",
                option1ChoiceMessage: "You hear a whistling sound from over the hill",
                option1TakenMessage: "The whistling sound is a dust devil, a small whirlwind of dust and debris. It appears large and dies down quickly as it moves away from you.",
                option1SolutionMessage: "dust devils",
                option2ChoiceMessage: "You catch a glint of something golden",
                option2TakenMessage: "You discover a wild crop of wheat ready for harvest.",
                option2SolutionMessage: "wild wheat",
                option1: {
                    initialDigits: {4: {8: 1}},
                    constraints: [ArrowConstraint("R5C4", ["R4C5", "R5C6", "R5C5"]),
                        ArrowConstraint("R8C2", ["R7C1", "R6C2", "R6C3", "R7C4"]),
                        ArrowConstraint("R7C7", ["R8C6", "R7C5"])],
                    rules: [`Dust devils (arrows): ${translate(arrowsExplained)}, ${translate(canRepeatOnArrows)}`],
                    choices: {
                        solveCells: [[4, 3], [4, 5], [6, 3], [6, 4], [6, 6], [7, 1], [7, 5]],
                        topMessage: "You study the dust devils for a while, even managing to jump into the path of one before it dissipates. After wiping the dust from your face, you orient towards the distant edge of your map.",
                        option1ChoiceMessage: "You catch a floral scent on the breeze",
                        option1TakenMessage: "You follow the scent and find rows of lavender bushes, their flowers in full bloom.",
                        option1SolutionMessage: "lavender rows",
                        option2ChoiceMessage: "You notice some stones on the ground. They look too geometric to be natural",
                        option2TakenMessage: "Sorting through the stones you find several which have been cut to be square or circular. They may have been used as tokens for trade.",
                        option2SolutionMessage: "stone tokens",
                        option1: {
                            initialDigits: {8: {4: 7}},
                            constraints: [RenbanConstraint(["R2C3", "R3C3", "R4C4"]),
                                RenbanConstraint(["R4C7", "R4C8", "R5C8"]),
                                RenbanConstraint(["R9C1", "R9C2", "R9C3"]),
                                WhispersConstraint(["R1C1", "R2C1", "R3C1", "R3C2", "R2C2", "R1C2"]),
                                ArrowConstraint("R3C7", ["R3C6", "R3C5"])],
                            rules: [`Lavender rows (${translate(renbanTitle)}): ${translate(renbanExplained())}`],
                            choices: undefined
                        },
                        option2: {
                            initialDigits: {1: {1: 7}, 4: {0: 5}},
                            constraints: [EvenConstraint("R1C5"),
                                EvenConstraint("R2C6"),
                                EvenConstraint("R4C1"),
                                OddConstraint("R4C9"),
                                ArrowConstraint("R1C1", ["R2C1", "R3C2", "R4C2"]),
                                WhispersConstraint(["R4C2", "R4C3", "R3C4", "R2C5"])],
                            rules: [`Stone tokens (Even/Odd): ${translate(evenExplained)}, ${translate(oddExplained)}`],
                            choices: undefined
                        }
                    }
                },
                option2: {
                    initialDigits: { 3: { 2: 9 }, 7: { 3: 5 }, 8: { 2: 3 } },
                    constraints: [WhispersConstraint(["R4C2", "R5C3", "R6C2"], true, 4, lightOrangeColor),
                        WhispersConstraint(["R7C6", "R7C7"], true, 4, lightOrangeColor),
                        WhispersConstraint(["R8C3", "R9C4", "R8C5"], true, 4, lightOrangeColor),
                        WhispersConstraint(["R9C1", "R8C2", "R8C3", "R7C3", "R6C3"])],
                    rules: [`Wild wheat (dutch whispers): Consecutive digits along the orange line must have difference of 4 or more`],
                    choices: {
                        solveCells: [[4, 2], [5, 2], [6, 2], [7, 2], [7, 1], [8, 0], [6, 5], [6, 6]],
                        topMessage: "You decide to collect some of the wheat. Maybe the town baker will teach you how to make bread. Looking through the gap in the wheat row, something catches your eye.",
                        option1ChoiceMessage: "You see some flat stones that look intentionally arranged",
                        option1TakenMessage: "The flat stones appear to be the ruins of an old road with grass growing through the gaps.",
                        option1SolutionMessage: "road ruins",
                        option2ChoiceMessage: "The sun glints off some black and white stones in the dirt",
                        option2TakenMessage: "The stones are quartz. They are rounded and polished; maybe they were used in a game.",
                        option2SolutionMessage: "quartz stones",
                        option1: {
                            initialDigits: {},
                            constraints: [PalindromeConstraint(["R1C5", "R2C5", "R3C6", "R2C6", "R2C7", "R3C7", "R4C7"]),
                                PalindromeConstraint(["R4C4", "R4C5", "R5C6", "R6C7", "R5C7", "R5C8"]),
                                PalindromeConstraint(["R6C6", "R7C7"])],
                            rules: [`Road ruins (Palindrome): Digits on a grey line must be the same read backwards and forwards.`],
                            choices: undefined
                        },
                        option2: {
                            initialDigits: {},
                            constraints: [KropkiDotConstraint("R1C5", "R2C5", false),
                                KropkiDotConstraint("R4C1", "R4C2", true),
                                KropkiDotConstraint("R4C6", "R5C6", true),
                                KropkiDotConstraint("R5C5", "R5C6", true),
                                WhispersConstraint(["R3C3", "R2C4", "R2C5", "R3C6"])],
                            rules: [`Quartz (Kropki dots): ${translate(whiteKropkiDotsExplained)}, ${translate(blackKropkiDotsExplained)}`],
                            choices: undefined
                        }
                    }
                }
            }
        },
        option2: {
            initialDigits: { 3: {6: 8}, 6: {7: 3}},
            constraints: [ThermometerConstraint(["R8C5", "R7C5", "R7C4", "R9C4", "R9C6"]),
                ThermometerConstraint(["R5C6", "R4C5", "R4C3"]),
                ThermometerConstraint(["R3C8", "R2C9", "R1C9", "R1C8", "R2C8", "R3C7"])],
            rules: [`Game trails (Thermometers): ${translate(thermometersExplained)}`],
            choices: {
                solveCells: [[3, 2], [3, 3], [6, 3], [6, 4], [6, 5], [7, 3], [7, 5], [8, 3], [8, 4], [8, 5]],
                topMessage: "You followed the game trail and arrived at the top of one of the area's hills. From this vantage point you see some large landscape features in the distance.",
                option1ChoiceMessage: "You spot wooden planks in a field",
                option1TakenMessage: "You reach the planks and find that they were part of a fence around a pasture.",
                option1SolutionMessage: "pasture fences",
                option2ChoiceMessage: "You see the refraction of sunlight off moving water",
                option2TakenMessage: "The water is a small stream that runs through the fields.",
                option2SolutionMessage: "streams",
                option1: {
                    initialDigits: {},
                    constraints: [KillerCageConstraint(["R7C2", "R8C2", "R9C2"], 22),
                        KillerCageConstraint(["R8C7", "R9C7", "R9C8", "R9C9", "R8C9"], 27),
                        KillerCageConstraint(["R3C9", "R4C9", "R4C8"], 18),
                        KillerCageConstraint(["R1C4", "R2C4", "R3C4", "R3C5"], 11)],
                    rules: [`Fences (Killer Cages): ${translate(killerCagesExplained)}, ${translate(cannotRepeatInCage)}`],
                    choices: {
                        solveCells: [[2, 4], [2, 8], [6, 1], [7, 1], [8, 1], [7, 6], [7, 8]],
                        topMessage: "You have fully mapped out the pastures on your map and calculated the area of each. Maybe someone in town will know what kind of animals were kept here.",
                        option1ChoiceMessage: "Adjacent to the pastures you see what appears to be the remnant of some stone structures",
                        option1TakenMessage: "The stone structures seem like they may have once made up a town. Some are elevated while others are sunken in and may have been cellars.",
                        option1SolutionMessage: "town remnants",
                        option2ChoiceMessage: "You see a small dirt mount nearby",
                        option2TakenMessage: "It's an ant hill, and there are several red ants climbing onto your shoes. You back away and shake them off hoping they aren't fire ants.",
                        option2SolutionMessage: "red ant hills",
                        option1: {
                            initialDigits: { 0: { 6: 6}, 5: { 1: 3 }},
                            constraints: [KillerCageConstraint(["R2C1", "R3C1", "R3C2"], 13),
                                MaxConstraint("R2C2"),
                                MaxConstraint("R6C1"),
                                MaxConstraint("R6C8"),
                                MinConstraint("R4C1"),
                                MinConstraint("R5C9"),
                                MinConstraint("R6C3"),
                                MinConstraint("R8C3")],
                            rules: [`Town remnants (Min/Max): In a grey cell with four arrows facing outwards, the digit in the cell must be greater than the digits in the four orthogonally neighboring cells. In a grey cell with four arrows facing inwards, the digit in the cell must be less than the digits in the four orthogonally neighboring cells.`],
                            choices: undefined
                        },
                        option2: {
                            initialDigits: { 0: { 6: 6, 8: 3} },
                            constraints: [LineConstraint(["R1C2", "R1C1", "R2C1", "R2C2", "R2C3"], lightRedColor),
                                LineConstraint(["R4C1", "R4C2", "R5C2", "R5C3"], lightRedColor),
                                LineConstraint(["R4C4", "R5C4", "R5C5"], lightRedColor),
                                LineConstraint(["R6C2", "R6C3", "R6C4"], lightRedColor)],
                            rules: [`Red ants (Nabner lines): On red lines there may be no consecutive or repeated digits.`],
                            choices: undefined
                        }
                    }
                },
                option2: {
                    initialDigits: {},
                    constraints: [RegionSumLineConstraint(["R6C8", "R7C7", "R8C8"]),
                        RegionSumLineConstraint(["R4C7", "R4C6", "R4C5","R5C5"])],
                    rules: ["Streams (Region sum lines): There are some blue lines in the grid, each of which passes through multiple regions. The digits on each blue line have the same sum in each region it passes through."],
                    choices: {
                        solveCells: [[3,5], [5,7], [6,6], [7, 7]],
                        topMessage: "You find the thinnest part of the stream and are able to jump across. You are excited to finish your adventure without wet socks and shoes.",
                        option1ChoiceMessage: "You see a large square stone near some rubble",
                        option1TakenMessage: "You think you have found the cornerstone of one of the old town’s buildings. Most of the text is worn away, but you are able to make out some of the numbers from the date.",
                        option1SolutionMessage: "cornerstones",
                        option2ChoiceMessage: "What you first take as a massive clump of grass turns out to be a rotting wagon",
                        option2TakenMessage: "As you investigate the wagon you find the wheels have rotted away and all that is left are the spokes. Some wheels have four spokes left and others only have two.",
                        option2SolutionMessage: "wagon spokes",
                        option1: {
                            initialDigits: {},
                            constraints: [ThermometerConstraint(["R9C1", "R9C2", "R8C1"]),
                                ThermometerConstraint(["R2C4", "R1C3", "R2C3", "R3C3", "R2C2", "R3C1"]),
                                QuadConstraint("R5C2", [2, 4, 5]),
                                QuadConstraint("R3C6", [4, 5, 6]),
                                QuadConstraint("R6C8", [2, 3, 7])],
                            rules: [`Cornerstones (Quadruples): Digits in a circle must appear in at least one of the four surrounding cells.`],
                            choices: undefined
                        },
                        option2: {
                            initialDigits: { 1: {1: 7}},
                            constraints: [VMarkConstraint("R1C2", "R1C3"),
                                XMarkConstraint("R3C1", "R4C1"),
                                XMarkConstraint("R8C1", "R9C1"),
                                XMarkConstraint("R6C1", "R6C2"),
                                XMarkConstraint("R1C7", "R2C7"),
                                XMarkConstraint("R2C6", "R2C7"),
                                XMarkConstraint("R3C6", "R2C6")],
                            rules: [`Rotten wagon wheels (X/V): ${translate(xExplained)}, ${translate(vExplained)}. ${translate(notAllXVGiven)}`],
                            choices: undefined
                        }
                    }
                }
            }
        }
    }
}

const getAdventureRules = (context: PuzzleContext<AdventurePTM>) : ReactNode => {
    let rules: string[] = [];
    let currentChoice: choiceTaken | undefined = context.puzzle.extension.rootChoiceTaken;
    var depth = 0;
    while (currentChoice !== undefined)
    {
        rules = rules.concat(currentChoice.rules);
        if (currentChoice.choices !== undefined && (context.gridExtension.choicesMade.length === depth || context.gridExtension.choicesMade.length === depth + 1))
        {
            var solved = checkSolved(context, currentChoice.choices.solveCells)
            if (context.gridExtension.choicesMade.length === depth + 1 && solved)
            {
                currentChoice = context.gridExtension.choicesMade[depth] === 1 ? currentChoice.choices.option1 : currentChoice.choices.option2;
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
    return (
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
    );
}

export const ChooseYourOwnAdventure: PuzzleDefinition<AdventurePTM<number>> = {
    noIndex: true,
    title: { [LanguageCode.en]: "Adventure is out there!" },
    author: { [LanguageCode.en]: "Tumbo" },
    extension: {
        rootChoiceTaken: adventureDef
    },
    slug: "choose-your-own-adventure",
    initialDigits: { 6: { 0: 1 }, 7: { 4: 1}, 8: { 7: 2, 8: 9}},
    rules: getAdventureRules,
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
    resultChecker: (context) => {
        return isValidFinishedPuzzleByEmbeddedSolution(context);
    },
    successMessage: (context) => `You are exhausted having fully filled in your map. The sun is getting low and you'll need to hurry to make it home before curfew. You can't wait to tell your parents about the ${context.gridExtension.choicesMadeSolutionStrings[0]}, ${context.gridExtension.choicesMadeSolutionStrings[1]}, and ${context.gridExtension.choicesMadeSolutionStrings[2]}!`,
    items: (context) => {
        return [
            ...getAdventureConstraints(context),
        ];
    },
    /* lmdLink: "TODO",
    getLmdSolutionCode: ({ puzzle: { solution } }) =>
        indexes(9)
            .map((index) => solution![0][index])
            .join(""),*/
}

const getAdventureConstraints = (context: PuzzleContext<AdventurePTM>): Constraint<AdventurePTM, any>[] => {
    let constraints: Constraint<AdventurePTM, any>[] = [];
    let currentChoice: choiceTaken | undefined = context.puzzle.extension.rootChoiceTaken;
    var depth = 0;
    while (currentChoice !== undefined)
    {
        constraints = constraints.concat(currentChoice.constraints);
        if (currentChoice.choices !== undefined && (context.gridExtension.choicesMade.length === depth || context.gridExtension.choicesMade.length === depth + 1))
        {
            var solved = checkSolved(context, currentChoice.choices.solveCells)
            if (context.gridExtension.choicesMade.length === depth + 1 && !solved)
            {
                context.gridExtension.choicesMade.pop();
                context.gridExtension.choicesMadeSolutionStrings.pop();
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
                context.stateExtension.option1SolutionMessage = currentChoice.choices.option1SolutionMessage;
                context.stateExtension.option2SolutionMessage = currentChoice.choices.option2SolutionMessage;
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