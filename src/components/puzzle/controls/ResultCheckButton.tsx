import { ControlButtonItemProps, ControlButtonItemPropsGenericFc } from "./ControlButtonsManager";
import { ControlButton } from "./ControlButton";
import { Check } from "@emotion-icons/material";
import { Modal } from "../../layout/modal/Modal";
import { Button } from "../../layout/button/Button";
import { globalPaddingCoeff, textColor } from "../../app/globals";
import { useState } from "react";
import { useEffectExceptInit } from "../../../hooks/useEffectExceptInit";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { observer } from "mobx-react-lite";
import { settings } from "../../../types/layout/Settings";
import { profiler } from "../../../utils/profiler";
import { translate } from "../../../utils/translate";

export const ResultCheckButton: ControlButtonItemPropsGenericFc = observer(function ResultCheckButton<
    T extends AnyPTM,
>({ context, top, left }: ControlButtonItemProps<T>) {
    profiler.trace();

    const {
        cellSizeForSidePanel: cellSize,
        puzzle,
        multiPlayer: { isEnabled, playerScores, myScore, myPendingMessages },
        lmdSolutionCode,
        openedLmdOnce,
        lives,
        fogDemoGridStateHistory,
    } = context;

    const { params, typeManager, resultChecker, forceAutoCheckOnFinish = false } = puzzle;

    const { getPlayerScore, onCloseCorrectResultPopup } = typeManager;

    const isLmdAllowed = !!params?.lmd;

    const [isShowingResult, setIsShowingResult] = useState(false);

    const { isCorrectResult, resultPhrase, forceShowResult = false } = context.resultCheck;

    const handleCheckResult = () => setIsShowingResult(true);
    const handleCloseCheckResult = () => {
        setIsShowingResult(false);
        if (isCorrectResult) {
            onCloseCorrectResultPopup?.(context);
        }
    };

    const autoCheckOnFinish = settings.autoCheckOnFinish.get() || forceAutoCheckOnFinish;
    useEffectExceptInit(() => {
        if (autoCheckOnFinish && resultChecker && (isCorrectResult || forceShowResult)) {
            setIsShowingResult(true);
        }
    }, [autoCheckOnFinish, resultChecker, isCorrectResult, forceShowResult, resultPhrase, setIsShowingResult]);

    useEffectExceptInit(() => {
        if (!lives) {
            setIsShowingResult(true);
        }
    }, [lives]);

    const bestScore = playerScores[0]?.score || 0;
    const worstScore = playerScores[playerScores.length - 1]?.score || 0;

    if (fogDemoGridStateHistory) {
        return null;
    }

    return (
        <>
            {!forceAutoCheckOnFinish && (
                <ControlButton
                    left={left}
                    top={top}
                    cellSize={cellSize}
                    onClick={handleCheckResult}
                    title={`${translate("Check the result")}`}
                >
                    <Check />
                </ControlButton>
            )}
            {/* The score could be mis-calculated before getting confirmation from the host, so don't display the results until then */}
            {isShowingResult && myPendingMessages.length === 0 && (
                <Modal cellSize={cellSize} onClose={handleCloseCheckResult}>
                    <div>
                        {getPlayerScore ? (
                            isEnabled ? (
                                `${translate(bestScore === worstScore ? "It's a draw" : myScore === bestScore ? "You win" : "You lose")}!`
                            ) : (
                                <>
                                    <div>{translate("Congratulations")}!</div>
                                    <div>{translate("Your score is %1").replace("%1", myScore.toString())}.</div>
                                </>
                            )
                        ) : typeof resultPhrase !== "string" ? (
                            resultPhrase
                        ) : (
                            resultPhrase.split("\n").map((line, lineIndex) => <div key={lineIndex}>{line}</div>)
                        )}
                    </div>

                    {(isLmdAllowed || openedLmdOnce) && isCorrectResult && lmdSolutionCode !== undefined && (
                        <>
                            <div style={{ marginTop: cellSize * globalPaddingCoeff }}>
                                {translate("Solution code")}:
                            </div>
                            <div>
                                <input
                                    value={lmdSolutionCode}
                                    readOnly={true}
                                    style={{
                                        marginTop: (cellSize * globalPaddingCoeff) / 4,
                                        border: `1px solid ${textColor}`,
                                        background: "#fff",
                                        fontSize: "inherit",
                                        padding: "0.25em",
                                        textAlign: "center",
                                    }}
                                />
                            </div>
                        </>
                    )}

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
                </Modal>
            )}
        </>
    );
});
