import { PuzzleTypeManager } from "../../../types/puzzle/PuzzleTypeManager";
import { DigitPuzzleTypeManager } from "../../default/types/DigitPuzzleTypeManager";
import { globalPaddingCoeff } from "../../../components/app/globals";
import { myClientId } from "../../../hooks/useMultiPlayer";
import { AdventurePTM} from "./AdventurePTM";
import { Modal } from "../../../components/layout/modal/Modal";
import { Button } from "../../../components/layout/button/Button";
import { choicesMadeStateChangeAction, choiceTaken, choiceDefinitions } from "./AdventureGridState";
import { observer } from "mobx-react-lite";
import { useState } from "react";
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
        const [stage, currentChoice, previousChoice] = getStage(context);
        const isNext = stage > context.gridExtension.choicesMade.length;
        const coeff = isNext ? 1 : 0;
        const [showChoices, setShowChoices] = useState(false);
        const [showChoice1Message, setShowChoice1Message] = useState(false);
        const [showChoice2Message, setShowChoice2Message] = useState(false);
        
        const handleOption1 = () => {
            context.onStateChange(
                choicesMadeStateChangeAction(
                    myClientId,
                    context.gridStateHistory.current.actionId,
                    [...context.gridExtension.choicesMade, 1],
                    [...context.gridExtension.choicesMadeSolutionStrings, currentChoice!.option1SolutionMessage],
                    context.gridExtension.introViewed
                ),
            );
            setShowChoices(false);
            setShowChoice1Message(true);
        };

        const handleOption2 = () => {
            context.onStateChange(
                choicesMadeStateChangeAction(
                    myClientId,
                    context.gridStateHistory.current.actionId,
                    [...context.gridExtension.choicesMade, 2],
                    [...context.gridExtension.choicesMadeSolutionStrings, currentChoice!.option2SolutionMessage],
                    context.gridExtension.introViewed
                ),
            );
            setShowChoices(false);
            setShowChoice2Message(true);
        };

        const handleIntroClose = () => {
            context.gridExtension.introViewed = true;
            context.onStateChange(
                choicesMadeStateChangeAction(
                    myClientId,
                    context.gridStateHistory.current.actionId,
                    context.gridExtension.choicesMade,
                    context.gridExtension.choicesMadeSolutionStrings,
                    true
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
                depth++;
            }
            setShowChoices(true);
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

            {showChoices && (
                <Modal cellSize={cellSize} >
                    <div>
                                <>
                                    <div>{currentChoice?.topMessage}</div>
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
                            {currentChoice?.option1ChoiceMessage}
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
                            {currentChoice?.option2ChoiceMessage}
                        </Button>
                    </div>
                </Modal>
            )}

            {showChoice1Message && (
                <Modal cellSize={cellSize} >
                    <div>
                                <>
                                    <div>{previousChoice?.option1TakenMessage}</div>
                                </>
                    </div>

                    <div>
                        <Button
                            type={"button"}
                            cellSize={cellSize}
                            onClick={() => setShowChoice1Message(false)}
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

            {showChoice2Message && (
                <Modal cellSize={cellSize} >
                    <div>
                                <>
                                    <div>{previousChoice?.option2TakenMessage}</div>
                                </>
                    </div>

                    <div>
                        <Button
                            type={"button"}
                            cellSize={cellSize}
                            onClick={() => setShowChoice2Message(false)}
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
    for (let cell of solveCells) {
        var userDigit = context.getCell(cell[0], cell[1])?.usersDigit;
        if (userDigit === undefined || userDigit !== context.puzzle.solution![cell[0]][cell[1]])
        {
            solved = false;
            break;
        }
    }
    return solved;
}

const getStage = <T extends AnyPTM>(context: PuzzleContext<T>): [number, choiceDefinitions | undefined, choiceDefinitions | undefined] => {
    let currentChoice: choiceTaken | undefined = context.puzzle.extension.rootChoiceTaken;
    let previousChoice: choiceTaken | undefined = undefined;
    var depth = 0;
    while (currentChoice !== undefined)
    {
        if (currentChoice.choices !== undefined && context.gridExtension.choicesMade.length === depth)
        {
            var solved = checkSolved(context, currentChoice.choices.solveCells);
            if (context.gridExtension.choicesMade.length === depth && solved)
            {
                return [depth + 1, currentChoice.choices, previousChoice?.choices];
            }
            else
            {
                currentChoice = undefined;
            }
        }
        else if (currentChoice.choices !== undefined)
        {
            previousChoice = currentChoice;
            currentChoice = context.gridExtension.choicesMade[depth] === 1 ? currentChoice.choices.option1 : currentChoice.choices.option2;
        }
        else
        {
            currentChoice = undefined;
        }
        depth++;
    }
    return [depth - 1, undefined, previousChoice?.choices];
}