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
import { translate } from "../../utils/translate";
import {
    blackKropkiDotsExplained,
    whiteKropkiDotsExplained,
} from "../ruleSnippets";
import { RulesParagraph } from "../../components/puzzle/rules/RulesParagraph";
import { RulesUnorderedList } from "../../components/puzzle/rules/RulesUnorderedList";

export const Adventure1: PuzzleDefinitionLoader<AdventurePTM<NumberPTM>> = {
    loadPuzzle: () =>
        FPuzzles.loadPuzzle({
            load: "N4IgzglgXgpiBcBOANCALhNAbO8QGEALGAJxIE8ACAISwHsww6BbEVAQwFc1C6SEQAWXZYSdAOZsQJTjjAw0AgHJ9mIymE4ATOgGtOlGXMrsADqazkAdAB0AdgBEI4zGA0xT7EuzQwtlACMqdkoAd0JMGEodNBMSKIBjOjt5BO4IADcYW0dnV0oIOxMwiN9KBIgSBJxKZk4wWLNTGC8TWJx2BspkhKjCyh4ogDM6ThINMbFOOy1C8XKYLCwwHIAFMYsomLcvKNNMuljTOkK0NxHx9jsqas4YNzRRhIi7ecHKhaXkEohnuKixGgfH5yvQErpQhB5HFRjMBsQPvsModKMdTvCpuJCJQlBpfKY3HQhpREAAGaIwcTxe7fcKkKK4qHwqIZER3bpFQaog5oHIAJUOwP8t3utXYVDoWRIWDMgW4tXqsTsKJgAA9fHDRmcIFoolyqTqrFIDVoEABtM3AAC+yGttptdsdDud9oAushLS6nfafd7re7Pb6vcGgwG/SHw26PZGY8GwxGE6Ho4nY1HA6nY/Gg9nM+6QLMhkN6XZeubQL0lmBzSA+QBmfAARikdfwACYQK6HSAK8tq3zW/gAOzN+vDzu27uLXvwM01gAs+AArM2FwA2DtdntVmfzpfNxd78flqfb2d8wf4WvNi9zjcTrd9gAce9Q58Pm5PT8vzef7c7eYAR04dgtBkTYy0nSs+wHJtXwHdtX3rWCa3rP9UFZLA7lPBtkEXZBECPSDpzPBs22bUirzgsiqKvPMMKw81a2QQdCIfHc+VI4dX1Ix9mwHLiawHXi6LZe5zTnZBH1Yz92KEvj8EQEd8F4xCFI7dDROw3D8OkqD2IPAS+QPFSa1XIdmzM4SNMwsSZ1bZAJNXXTiN3ddXwXQyDzcmsDPUkB6Nss0mLwliPz0s8LxMt9FNfZ8oufRSRJs097KYudnNPHzv1fA9b1fMzKNM/BbyShiZxwxcMr7BcEN3QqjOorLaOssqzQkvCnLCly32Qt9ar5Z9et/PyAtPWt/1QCoqhwCC2LPGC/ICToYHwAQAGJECHRdNqkLUsEKFb1tJY6TqkEY7DQVa8DWk7TtQSEtB4BBSSsVs8JABEsUUeAXrerrMv7b88yW+QrpADatp21A9oOsGbtu0kzuSS6joRqQHqen7Xvez7CG+37F3+6DzOB5a4c2wdttW6HuH2uxDuuhHEdQc6UcZtH7p1TGCdQXH8exonZLU0nQfWimqd22nYdR26kYuuGmfRrnCGe7HeZgZw8dVv77xks810Wsmxch6mQBh+mFY5kBWct2XOcelWsbe9XNf5nXj3CrKrJAEGGfB8WobNqWLZlu7reR22w4xx2eY+jWvu1wndc96LDdF66A9N82/fhu3w/l0PjqVh3E5dhOnaTj3urMkrUF98mTcl7BpfZvObcL5mQGj0u49dxPBbPA80J9o2M8bmnm5D1uw/b6ei/t7m1d78uCYHmthpFnPM6bumc8VlmI474vF+d5etYrq08wSdhxFwS1/NEgRmDAcQkjIGAEjQeBKHwZIqR8WQPgIDJDAAAQnsAAdUWEkZgeo6DMkMDAZEmEMDJFAVIOaNZSJNjzNnOGhYCFDHnvnNm4NCGFiLpfVAmgEi9EYIIe4YAb64AIH/bwaBAGoJSOAuwUCsAwLgQg+IyD0hoKkEwFBwC7DmjwigCSOF7KrmYpJZATEmIKOUSgR8yAlF4Ucso7RwUHLIHsjhFAijkA4QkoObSTEtH4WMXheyhjLHKKUS4mxSizHaQkvZGx2jdHGPsigdRrjgkqKYjY/RejbEOK8SovxnYgA==",
        } as PuzzleImportOptions),
    noIndex: false,
    slug: "adventure1",
};

export const Adventure2: PuzzleDefinition<AdventurePTM<number>> = {
    
    title: { [LanguageCode.en]: "Adventure is out there!" },
    author: { [LanguageCode.en]: "Tumbo" },
    slug: "adventure2",
    initialDigits: { 8: { 4: 1 } },
    typeManager: AdventureTypeManager(),
    gridSize: GridSize9,
    regions: Regions9,
    solution: createCellsMapFromArray([
        [5, 8, 7, 1, 2, 6, 9, 4, 3],
        [1, 3, 9, 4, 5, 7, 8, 6, 2],
        [6, 4, 2, 8, 9, 3, 5, 1, 7],
        [7, 9, 6, 5, 8, 4, 2, 3, 1],
        [8, 1, 3, 6, 7, 2, 4, 9, 5],
        [2, 5, 4, 3, 1, 9, 7, 8, 6],
        [9, 6, 5, 7, 4, 1, 3, 2, 8],
        [4, 7, 1, 2, 3, 8, 6, 5, 9],
        [3, 2, 8, 9, 6, 5, 1, 7, 4],
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
    initialDigits: { 8: { 4: 1 } },
    constraints: [],
    rules: [],
    choices: {
        solveCells: [[7, 7]],
        topMessage: "FirstChoice",
        option1ChoiceMessage: "FirstChoice option 1",
        option1TakenMessage: "FirstChoice option 1 Taken",
        option2ChoiceMessage: "FirstChoice option 2",
        option2TakenMessage: "FirstChoice option 2 Taken",
        option1: {
            initialDigits: {},
            constraints: [KropkiDotConstraint("R1C1", "R1C2", true)],
            rules: [translate(blackKropkiDotsExplained)],
            choices: {
                solveCells: [[6, 6]],
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
            initialDigits: {},
            constraints: [KropkiDotConstraint("R1C1", "R1C2", false)],
            rules: [translate(whiteKropkiDotsExplained)],
            choices: {
                solveCells: [[6, 8]],
                topMessage: "SecondChoice 2",
                option1ChoiceMessage: "SecondChoice 2 option 1",
                option1TakenMessage: "SecondChoice 2 option 1 Taken",
                option2ChoiceMessage: "SecondChoice 2 option 2",
                option2TakenMessage: "SecondChoice 2 option 2 Taken",
                option1: {
                    initialDigits: {},
                    constraints: [KropkiDotConstraint("R2C2", "R2C3", true)],
                    rules: [translate(blackKropkiDotsExplained)],
                    choices: undefined
                },
                option2: {
                    initialDigits: {},
                    constraints: [KropkiDotConstraint("R2C2", "R2C3", false)],
                    rules: [translate(whiteKropkiDotsExplained)],
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
        mergeCellsMaps(digits, currentChoice.initialDigits);
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
                context.gridExtension.message = currentChoice.choices.topMessage;
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