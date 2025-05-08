import { ReactNode, useState } from "react";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../utils/profiler";
import { translate } from "../../../utils/translate";

export interface RulesSpoilerProps {
    children: ReactNode;
}

export const RulesSpoiler = observer(function RulesSpoiler({ children }: RulesSpoilerProps) {
    profiler.trace();

    const [spoiled, setSpoiled] = useState(false);

    return (
        <span
            title={spoiled ? "" : `${translate("Spoiler")}! ${translate("Click to show")}`}
            onClick={() => setSpoiled(true)}
            style={{ backgroundColor: spoiled ? undefined : "#888" }}
        >
            <span style={{ opacity: spoiled ? undefined : 0 }} aria-hidden={!spoiled}>
                {children}
            </span>
        </span>
    );
});
