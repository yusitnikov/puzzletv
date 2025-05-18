import { FPuzzles } from "./Import";
import { PuzzleImportOptions } from "../../types/puzzle/PuzzleImportOptions";
import { PuzzleDefinition, PuzzleDefinitionLoader } from "../../types/puzzle/PuzzleDefinition";
import { NumberPTM } from "../../types/puzzle/PuzzleTypeMap";
import { AdventurePTM } from "../../puzzleTypes/adventure/types/AdventurePTM";
import { createCellsMapFromArray } from "../../types/puzzle/CellsMap";
import { LanguageCode } from "../../types/translations/LanguageCode";
import { AdventureTypeManager } from "../../puzzleTypes/adventure/types/AdventureTypeManager";
import { GridSize9, Regions9 } from "../../types/puzzle/GridSize";
import { Constraint, toDecorativeConstraint } from "../../types/puzzle/Constraint";
import { PuzzleContext } from "../../types/puzzle/PuzzleContext";

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
            ...getShopItemsByContext(context),
        ].map(toDecorativeConstraint);
    },
}

const getShopItemsByContext = (context: PuzzleContext<AdventurePTM>): Constraint<AdventurePTM, any>[] => {
    var value = context.getCell(8, 8)?.usersDigit;
    if (value !== undefined)
    {
        context.puzzle.initialDigits = { 8: { 4: value } }
    }
    else
    {
        context.puzzle.initialDigits = { 8: { 4: 1 } }
    }
    if (context.stateExtension.choicesMade.length == 0)
    {
        var value2 = context.getCell(7,7)?.usersDigit;
        if (value2 !== undefined)
        {
            context.stateExtension.message = "test"
        }
    }
    if (context.stateExtension.choicesMade.length == 1)
    {
        var value2 = context.getCell(6,6)?.usersDigit;
        if (value2 !== undefined)
        {
            context.stateExtension.message = "test"
        }
    }
    return [];
};
