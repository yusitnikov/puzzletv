import {MatchPointHostInfo} from "./types";
import {observer} from "mobx-react-lite";
import {LargeButton, Paragraph, SubHeader} from "./styled";
import {useState} from "react";

interface MatchPointPlayStepProps extends Omit<MatchPointHostInfo, "name" | "state"> {
    onSelect?: (playerIndex?: number) => void;
}

export const MatchPointPlayStep = observer(function MatchPointPlayStep(
    {questions, answers, currentAnswerIndex, isShowingResults, onSelect}: MatchPointPlayStepProps
) {
    const [playerIndexes, setPlayerIndexes] = useState<(number | undefined)[]>([]);
    const setPlayerIndex = (playerIndex?: number) => {
        const newIndexes = [...playerIndexes];
        newIndexes[currentAnswerIndex] = playerIndex;
        setPlayerIndexes(newIndexes);

        onSelect?.(playerIndex);
    };
    const selectedPlayer = currentAnswerIndex in playerIndexes;
    const playerIndex = playerIndexes[currentAnswerIndex];

    const playerAnswer = answers[currentAnswerIndex];
    if (!playerAnswer) {
        return null;
    }

    const sortedPlayers = answers
        .map(({name}, index) => ({index, name}))
        .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

    return <div>
        {questions.map((question, index) => <Paragraph key={index}>
            <SubHeader>{question}</SubHeader>
            <div>{playerAnswer.answers[index]}</div>
        </Paragraph>)}

        <Paragraph>
            <SubHeader>
                {isShowingResults && <>
                    {playerIndex === currentAnswerIndex && "Yes! "}
                    {playerIndex !== currentAnswerIndex && playerIndex !== undefined && "No! "}
                    It's {playerAnswer.name}!
                </>}
                {!isShowingResults && "Who would it be?"}
            </SubHeader>
        </Paragraph>

        {!isShowingResults && <Paragraph>
            <div style={{ display: "flex", justifyContent: "center", gap: "1em", flexWrap: "wrap" }}>
                {sortedPlayers.map(({index, name}) => <LargeButton
                    key={index}
                    checked={playerIndex === index}
                    onClick={() => setPlayerIndex(index)}
                >
                    {name}
                </LargeButton>)}

                <LargeButton
                    key={"skip"}
                    checked={selectedPlayer && playerIndex === undefined}
                    onClick={() => setPlayerIndex(undefined)}
                >
                    Skip
                </LargeButton>
            </div>
        </Paragraph>}
    </div>;
});
