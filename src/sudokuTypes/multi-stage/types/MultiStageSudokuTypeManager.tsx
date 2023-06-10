import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {MultiStageGameState} from "./MultiStageGameState";
import {DigitSudokuTypeManager} from "../../default/types/DigitSudokuTypeManager";
import {
    mergeGameStateUpdates,
    PartialGameStateEx
} from "../../../types/sudoku/GameState";
import {
    aboveRulesTextHeightCoeff,
    rulesHeaderPaddingCoeff,
    rulesMarginCoeff,
    lightOrangeColor
} from "../../../components/app/globals";
import {LanguageCode} from "../../../types/translations/LanguageCode";
import {Button} from "../../../components/layout/button/Button";
import React, {ReactNode} from "react";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {isValidFinishedPuzzleByConstraints} from "../../../types/sudoku/Constraint";
import {PartiallyTranslatable} from "../../../types/translations/Translatable";
import {processTranslations} from "../../../utils/translate";
import {AnyMultiStagePTM} from "./MultiStagePTM";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";

interface MultiStageSudokuOptions<T extends AnyMultiStagePTM> {
    baseTypeManager?: SudokuTypeManager<any>;
    getStage: (context: PuzzleContext<T>) => number;
    onStageChange?: (context: PuzzleContext<T>, stage: number) => PartialGameStateEx<T>;
    getStageCompletionText?: (context: PuzzleContext<T>) => PartiallyTranslatable<ReactNode> | undefined;
    getStageButtonText?: (context: PuzzleContext<T>) => PartiallyTranslatable<ReactNode> | undefined;
}

export const MultiStageSudokuTypeManager = <T extends AnyMultiStagePTM>(
    {
        baseTypeManager: {initialGameStateExtension, serializeGameState, unserializeGameState, ...baseTypeManager} = DigitSudokuTypeManager(),
        getStage,
        onStageChange,
        getStageCompletionText,
        getStageButtonText,
    }: MultiStageSudokuOptions<T>
): SudokuTypeManager<T> => ({
    ...baseTypeManager,

    initialGameStateExtension: (puzzle) => ({
        ...(
            typeof initialGameStateExtension === "function"
                ? (initialGameStateExtension as ((puzzle: PuzzleDefinition<T>) => T["stateEx"]))(puzzle)
                : initialGameStateExtension
        ),
        stage: 1,
    }),
    serializeGameState({stage, ...other}): any {
        return {stage, ...serializeGameState(other)};
    },
    unserializeGameState({stage = 1, ...other}: any): Partial<MultiStageGameState> {
        return {stage, ...unserializeGameState(other)};
    },

    getAboveRules: (translate, context, isPortrait) => {
        const {cellSizeForSidePanel: cellSize} = context;
        const stage = getStage(context);
        const isNext = stage > context.stateExtension.stage;
        const coeff = isNext ? 1 : 0;

        return <>
            {baseTypeManager.getAboveRules?.(translate, context, isPortrait)}

            <div style={{
                background: lightOrangeColor,
                marginTop: cellSize * rulesMarginCoeff * coeff,
                marginBottom: cellSize * rulesMarginCoeff * coeff * 2,
                padding: `${cellSize * rulesHeaderPaddingCoeff * coeff / 2}px ${cellSize * rulesHeaderPaddingCoeff}px`,
                fontSize: cellSize * aboveRulesTextHeightCoeff,
                lineHeight: `${cellSize * aboveRulesTextHeightCoeff * 1.5}px`,
                height: (cellSize * aboveRulesTextHeightCoeff * 1.5 * (isPortrait ? 3 : 2)) * coeff,
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
                    onClick={() => context.onStateChange(mergeGameStateUpdates(
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
    (context: PuzzleContext<T>) => isValidFinishedPuzzleByConstraints(context.cloneWith({
        myGameState: {
            ...context.myGameState,
            extension: {
                ...context.myGameState.extension,
                stage,
            },
        },
        processedGameStateExtension: undefined,
    }));
