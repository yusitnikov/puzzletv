import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {MultiStageGameState} from "./MultiStageGameState";
import {DigitSudokuTypeManager} from "../../default/types/DigitSudokuTypeManager";
import {ProcessedGameState} from "../../../types/sudoku/GameState";
import {h2HeightCoeff, rulesHeaderPaddingCoeff, rulesMarginCoeff, yellowColor} from "../../../components/app/globals";
import {LanguageCode} from "../../../types/translations/LanguageCode";
import {Button} from "../../../components/layout/button/Button";
import React, {ReactNode} from "react";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {isValidFinishedPuzzleByConstraints} from "../../../types/sudoku/Constraint";
import {PartiallyTranslatable} from "../../../types/translations/Translatable";
import {processTranslations} from "../../../utils/translate";

interface MultiStageSudokuOptions {
    getStage: (context: PuzzleContext<number, MultiStageGameState, MultiStageGameState>) => number;
    onStageChange?: (context: PuzzleContext<number, MultiStageGameState, MultiStageGameState>, stage: number)
        => Partial<ProcessedGameState<number> & MultiStageGameState>;
    getStageCompletionText?: (context: PuzzleContext<number, MultiStageGameState, MultiStageGameState>)
        => PartiallyTranslatable<ReactNode> | undefined;
    getStageButtonText?: (context: PuzzleContext<number, MultiStageGameState, MultiStageGameState>)
        => PartiallyTranslatable<ReactNode> | undefined;
}

const aboveRulesTextHeightCoeff = h2HeightCoeff * 0.9;

export const MultiStageSudokuTypeManager = (
    {getStage, onStageChange, getStageCompletionText, getStageButtonText}: MultiStageSudokuOptions
): SudokuTypeManager<number, MultiStageGameState, MultiStageGameState> => ({
    ...DigitSudokuTypeManager<MultiStageGameState, MultiStageGameState>(),

    initialGameStateExtension: {
        stage: 1,
    },
    serializeGameState({stage}): any {
        return {stage};
    },
    unserializeGameState({stage = 1}: any): Partial<MultiStageGameState> {
        return {stage};
    },

    getAboveRules: (
        translate,
        context
    ) => {
        const {state, onStateChange, cellSize} = context;
        const stage = getStage(context);
        const isNext = stage > state.stage;
        const coeff = isNext ? 1 : 0;

        return <div style={{
            background: yellowColor,
            marginBottom: cellSize * rulesMarginCoeff * coeff,
            padding: `${cellSize * rulesHeaderPaddingCoeff * coeff / 2}px ${cellSize * rulesHeaderPaddingCoeff}px`,
            fontSize: cellSize * aboveRulesTextHeightCoeff,
            lineHeight: `${cellSize * aboveRulesTextHeightCoeff * 1.5}px`,
            height: (cellSize * aboveRulesTextHeightCoeff * 3) * coeff,
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
                onClick={() => onStateChange({
                    stage,
                    ...onStageChange?.(context, stage),
                })}
            >
                {translate(getStageButtonText?.(context) ?? {
                    [LanguageCode.en]: "Go to the next stage",
                    [LanguageCode.ru]: "Перейти на следующий этап",
                })}
            </Button>
        </div>;
    },
});

export const isValidFinishedPuzzleByStageConstraints = <CellType,>(stage: number) =>
    (context: PuzzleContext<CellType, MultiStageGameState, MultiStageGameState>) => isValidFinishedPuzzleByConstraints({
        ...context,
        state: {
            ...context.state,
            stage,
        }
    });
