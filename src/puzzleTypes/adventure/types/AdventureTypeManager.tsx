import { PuzzleTypeManager } from "../../../types/puzzle/PuzzleTypeManager";
import { DigitPuzzleTypeManager } from "../../default/types/DigitPuzzleTypeManager";
import { globalPaddingCoeff } from "../../../components/app/globals";
import { myClientId } from "../../../hooks/useMultiPlayer";
import { AdventurePTM} from "./AdventurePTM";
import { Modal } from "../../../components/layout/modal/Modal";
import { Button } from "../../../components/layout/button/Button";
import { choicesMadeStateChangeAction, choiceTaken } from "./AdventureGridState";
import { observer } from "mobx-react-lite";
import { comparer, IReactionDisposer, reaction } from "mobx";
import { CellsMap, mergeCellsMaps } from "../../../types/puzzle/CellsMap";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { addGridStateExToPuzzleTypeManager } from "../../../types/puzzle/PuzzleTypeManagerPlugin";

export const AdventureTypeManager = <T extends AdventurePTM>(
    baseTypeManager: PuzzleTypeManager<any> = DigitPuzzleTypeManager(),
): PuzzleTypeManager<T> => ({        
    ...addGridStateExToPuzzleTypeManager(baseTypeManager, {
        initialGridStateExtension: {
            choicesMade: [],
            choicesMadeSolutionStrings: [],
            introViewed: false
        },
    }),
    
    getReactions(context): IReactionDisposer[] {
        return [
            reaction(
                () => {
                    let digits: CellsMap<number> = {};
                    let currentChoice: choiceTaken | undefined = context.puzzle.extension.rootChoiceTaken;
                    var depth = 0;
                    while (currentChoice !== undefined)
                    {
                        digits = mergeCellsMaps(digits, currentChoice.initialDigits);
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
                    return digits;
                },
                (newInitialDigits, prevInitialDigits) => {
                    context.onStateChange({
                        initialDigits: newInitialDigits,
                    });
                }
            )
        ]
    },
    aboveRulesComponent: observer(function AdventureAboveRules({ context }) {

        const {
            cellSizeForSidePanel: cellSize,
        } = context;
        
        const handleOption1 = () => {
            context.gridExtension.choicesMade = [...context.gridExtension.choicesMade, 1];
            context.gridExtension.choicesMadeSolutionStrings = [...context.gridExtension.choicesMadeSolutionStrings, context.stateExtension.option1SolutionMessage];
            context.stateExtension.message = undefined;
            context.stateExtension.messageChoice1 = "";
            context.stateExtension.messageChoice2 = "";
            context.stateExtension.messageTaken = context.stateExtension.messageChoice1Taken;
            context.onStateChange(
                choicesMadeStateChangeAction(
                    context,
                    myClientId,
                    context.gridStateHistory.current.actionId
                ),
            );
        };

        const handleOption2 = () => {
            context.gridExtension.choicesMade = [...context.gridExtension.choicesMade, 2];
            context.gridExtension.choicesMadeSolutionStrings = [...context.gridExtension.choicesMadeSolutionStrings, context.stateExtension.option2SolutionMessage];
            context.stateExtension.message = undefined;
            context.stateExtension.messageChoice1 = "";
            context.stateExtension.messageChoice2 = "";
            context.stateExtension.messageTaken = context.stateExtension.messageChoice2Taken;
            context.onStateChange(
                choicesMadeStateChangeAction(
                    context,
                    myClientId,
                    context.gridStateHistory.current.actionId
                ),
            );
        };

        const handleChoiceTakenClose = () => {
            context.stateExtension.messageTaken = undefined;
            context.stateExtension.messageChoice1Taken = "";
            context.stateExtension.messageChoice2Taken = "";
        };

        const handleIntroClose = () => {
            context.gridExtension.introViewed = true;
            context.onStateChange(
                choicesMadeStateChangeAction(
                    context,
                    myClientId,
                    context.gridStateHistory.current.actionId
                ),
            );
        };

        const BaseComponent = baseTypeManager.aboveRulesComponent;
    
        return (
            <>
            
            {BaseComponent && <BaseComponent context={context} />}

            {context.stateExtension.message !== undefined && (
                <Modal cellSize={cellSize} >
                    <div>
                                <>
                                    <div>{context.stateExtension.message}</div>
                                </>
                    </div>

                    <div>
                        <Button
                            type={"button"}
                            cellSize={cellSize}
                            onClick={handleOption1}
                            autoFocus={true}
                            style={{
                                marginTop: cellSize * globalPaddingCoeff,
                                padding: "0.5em 1em",
                            }}
                        >
                            {context.stateExtension.messageChoice1}
                        </Button>
                    </div>

                    <div>
                        <Button
                            type={"button"}
                            cellSize={cellSize}
                            onClick={handleOption2}
                            autoFocus={true}
                            style={{
                                marginTop: cellSize * globalPaddingCoeff,
                                padding: "0.5em 1em",
                            }}
                        >
                            {context.stateExtension.messageChoice2}
                        </Button>
                    </div>
                </Modal>
            )}

            {context.stateExtension.messageTaken !== undefined && (
                <Modal cellSize={cellSize} >
                    <div>
                                <>
                                    <div>{context.stateExtension.messageTaken}</div>
                                </>
                    </div>

                    <div>
                        <Button
                            type={"button"}
                            cellSize={cellSize}
                            onClick={handleChoiceTakenClose}
                            autoFocus={true}
                            style={{
                                marginTop: cellSize * globalPaddingCoeff,
                                padding: "0.5em 1em",
                            }}
                        >
                            Continue
                        </Button>
                    </div>
                </Modal>
            )}

            {context.gridExtension.introViewed === false && (
                <Modal cellSize={cellSize} >
                    <div>
                                <>
                                    <div>While plenty of 12-year-olds love adventure, most don't have bedrooms like yours: filled with fossil replicas, antique maps, and hiking gear.
                                            With heroes like Jane Goodall, John Muir, and Jacques Cousteau, you have wanted to go on an adventure of your own for years.
                                            Your parents, ever-cautious, have decided you are old enough and have gotten permission from some neighbors to explore their land.
                                            With your compass, specimen jars, and your map (this puzzle) ready to be filled in, you set off!</div>
                                </>
                    </div>

                    <div>
                        <Button
                            type={"button"}
                            cellSize={cellSize}
                            onClick={handleIntroClose}
                            autoFocus={true}
                            style={{
                                marginTop: cellSize * globalPaddingCoeff,
                                padding: "0.5em 1em",
                            }}
                        >
                            Your adventure begins!
                        </Button>
                    </div>
                </Modal>
            )}
            </>
        );
    })
});


const checkSolved = <T extends AnyPTM>(context: PuzzleContext<T>, solveCells: [number, number][]): boolean => {
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