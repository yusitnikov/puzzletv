import { observer } from "mobx-react-lite";
import { MatchPointGameControllerProps } from "./types";
import { LargeButton } from "./styled";
import { MatchPointExplanation } from "./MatchPointExplanation";
import { useTranslate } from "../../../hooks/useTranslate";

export const MatchPointHostHomePage = observer(function MatchPointHostHomePage({
    controller,
}: MatchPointGameControllerProps) {
    const translate = useTranslate();

    return (
        <div>
            <MatchPointExplanation />

            <LargeButton onClick={() => controller.createNew()} autoFocus={true} style={{ marginTop: "2em" }}>
                {translate("Create new game")}
            </LargeButton>
        </div>
    );
});
