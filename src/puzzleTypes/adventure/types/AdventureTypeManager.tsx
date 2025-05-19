import { PuzzleTypeManager } from "../../../types/puzzle/PuzzleTypeManager";
import { DigitPuzzleTypeManager } from "../../default/types/DigitPuzzleTypeManager";
import { globalPaddingCoeff, textColor } from "../../../components/app/globals";
import React, { useState } from "react";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { AdventurePTM} from "./AdventurePTM";
import {
    addGridStateExToPuzzleTypeManager,
    addGameStateExToPuzzleTypeManager,
} from "../../../types/puzzle/PuzzleTypeManagerPlugin";
import { Modal } from "../../../components/layout/modal/Modal";
import { Button } from "../../../components/layout/button/Button";
import { AdventureGameState } from "./AdventureGameState";

export const AdventureTypeManager = <T extends AdventurePTM>(
    baseTypeManager: PuzzleTypeManager<any> = DigitPuzzleTypeManager(),
): PuzzleTypeManager<T> => {
    return {
        
                ...(addGameStateExToPuzzleTypeManager<T, AdventureGameState>(baseTypeManager, {
                    initialGameStateExtension: {
                        choicesMade: [],
                        message: ""
                    },
                }) as unknown as PuzzleTypeManager<T>),
    getAboveRules: function AdventureAboveRules(context, isPortrait) {

        const {
                cellSizeForSidePanel: cellSize,
            } = context;
        
            const handleOption1 = () => {
                context.stateExtension.choicesMade = [...context.stateExtension.choicesMade, 1]
                context.stateExtension.message = ""
            };

            const handleOption2 = () => {
                context.stateExtension.choicesMade = [...context.stateExtension.choicesMade, 2]
                context.stateExtension.message = ""
            };
        
            return (
                <>
                
                {baseTypeManager.getAboveRules?.(context, isPortrait)}

                {context.stateExtension.message !== "" && (
                    <Modal cellSize={cellSize} >
                        <div>
                                    <>
                                        <div>{"Congratulations "}{context.stateExtension.message}!</div>
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