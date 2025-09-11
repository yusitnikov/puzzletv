import { PuzzleTypeManager } from "../../../types/puzzle/PuzzleTypeManager";
import { DigitPuzzleTypeManager } from "../../default/types/DigitPuzzleTypeManager";
import { globalPaddingCoeff } from "../../../components/app/globals";
import { myClientId } from "../../../hooks/useMultiPlayer";
import { AdventurePTM} from "./AdventurePTM";
import { Modal } from "../../../components/layout/modal/Modal";
import { Button } from "../../../components/layout/button/Button";
import { choicesMadeStateChangeAction, choiceTaken } from "./AdventureGridState";
import { observer } from "mobx-react-lite";
import { CellsMap, mergeCellsMaps } from "../../../types/puzzle/CellsMap";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { addGridStateExToPuzzleTypeManager } from "../../../types/puzzle/PuzzleTypeManagerPlugin";
import {
    aboveRulesTextHeightCoeff,
    rulesHeaderPaddingCoeff,
    rulesMarginCoeff,
    lightOrangeColor,
} from "../../../components/app/globals";

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

    
    getInitialDigits(context) {
        let digits: CellsMap<number> = {};
        let currentChoice: choiceTaken | undefined = context.puzzle.extension.rootChoiceTaken;
        var depth = 0;
        while (currentChoice !== undefined)
        {
            digits = mergeCellsMaps(digits, currentChoice.initialDigits);
            if (currentChoice.choices !== undefined && context.gridExtension.choicesMade.length > depth)
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

    aboveRulesComponent: observer(function AdventureAboveRules({ context }) {

        const {
            cellSizeForSidePanel: cellSize,
        } = context;
        const stage = getStage(context);
        const isNext = stage > context.gridExtension.choicesMade.length;
        const coeff = isNext ? 1 : 0;
        
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

        const handleNextStage = () => {
            let currentChoice: choiceTaken = context.puzzle.extension.rootChoiceTaken;
            var depth = 0;
            while (depth <= context.gridExtension.choicesMade.length)
            {
                if (context.gridExtension.choicesMade.length > depth)
                {
                    currentChoice = context.gridExtension.choicesMade[depth] === 1 ? currentChoice.choices!.option1 : currentChoice.choices!.option2;
                }
                else
                {
                    context.stateExtension.messageChoice1 = currentChoice.choices!.option1ChoiceMessage;
                    context.stateExtension.messageChoice2 = currentChoice.choices!.option2ChoiceMessage;
                    context.stateExtension.messageChoice1Taken = currentChoice.choices!.option1TakenMessage;
                    context.stateExtension.messageChoice2Taken = currentChoice.choices!.option2TakenMessage;
                    context.stateExtension.option1SolutionMessage = currentChoice.choices!.option1SolutionMessage;
                    context.stateExtension.option2SolutionMessage = currentChoice.choices!.option2SolutionMessage;
                    context.stateExtension.message = currentChoice.choices!.topMessage;
                }
                depth++;
            }
        }

        const BaseComponent = baseTypeManager.aboveRulesComponent;
    
        return (
            <>
            
            {BaseComponent && <BaseComponent context={context} />}
            
            <div
                style={{
                    background: lightOrangeColor,
                    marginTop: cellSize * rulesMarginCoeff * coeff,
                    marginBottom: cellSize * rulesMarginCoeff * coeff * 2,
                    padding: `${(cellSize * rulesHeaderPaddingCoeff * coeff) / 2}px ${cellSize * rulesHeaderPaddingCoeff}px`,
                    fontSize: cellSize * aboveRulesTextHeightCoeff,
                    lineHeight: `${cellSize * aboveRulesTextHeightCoeff * 1.5}px`,
                    height: cellSize * aboveRulesTextHeightCoeff * 3 * coeff,
                    border: "2px solid #f00",
                    opacity: coeff,
                    overflow: "hidden",
                    transition: "0.3s all linear",
                    textAlign: "center",
                }}
            >
                {"You've fully explored this area! "}
                &nbsp;
                <Button
                    type={"button"}
                    cellSize={cellSize}
                    style={{
                        fontFamily: "inherit",
                        fontSize: "inherit",
                        lineHeight: `${cellSize * aboveRulesTextHeightCoeff * 1.5 - 2}px`,
                        paddingTop: 0,
                        paddingBottom: 0,
                    }}
                    onClick={handleNextStage}
                >
                    {"Make your next choice"}
                </Button>
            </div>

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

const getStage = <T extends AnyPTM>(context: PuzzleContext<T>): number => {
    let currentChoice: choiceTaken | undefined = context.puzzle.extension.rootChoiceTaken;
    var depth = 0;
    while (currentChoice !== undefined)
    {
        if (currentChoice.choices !== undefined && context.gridExtension.choicesMade.length === depth)
        {
            var solved = checkSolved(context, currentChoice.choices.solveCells);
            if (context.gridExtension.choicesMade.length === depth && solved)
            {
                return depth + 1;
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
    return depth - 1;
}