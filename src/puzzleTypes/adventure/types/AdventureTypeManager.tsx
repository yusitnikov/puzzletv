import { PuzzleTypeManager } from "../../../types/puzzle/PuzzleTypeManager";
import { DigitPuzzleTypeManager } from "../../default/types/DigitPuzzleTypeManager";
import { globalPaddingCoeff, textColor } from "../../../components/app/globals";
import { myClientId } from "../../../hooks/useMultiPlayer";
import { AdventurePTM} from "./AdventurePTM";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";
import {
    addGridStateExToPuzzleTypeManager,
} from "../../../types/puzzle/PuzzleTypeManagerPlugin";
import { Modal } from "../../../components/layout/modal/Modal";
import { Button } from "../../../components/layout/button/Button";
import { AdventureGameState, choicesMadeStateChangeAction } from "./AdventureGameState";
import { getNextActionId } from "../../../types/puzzle/GameStateAction";

export const AdventureTypeManager = (
    baseTypeManager: PuzzleTypeManager<any> = DigitPuzzleTypeManager(),
): PuzzleTypeManager<AdventurePTM> => {
    return {
        
                ...(addGridStateExToPuzzleTypeManager<AdventurePTM, AdventureGameState>(baseTypeManager, {
                    initialGridStateExtension: {
                        choicesMade: [],
                        message: ""
                    },
                }) as unknown as PuzzleTypeManager<AdventurePTM>),
    getAboveRules: function AdventureAboveRules(context, isPortrait) {

        const {
                cellSizeForSidePanel: cellSize,
            } = context;
        
            const handleOption1 = () => {
                context.gridExtension.choicesMade = [...context.gridExtension.choicesMade, 1]
                context.gridExtension.message = "",
                context.onStateChange(
                    choicesMadeStateChangeAction(
                        context,
                        myClientId,
                        context.gridStateHistory.current.actionId
                    ),
                );
            };

            const handleOption2 = () => {
                context.gridExtension.choicesMade = [...context.gridExtension.choicesMade, 2]
                context.gridExtension.message = "",
                context.onStateChange(
                    choicesMadeStateChangeAction(
                        context,
                        myClientId,
                        context.gridStateHistory.current.actionId
                    ),
                );
            };
        
            return (
                <>
                
                {baseTypeManager.getAboveRules?.(context, isPortrait)}

                {context.gridExtension.message !== "" && (
                    <Modal cellSize={cellSize} >
                        <div>
                                    <>
                                        <div>{"Congratulations "}{context.gridExtension.message}!</div>
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
                                OK
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
                                OK
                            </Button>
                        </div>
                    </Modal>
                )}
                </>
            );
        }
    }
};