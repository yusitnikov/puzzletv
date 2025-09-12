import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";
import { AdventurePTM } from "./AdventurePTM";

export const getChoicesTaken = ({
    gridExtension: { choicesMade },
    puzzle: {
        extension: { rootChoiceTaken },
    },
}: PuzzleContext<AdventurePTM>) => {
    let currentChoice = rootChoiceTaken;
    const result = [currentChoice];
    for (const choiceIndex of choicesMade) {
        currentChoice = currentChoice.choices!.options[choiceIndex].consequences;
        result.push(currentChoice);
    }
    return result;
};
