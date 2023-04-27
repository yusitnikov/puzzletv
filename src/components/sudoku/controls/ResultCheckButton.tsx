import {ControlButtonItemProps} from "./ControlButtonsManager";
import {ControlButton} from "./ControlButton";
import {Check} from "@emotion-icons/material";
import {Modal} from "../../layout/modal/Modal";
import {Button} from "../../layout/button/Button";
import {globalPaddingCoeff, textColor} from "../../app/globals";
import {useTranslate} from "../../../hooks/useTranslate";
import {useMemo, useState} from "react";
import {PuzzleResultCheck} from "../../../types/sudoku/PuzzleResultCheck";
import {useEffectExceptInit} from "../../../hooks/useEffectExceptInit";
import {myClientId} from "../../../hooks/useMultiPlayer";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";

export const ResultCheckButton = <T extends AnyPTM>({context, top, left}: ControlButtonItemProps<T>) => {
    const {
        cellSizeForSidePanel: cellSize,
        puzzle,
        state,
        multiPlayer: {isEnabled, allPlayerIds, myPendingMessages},
    } = context;

    const {
        params,
        typeManager,
        resultChecker,
        forceAutoCheckOnFinish = false,
        getLmdSolutionCode,
    } = puzzle;

    const {
        getPlayerScore,
        onCloseCorrectResultPopup,
    } = typeManager;

    const {
        openedLmdOnce,
        lives,
        fogDemoFieldStateHistory,
    } = state;

    const isLmdAllowed = !!params?.lmd;

    const translate = useTranslate();

    const [isShowingResult, setIsShowingResult] = useState(false);

    const {isCorrectResult, resultPhrase} = useMemo(
        (): PuzzleResultCheck<string> => {
            if (lives === 0) {
                return {
                    isCorrectResult: false,
                    resultPhrase: translate("You lost") + "!",
                };
            }

            const result = resultChecker?.(context) ?? false;
            return typeof result === "boolean"
                ? {
                    isCorrectResult: result,
                    resultPhrase: result
                        ? `${translate("Absolutely right")}!`
                        : `${translate("Something's wrong here")}...`
                }
                : {
                    isCorrectResult: result.isCorrectResult,
                    resultPhrase: translate(result.resultPhrase),
                };
        },
        [resultChecker, context, translate, lives]
    );

    const handleCheckResult = () => setIsShowingResult(true);
    const handleCloseCheckResult = () => {
        setIsShowingResult(false);
        if (isCorrectResult) {
            onCloseCorrectResultPopup?.(context);
        }
    };

    const lmdSolutionCode = useMemo(() => getLmdSolutionCode?.(puzzle, state), [getLmdSolutionCode, puzzle, state]);

    const autoCheckOnFinish = state.autoCheckOnFinish || forceAutoCheckOnFinish;
    useEffectExceptInit(() => {
        if (autoCheckOnFinish && resultChecker && isCorrectResult) {
            setIsShowingResult(true);
        }
    }, [autoCheckOnFinish, resultChecker, isCorrectResult, resultPhrase, setIsShowingResult]);

    useEffectExceptInit(() => {
        if (!lives) {
            setIsShowingResult(true);
        }
    }, [lives]);

    const playerScores = useMemo(
        () => allPlayerIds
            .map(clientId => ({
                clientId,
                score: getPlayerScore?.(context, clientId) || 0,
            }))
            .sort((a, b) => a.score < b.score ? 1 : -1),
        [context, allPlayerIds, getPlayerScore]
    );
    const bestScore = playerScores[0]?.score || 0;
    const worstScore = playerScores[playerScores.length - 1]?.score || 0;
    const myScore = useMemo(
        () => playerScores.find(({clientId}) => clientId === myClientId)!.score,
        [playerScores]
    );

    if (fogDemoFieldStateHistory) {
        return null;
    }

    return <>
        {!forceAutoCheckOnFinish && <ControlButton
            left={left}
            top={top}
            cellSize={cellSize}
            onClick={handleCheckResult}
            title={`${translate("Check the result")}`}
        >
            <Check/>
        </ControlButton>}
        {/* The score could be mis-calculated before getting confirmation from the host, so don't display the results until then */}
        {isShowingResult && myPendingMessages.length === 0 && <Modal cellSize={cellSize} onClose={handleCloseCheckResult}>
            <div>
                {
                    getPlayerScore
                        ? (
                            isEnabled
                                ? `${translate(bestScore === worstScore ? "It's a draw" : (myScore === bestScore ? "You win" : "You lose"))}!`
                                : <>
                                    <div>{translate("Congratulations")}!</div>
                                    <div>{translate("Your score is %1").replace("%1", myScore.toString())}.</div>
                                </>
                        )
                        : resultPhrase.split("\n").map((line, lineIndex) => <div key={lineIndex}>{line}</div>)
                }
            </div>

            {(isLmdAllowed || openedLmdOnce) && isCorrectResult && lmdSolutionCode !== undefined && <>
                <div style={{marginTop: cellSize * globalPaddingCoeff}}>
                    {translate("Solution code")}:
                </div>
                <div>
                    <input
                        value={lmdSolutionCode}
                        readOnly={true}
                        style={{
                            marginTop: cellSize * globalPaddingCoeff / 4,
                            border: `1px solid ${textColor}`,
                            background: "#fff",
                            fontSize: "inherit",
                            padding: "0.25em",
                            textAlign: "center",
                        }}
                    />
                </div>
            </>}

            <div>
                <Button
                    type={"button"}
                    cellSize={cellSize}
                    onClick={handleCloseCheckResult}
                    autoFocus={true}
                    style={{
                        marginTop: cellSize * globalPaddingCoeff,
                        padding: "0.5em 1em",
                    }}
                >
                    OK
                </Button>
            </div>
        </Modal>}
    </>;
};
