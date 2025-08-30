import styled from "@emotion/styled";
import { BaseButton, BaseInput, getSizes } from "./shared";
import { textColor } from "../../../components/app/globals";
import { observer } from "mobx-react-lite";
import { PuzzleContextProps } from "../../../types/puzzle/PuzzleContext";
import { CrackTheCodePTM } from "../types/CrackTheCodePTM";
import { translate } from "../../../utils/translate";
import { LanguageCode } from "../../../types/translations/LanguageCode";

export const CodeForm = observer(function CodeFormFc({ context }: PuzzleContextProps<CrackTheCodePTM>) {
    const {
        stateExtension: { currentWord, submittedWords },
    } = context;

    const { lineHeight, gap } = getSizes(context);

    return (
        <form
            style={{ display: "flex", gap, alignItems: "center", height: lineHeight * 1.6 }}
            onSubmit={(event) => {
                event.preventDefault();
                const code = currentWord.trim();
                if (code !== "" && submittedWords[0] !== code) {
                    context.onStateChange({ extension: { submittedWords: [code, ...submittedWords] } });
                }
            }}
        >
            <BigInput
                name={"code"}
                placeholder={translate({
                    [LanguageCode.en]: "Enter the code...",
                    [LanguageCode.ru]: "Введите код...",
                    [LanguageCode.de]: "Code eingeben...",
                })}
                value={currentWord}
                onInput={(event) => context.onStateChange({ extension: { currentWord: event.currentTarget.value } })}
                autoComplete={"off"}
                autoFocus={true}
            />
            <BigButton type="submit">
                {translate({
                    [LanguageCode.en]: "Save",
                    [LanguageCode.ru]: "Сохранить",
                    [LanguageCode.de]: "Speichern",
                })}
            </BigButton>
        </form>
    );
});

const BigInput = styled(BaseInput)({
    height: "100%",
    padding: "0 1rem",
    flex: 1,
    minWidth: 0,
});

const BigButton = styled(BaseButton)({
    height: "100%",
    border: `2px solid ${textColor}`,
    padding: "0 1rem",
});
