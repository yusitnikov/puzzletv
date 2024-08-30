import {observer} from "mobx-react-lite";
import {MatchPointGameControllerProps} from "./types";
import {MatchPointPlayStep} from "./MatchPointPlayStep";
import {LargeButton, Paragraph} from "./styled";
import {useTranslate} from "../../../hooks/useTranslate";

export const MatchPointHostPlay = observer(function MatchPointHostPlay({controller}: MatchPointGameControllerProps) {
    const translate = useTranslate();

    const {questionsForGame: questions, answers, currentAnswerIndex, isShowingResults} = controller;

    const isLastPlayer = currentAnswerIndex === answers.length - 1;

    return <div>
        <MatchPointPlayStep
            questions={questions}
            answers={answers}
            currentAnswerIndex={currentAnswerIndex}
            isShowingResults={isShowingResults}
            onSelect={() => controller.selectPlayer()}
        />

        {isShowingResults && <Paragraph>
            {!isLastPlayer && <LargeButton onClick={() => controller.goToNextPlayer()}>
                {translate("Next")}
            </LargeButton>}

            {isLastPlayer && <LargeButton onClick={() => controller.createNew()}>
                {translate("Create new game")}
            </LargeButton>}
        </Paragraph>}
    </div>;
});
