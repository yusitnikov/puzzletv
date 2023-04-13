import {ControlButtonItemProps} from "./ControlButtonsManager";
import {ControlButton} from "./ControlButton";
import {Absolute} from "../../layout/absolute/Absolute";
import {Replay} from "@emotion-icons/material";
import {Modal} from "../../layout/modal/Modal";
import {Button} from "../../layout/button/Button";
import {globalPaddingCoeff, textHeightCoeff} from "../../app/globals";
import {useTranslate} from "../../../hooks/useTranslate";
import {useCallback, useState} from "react";
import {getEmptyGameState, mergeGameStateWithUpdates} from "../../../types/sudoku/GameState";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";

export const ResetButton = <T extends AnyPTM>(
    {
        context: {
            cellSizeForSidePanel: cellSize,
            puzzle,
            onStateChange,
            multiPlayer: {isEnabled, isHost},
        },
        top,
        left,
    }: ControlButtonItemProps<T>
) => {
    const {typeManager: {keepStateOnRestart}} = puzzle;
    const canRestart = !isEnabled || isHost;

    const translate = useTranslate();

    const [isShowingRestartConfirmation, setIsShowingRestartConfirmation] = useState(false);

    const handleMaybeRestart = useCallback(() => setIsShowingRestartConfirmation(true), [setIsShowingRestartConfirmation]);
    const handleCloseRestart = useCallback(() => setIsShowingRestartConfirmation(false), [setIsShowingRestartConfirmation]);
    const handleSureRestart = useCallback(() => {
        handleCloseRestart();
        onStateChange((state) => mergeGameStateWithUpdates(
            getEmptyGameState(puzzle, false),
            keepStateOnRestart?.(state) ?? {},
        ));
    }, [handleCloseRestart, onStateChange, puzzle, keepStateOnRestart]);

    return <>
        <ControlButton
            left={left}
            top={top}
            cellSize={cellSize}
            onClick={handleMaybeRestart}
            title={translate("Clear the progress and restart")}
        >
            {contentSize => <>
                <div style={{
                    fontSize: contentSize * 0.4,
                    marginTop: contentSize * 0.05,
                    marginLeft: contentSize * 0.1,
                    fontWeight: 700,
                }}>
                    !
                </div>
                <Absolute
                    width={contentSize}
                    height={contentSize}
                    angle={-30}
                >
                    <Replay/>
                </Absolute>
            </>}
        </ControlButton>
        {isShowingRestartConfirmation && <Modal cellSize={cellSize} onClose={handleCloseRestart}>
            {!canRestart && <>
                <div>{translate("You can't restart the game because you're not hosting it")}.</div>
                <div>{translate("If you want to restart the game, please ask the game host to do it")}.</div>

                <Button
                    type={"button"}
                    cellSize={cellSize}
                    onClick={handleCloseRestart}
                    autoFocus={true}
                    style={{
                        marginTop: cellSize * globalPaddingCoeff,
                        padding: "0.5em 1em",
                    }}
                >
                    OK
                </Button>
            </>}

            {canRestart && <>
                <div>{translate("Are you sure that you want to restart")}?</div>
                <div>{translate("All progress will be lost")}.</div>

                <div style={{marginTop: cellSize * globalPaddingCoeff}}>
                    <Button
                        type={"button"}
                        cellSize={cellSize}
                        onClick={handleSureRestart}
                        autoFocus={true}
                        style={{
                            padding: "0.5em 1em",
                        }}
                    >
                        {translate("Yes")}
                    </Button>

                    <Button
                        type={"button"}
                        cellSize={cellSize}
                        onClick={handleCloseRestart}
                        style={{
                            marginLeft: cellSize * textHeightCoeff,
                            padding: "0.5em 1em",
                        }}
                    >
                        {translate("Cancel")}
                    </Button>
                </div>
            </>}
        </Modal>}
    </>;
};
