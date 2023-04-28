import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {MultiStageGameState} from "./MultiStageGameState";
import {DigitSudokuTypeManager} from "../../default/types/DigitSudokuTypeManager";
import {
    mergeGameStateUpdates,
    mergeProcessedGameStateWithUpdates,
    PartialGameStateEx
} from "../../../types/sudoku/GameState";
import {
    aboveRulesTextHeightCoeff,
    rulesHeaderPaddingCoeff,
    rulesMarginCoeff,
    yellowColor
} from "../../../components/app/globals";
import {LanguageCode} from "../../../types/translations/LanguageCode";
import {Button} from "../../../components/layout/button/Button";
import React, {ReactNode} from "react";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {isValidFinishedPuzzleByConstraints} from "../../../types/sudoku/Constraint";
import {PartiallyTranslatable} from "../../../types/translations/Translatable";
import {processTranslations} from "../../../utils/translate";
import {AnyMultiStagePTM} from "./MultiStagePTM";

interface MultiStageSudokuOptions<T extends AnyMultiStagePTM> {
    baseTypeManager?: SudokuTypeManager<any>;
    getStage: (context: PuzzleContext<T>) => number;
    onStageChange?: (context: PuzzleContext<T>, stage: number) => PartialGameStateEx<T>;
    getStageCompletionText?: (context: PuzzleContext<T>) => PartiallyTranslatable<ReactNode> | undefined;
    getStageButtonText?: (context: PuzzleContext<T>) => PartiallyTranslatable<ReactNode> | undefined;
}

export const MultiStageSudokuTypeManager = <T extends AnyMultiStagePTM>(
    {baseTypeManager = DigitSudokuTypeManager(), getStage, onStageChange, getStageCompletionText, getStageButtonText}: MultiStageSudokuOptions<T>
): SudokuTypeManager<T> => ({
    ...baseTypeManager,

    initialGameStateExtension: {
        ...baseTypeManager.initialGameStateExtension,
        stage: 1,
    },
    serializeGameState({stage, ...other}): any {
        return {stage, ...baseTypeManager.serializeGameState(other)};
    },
    unserializeGameState({stage = 1, ...other}: any): Partial<MultiStageGameState> {
        return {stage, ...baseTypeManager.unserializeGameState(other)};
    },

    getAboveRules: (
        translate,
        context
    ) => {
        const {state, onStateChange, cellSizeForSidePanel: cellSize} = context;
        const stage = getStage(context);
        const isNext = stage > state.extension.stage;
        const coeff = isNext ? 1 : 0;

        return <>
            {baseTypeManager.getAboveRules?.(translate, context)}

            <div style={{
            background: yellowColor,
            marginTop: cellSize * rulesMarginCoeff * coeff,
            marginBottom: cellSize * rulesMarginCoeff * coeff * 2,
            padding: `${cellSize * rulesHeaderPaddingCoeff * coeff / 2}px ${cellSize * rulesHeaderPaddingCoeff}px`,
            fontSize: cellSize * aboveRulesTextHeightCoeff,
            lineHeight: `${cellSize * aboveRulesTextHeightCoeff * 1.5}px`,
            height: (cellSize * aboveRulesTextHeightCoeff * 3) * coeff,
            border: "2px solid #f00",
            opacity: coeff,
            overflow: "hidden",
            transition: "0.3s all linear",
            textAlign: "center",
        }}>
                {translate(getStageCompletionText?.(context) ?? processTranslations<ReactNode>(
                    (congratulations, youCompletedTheStage) => <>{congratulations}, {youCompletedTheStage}!</>,
                    "Congratulations",
                    {
                        [LanguageCode.en]: <>you completed the&nbsp;stage</>,
                        [LanguageCode.ru]: <>Вы завершили этап</>,
                    }
                ))} &nbsp;

                <Button
                    type={"button"}
                    cellSize={cellSize}
                    style={{
                        fontFamily: "inherit",
                        fontSize: "inherit",
                        lineHeight: `${cellSize * aboveRulesTextHeightCoeff * 1.5 - 2}px`,
                        paddingTop: 0,
                        paddingBottom: 0,
                    }}
                    onClick={() => onStateChange(mergeGameStateUpdates(
                        {extension: {stage}},
                        onStageChange?.(context, stage) ?? {}
                    ))}
                >
                    {translate(getStageButtonText?.(context) ?? {
                        [LanguageCode.en]: "Go to the next stage",
                        [LanguageCode.ru]: "Перейти на следующий этап",
                    })}
                </Button>
            </div>
        </>;
    },
});

export const isValidFinishedPuzzleByStageConstraints = <T extends AnyMultiStagePTM>(stage: number) =>
    (context: PuzzleContext<T>) => isValidFinishedPuzzleByConstraints({
        ...context,
        state: mergeProcessedGameStateWithUpdates(context.state, {extension: {stage}}),
    });
