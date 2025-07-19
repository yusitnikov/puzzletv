import { PuzzleTypeManager } from "../../../types/puzzle/PuzzleTypeManager";
import { DigitPuzzleTypeManager } from "../../default/types/DigitPuzzleTypeManager";
import { globalPaddingCoeff, textColor } from "../../../components/app/globals";
import { myClientId } from "../../../hooks/useMultiPlayer";
import { AdventurePTM} from "./AdventurePTM";
import {
    addGridStateExToPuzzleTypeManager,
} from "../../../types/puzzle/PuzzleTypeManagerPlugin";
import { Modal } from "../../../components/layout/modal/Modal";
import { Button } from "../../../components/layout/button/Button";
import { AdventureGridState, choicesMadeStateChangeAction } from "./AdventureGridState";

export const AdventureTypeManager = (
    baseTypeManager: PuzzleTypeManager<any> = DigitPuzzleTypeManager(),
): PuzzleTypeManager<AdventurePTM> => {
    return {
        
                ...(addGridStateExToPuzzleTypeManager<AdventurePTM, AdventureGridState>(baseTypeManager, {
                    initialGridStateExtension: {
                        choicesMade: []
                    },
                }) as unknown as PuzzleTypeManager<AdventurePTM>),
    getAboveRules: function AdventureAboveRules(context, isPortrait) {

        const {
                cellSizeForSidePanel: cellSize,
            } = context;
        
            const handleOption1 = () => {
                context.gridExtension.choicesMade = [...context.gridExtension.choicesMade, 1];
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
                context.stateExtension.introViewed = true;
            };
        
            return (
                <>
                
                {baseTypeManager.getAboveRules?.(context, isPortrait)}

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
                                Ok
                            </Button>
                        </div>
                    </Modal>
                )}

                {context.stateExtension.introViewed === undefined && (
                    <Modal cellSize={cellSize} >
                        <div>
                                    <>
                                        <div>While plenty of 12 year olds love adventure most don't have bedrooms like yours, filled with fossil replicates, antique maps, and hiking gear.
                                              With heroes like Jane Goodall, John Muir, and Jacques Cousteau you have wanted to go on an adventure of your own for years.
                                              Your parents, ever-cautious, have decided you are old enough and have gotten permission of some town members to explore their land.
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
        }
    }
};