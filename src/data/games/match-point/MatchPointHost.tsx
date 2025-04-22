import { observer } from "mobx-react-lite";
import { useMemo, useState } from "react";
import { MatchPointGameController, MatchPointGameState, MatchPointHostInfo } from "./types";
import { settings } from "../../../types/layout/Settings";
import { useSetMyAblyChannelPresence } from "../../../hooks/useAbly";
import { getMatchPointHostChannelName, matchPointAblyOptions } from "./network";
import { MatchPointHostHomePage } from "./MatchPointHostHomePage";
import { MatchPointHostSetting } from "./MatchPointHostSetting";
import { MatchPointHostGatherAnswers } from "./MatchPointHostGatherAnswers";
import { MatchPointHostPlay } from "./MatchPointHostPlay";

export const MatchPointHost = observer(function MatchPointHost() {
    const [controller] = useState(new MatchPointGameController());

    const name = settings.nickname.get();
    const { state, questionsForGame: questions, currentAnswerIndex, isShowingResults, answers } = controller;
    const channelPresenceData = useMemo(
        (): MatchPointHostInfo => ({ name, state, questions, currentAnswerIndex, isShowingResults, answers }),
        [name, state, questions, currentAnswerIndex, isShowingResults, answers],
    );

    useSetMyAblyChannelPresence(
        matchPointAblyOptions,
        getMatchPointHostChannelName(controller.gameId),
        channelPresenceData,
        controller.state >= MatchPointGameState.Answer,
    );

    switch (controller.state) {
        case MatchPointGameState.HomePage:
            return <MatchPointHostHomePage controller={controller} />;
        case MatchPointGameState.Setting:
            return <MatchPointHostSetting controller={controller} />;
        case MatchPointGameState.Answer:
            return <MatchPointHostGatherAnswers controller={controller} />;
        case MatchPointGameState.Match:
            return <MatchPointHostPlay controller={controller} />;
    }
});
