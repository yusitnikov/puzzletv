import { observer } from "mobx-react-lite";
import { PuzzleContextProps } from "../../../types/puzzle/PuzzleContext";
import { CrackTheCodePTM } from "../types/CrackTheCodePTM";
import { BorderlessButton, getSizes } from "./shared";
import { veryDarkGreyColor } from "../../../components/app/globals";
import { translate } from "../../../utils/translate";
import { LanguageCode } from "../../../types/translations/LanguageCode";
import { ConditionIndicator } from "./ConditionIndicator";

export const SubmittedCodes = observer(function SubmittedCodesFc({ context }: PuzzleContextProps<CrackTheCodePTM>) {
    const {
        puzzle: {
            extension: { conditions },
        },
        stateExtension: { submittedWords, assumptions },
    } = context;

    const { lineHeight, gap } = getSizes(context);

    return (
        <div
            style={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                gap,
                overflow: "auto",
            }}
        >
            {submittedWords.length === 0 && (
                <div style={{ fontSize: "60%", color: veryDarkGreyColor }}>
                    {translate({
                        [LanguageCode.en]: "Save a code here to remember the indicator states for it...",
                        [LanguageCode.ru]: "Сохраните код здесь, чтобы запомнить состояния индикатора для него...",
                        [LanguageCode.de]:
                            "Speichern Sie hier einen Code, um sich die Anzeigezustände dafür zu merken...",
                    })}
                </div>
            )}
            {submittedWords.map((word, index) => (
                <div
                    key={index}
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: gap / 2,
                    }}
                >
                    <div>"{word}":</div>
                    {conditions.map((condition, index) => (
                        <ConditionIndicator
                            key={index}
                            index={index}
                            condition={condition}
                            code={word}
                            size={lineHeight}
                            title={
                                assumptions[index]
                                    ? translate({
                                          [LanguageCode.en]: "Your assumptions",
                                          [LanguageCode.ru]: "Ваши предположения",
                                          [LanguageCode.de]: "Ihre Annahmen",
                                      }) + `: ${assumptions[index]}`
                                    : undefined
                            }
                        />
                    ))}
                    <BorderlessButton
                        type={"button"}
                        onClick={() => {
                            const newWords = [...submittedWords];
                            newWords.splice(index, 1);
                            context.onStateChange({ extension: { submittedWords: newWords } });
                        }}
                    >
                        &times;
                    </BorderlessButton>
                </div>
            ))}
        </div>
    );
});
