import { observer } from "mobx-react-lite";
import { RulesParagraph } from "../../../components/puzzle/rules/RulesParagraph";
import { translate } from "../../../utils/translate";
import { LanguageCode } from "../../../types/translations/LanguageCode";

export const CrackTheCodeRules = observer(function CrackTheCodeRulesFc() {
    return (
        <>
            <RulesParagraph>
                {translate({
                    [LanguageCode.en]: "Enter the code into the text box.",
                    [LanguageCode.ru]: "Введите код в текстовое поле.",
                    [LanguageCode.de]: "Geben Sie den Code in das Textfeld ein.",
                })}
            </RulesParagraph>
            <RulesParagraph>
                {translate({
                    [LanguageCode.en]: "Make all indicators turn into green.",
                    [LanguageCode.ru]: "Сделайте так, чтобы все индикаторы стали зелеными.",
                    [LanguageCode.de]: "Lassen Sie alle Anzeigen auf Grün schalten.",
                })}
            </RulesParagraph>
        </>
    );
});
