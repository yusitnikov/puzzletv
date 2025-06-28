import { EscapePTM } from "../types/EscapePTM";
import { observer } from "mobx-react-lite";
import { PuzzleContextProps } from "../../../types/puzzle/PuzzleContext";
import { Button } from "../../../components/layout/button/Button";
import { textColor } from "../../../components/app/globals";
import { translate } from "../../../utils/translate";
import { LanguageCode } from "../../../types/translations/LanguageCode";
import { escapeMonsterAnimationSpeed, EscapeMonsterAnimationSpeed } from "../types/EscapeMonsterAnimationSpeed";

export const EscapeStartScreen = observer(function EscapeStartScreenFc({ context }: PuzzleContextProps<EscapePTM>) {
    if (context.isReadonlyContext || context.stateExtension.isReady) {
        return null;
    }

    const cellSize = context.cellSizeForSidePanel;

    const startGame = () => {
        context.onStateChange({
            extension: {
                isReady: true,
            },
            selectedCells: context.selectedCells.set([context.puzzle.extension.playerStartPosition]),
        });
    };

    return (
        <div
            style={{
                pointerEvents: "all",
                position: "absolute",
                inset: 0,
                background: "rgba(0, 0, 0, 0.3)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: `${cellSize / 3}px`,
            }}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: cellSize / 3,
                    maxWidth: "90%",
                    boxSizing: "border-box",
                    background: "#fff",
                    border: `1px solid ${textColor}`,
                    borderRadius: cellSize / 5,
                    padding: cellSize / 2,
                }}
            >
                <div style={{ marginBottom: cellSize / 3, fontSize: "120%", fontWeight: 700 }}>
                    {translate({
                        [LanguageCode.en]: "Are you ready?",
                        [LanguageCode.ru]: "Вы готовы?",
                        [LanguageCode.de]: "Sind Sie bereit?",
                    })}
                </div>

                <div>
                    <label>
                        {translate({
                            [LanguageCode.en]: "Level",
                            [LanguageCode.ru]: "Уровень",
                            [LanguageCode.de]: "Schwierigkeitsgrad",
                        })}
                        :&nbsp;
                        <select
                            value={escapeMonsterAnimationSpeed.get()}
                            onChange={(ev) => escapeMonsterAnimationSpeed.set(Number(ev.target.value))}
                            style={{ font: "inherit" }}
                        >
                            <option value={EscapeMonsterAnimationSpeed.slow}>
                                {translate({
                                    [LanguageCode.en]: "Easy",
                                    [LanguageCode.ru]: "Легкий",
                                    [LanguageCode.de]: "Leicht",
                                })}
                            </option>
                            <option value={EscapeMonsterAnimationSpeed.medium}>
                                {translate({
                                    [LanguageCode.en]: "Medium",
                                    [LanguageCode.ru]: "Средний",
                                    [LanguageCode.de]: "Mittel",
                                })}
                            </option>
                            <option value={EscapeMonsterAnimationSpeed.fast}>
                                {translate({
                                    [LanguageCode.en]: "Hard",
                                    [LanguageCode.ru]: "Сложный",
                                    [LanguageCode.de]: "Schwer",
                                })}
                            </option>
                        </select>
                    </label>
                </div>

                <Button autoFocus={true} onClick={startGame}>
                    {translate("Start the game")}
                </Button>
            </div>
        </div>
    );
});
