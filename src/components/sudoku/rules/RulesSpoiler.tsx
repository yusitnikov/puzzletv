import {ReactNode, useState} from "react";
import {useTranslate} from "../../../contexts/LanguageCodeContext";

export interface RulesSpoilerProps {
    children: ReactNode;
}

export const RulesSpoiler = ({children}: RulesSpoilerProps) => {
    const [spoiled, setSpoiled] = useState(false);

    const translate = useTranslate();

    return <span
        title={spoiled ? "" : `${translate("Spoiler")}! ${translate("Click to show")}`}
        onClick={() => setSpoiled(true)}
        style={{backgroundColor: spoiled ? undefined : "#888"}}
    >
        <span
            style={{opacity: spoiled ? undefined : 0}}
            aria-hidden={!spoiled}
        >
            {children}
        </span>
    </span>
};
