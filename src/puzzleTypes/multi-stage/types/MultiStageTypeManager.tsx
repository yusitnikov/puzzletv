import { PuzzleTypeManager } from "../../../types/puzzle/PuzzleTypeManager";
import { DigitPuzzleTypeManager } from "../../default/types/DigitPuzzleTypeManager";
import { mergeGameStateUpdates, PartialGameStateEx } from "../../../types/puzzle/GameState";
import { LanguageCode } from "../../../types/translations/LanguageCode";
import { ReactNode } from "react";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";
import { isValidFinishedPuzzleByConstraints } from "../../../types/puzzle/Constraint";
import { PartiallyTranslatable } from "../../../types/translations/Translatable";
import { processTranslations, translate } from "../../../utils/translate";
import { AnyMultiStagePTM } from "./MultiStagePTM";
import { addGameStateExToPuzzleTypeManager } from "../../../types/puzzle/PuzzleTypeManagerPlugin";
import { observer } from "mobx-react-lite";
import { AboveRulesActionItem } from "../../../components/puzzle/rules/AboveRulesActionItem";

interface MultiStageOptions<T extends AnyMultiStagePTM> {
    baseTypeManager?: PuzzleTypeManager<any>;
    getStage: (context: PuzzleContext<T>) => number;
    onStageChange?: (context: PuzzleContext<T>, stage: number) => PartialGameStateEx<T>;
    getStageCompletionText?: (context: PuzzleContext<T>) => PartiallyTranslatable<ReactNode> | undefined;
    getStageButtonText?: (context: PuzzleContext<T>) => PartiallyTranslatable<ReactNode> | undefined;
}

export const MultiStageTypeManager = <T extends AnyMultiStagePTM>({
    baseTypeManager = DigitPuzzleTypeManager(),
    getStage,
    onStageChange,
    getStageCompletionText,
    getStageButtonText,
}: MultiStageOptions<T>): PuzzleTypeManager<T> => ({
    ...addGameStateExToPuzzleTypeManager(baseTypeManager, {
        initialGameStateExtension: { stage: 1 },
    }),

    aboveRulesComponent: observer(function MultiStageAboveRules({ context }) {
        const stage = getStage(context);
        const isNext = stage > context.stateExtension.stage;

        const BaseComponent = baseTypeManager.aboveRulesComponent;

        return (
            <>
                {BaseComponent && <BaseComponent context={context} />}

                <AboveRulesActionItem
                    context={context}
                    visible={isNext}
                    message={translate(
                        getStageCompletionText?.(context) ??
                            processTranslations<ReactNode>(
                                (congratulations, youCompletedTheStage) => (
                                    <>
                                        {congratulations}, {youCompletedTheStage}!
                                    </>
                                ),
                                "Congratulations",
                                {
                                    [LanguageCode.en]: <>you completed the&nbsp;stage</>,
                                    [LanguageCode.ru]: <>Вы завершили этап</>,
                                },
                            ),
                    )}
                    buttonText={translate(
                        getStageButtonText?.(context) ?? {
                            [LanguageCode.en]: "Go to the next stage",
                            [LanguageCode.ru]: "Перейти на следующий этап",
                        },
                    )}
                    onClick={() =>
                        context.onStateChange(
                            mergeGameStateUpdates({ extension: { stage } }, onStageChange?.(context, stage) ?? {}),
                        )
                    }
                />
            </>
        );
    }),
});

export const isValidFinishedPuzzleByStageConstraints =
    <T extends AnyMultiStagePTM>(stage: number) =>
    (context: PuzzleContext<T>) =>
        isValidFinishedPuzzleByConstraints(
            context.cloneWith({
                myGameState: {
                    ...context.myGameState,
                    extension: {
                        ...context.myGameState.extension,
                        stage,
                    },
                },
            }),
        );
