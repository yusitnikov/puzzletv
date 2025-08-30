import { observer } from "mobx-react-lite";
import { PuzzleContextProps } from "../../../types/puzzle/PuzzleContext";
import { CrackTheCodePTM } from "../types/CrackTheCodePTM";
import { BaseInput, BorderlessButton, buttonHighlightColor, getSizes } from "./shared";
import { translate } from "../../../utils/translate";
import { LanguageCode } from "../../../types/translations/LanguageCode";
import { getIndicatorLetter } from "../utils/getIndicatorLetter";
import { ConditionIndicator } from "./ConditionIndicator";

export const ConditionIndicators = observer(function ConditionIndicatorsFc({
    context,
}: PuzzleContextProps<CrackTheCodePTM>) {
    const {
        puzzle: {
            extension: { conditions },
        },
        cellSize,
        stateExtension: { currentWord, assumptionsPanelOpened, assumptions },
    } = context;

    const { fontSize, lineHeight, gap } = getSizes(context);

    return (
        <>
            <div>
                <BorderlessButton
                    type={"button"}
                    onClick={() =>
                        context.onStateChange({
                            extension: { assumptionsPanelOpened: !assumptionsPanelOpened },
                        })
                    }
                    style={{
                        height: lineHeight * conditions.length + gap * (conditions.length - 1),
                        borderLeft: `1px solid ${buttonHighlightColor}`,
                    }}
                >
                    {assumptionsPanelOpened ? ">" : "<"}
                </BorderlessButton>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap }}>
                {conditions.map((condition, index) => (
                    <div
                        key={index}
                        style={{ display: "flex", flexDirection: "row", gap: gap / 2, alignItems: "center" }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: assumptionsPanelOpened ? cellSize * 0.45 : 0,
                                opacity: assumptionsPanelOpened ? 1 : 0,
                                transition: "width 0.3s ease, opacity 0.3s ease",
                                position: "relative",
                                height: "100%",
                                overflow: "hidden",
                            }}
                        >
                            <BaseInput
                                autoComplete={"off"}
                                placeholder={
                                    translate({
                                        [LanguageCode.en]: "Your assumptions about",
                                        [LanguageCode.ru]: "Ваши предположения про",
                                        [LanguageCode.de]: "Ihre Annahmen über",
                                    }) + ` ${getIndicatorLetter(index)}...`
                                }
                                value={assumptions[index] ?? ""}
                                onInput={(event) => {
                                    const newAssumptions = [...assumptions];
                                    newAssumptions[index] = event.currentTarget.value;
                                    context.onStateChange({ extension: { assumptions: newAssumptions } });
                                }}
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    fontSize: fontSize * 0.5,
                                    lineHeight: "1.1rem",
                                    padding: "0.4rem",
                                    boxSizing: "border-box",
                                }}
                            />
                        </div>
                        <ConditionIndicator index={index} condition={condition} code={currentWord} size={lineHeight} />
                    </div>
                ))}
            </div>
        </>
    );
});
