import {useEffect, useMemo, useState} from "react";
import {
    getEmptyGameState,
    ProcessedGameStateAnimatedValues,
    saveGameState
} from "../../types/sudoku/GameState";
import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {useMultiPlayer} from "../useMultiPlayer";
import {PuzzleContext} from "../../types/sudoku/PuzzleContext";
import {mixAnimatedValue, useAnimatedValue} from "../useAnimatedValue";
import {AnyPTM} from "../../types/sudoku/PuzzleTypeMap";
import {profiler} from "../../utils/profiler";
import {autorun} from "mobx";
import {settings} from "../../types/layout/Settings";
import {useLanguageCode} from "../useTranslate";

const emptyObject: any = {};

export const useGame = <T extends AnyPTM>(
    puzzle: PuzzleDefinition<T>,
    cellSize: number,
    cellSizeForSidePanel: number,
    isReadonlyContext = false
): PuzzleContext<T> => {
    const timer = profiler.track("useGame");

    const {typeManager} = puzzle;

    const {
        useProcessedGameStateExtension = () => emptyObject as T["processedStateEx"],
    } = typeManager;

    const languageCode = useLanguageCode();

    const [context] = useState(() => new PuzzleContext({
        puzzle,
        myGameState: getEmptyGameState(puzzle, true, isReadonlyContext),
        cellSize,
        cellSizeForSidePanel,
        isReadonlyContext,
        applyKeys: true,
        applyPendingMessages: true,
        languageCode,
    }));
    useEffect(() => context.update({puzzle}), [context, puzzle]);
    useEffect(() => context.update({cellSize}), [context, cellSize]);
    useEffect(() => context.update({cellSizeForSidePanel}), [context, cellSizeForSidePanel]);
    useEffect(() => context.update({isReadonlyContext}), [context, isReadonlyContext]);
    useEffect(() => context.update({languageCode}), [context, languageCode]);

    // TODO: make it not update the state?
    const processedGameStateExtension = useProcessedGameStateExtension(context);
    useEffect(
        () => context.update({processedGameStateExtension}),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [context, JSON.stringify(processedGameStateExtension)]
    );

    // TODO: make it not update the state?
    const animated = useAnimatedValue<ProcessedGameStateAnimatedValues>(
        {
            loopOffset: context.loopOffset,
            angle: context.angle,
            scale: context.scale,
        },
        context.animating ? settings.animationSpeed.get() : 0,
        (a, b, coeff) => ({
            loopOffset: {
                top: mixAnimatedValue(a.loopOffset.top, b.loopOffset.top, coeff * 2),
                left: mixAnimatedValue(a.loopOffset.left, b.loopOffset.left, coeff * 2),
            },
            angle: mixAnimatedValue(a.angle, b.angle, coeff),
            scale: mixAnimatedValue(a.scale, b.scale, coeff * 2),
        })
    );
    useEffect(() => context.update({animated}), [context, animated]);

    useMultiPlayer(context.multiPlayer);

    useEffect(
        () => autorun(function saveGameStateAutorun() {
            profiler.trace();

            if (!context.isReadonlyContext) {
                saveGameState(context);
            }
        }),
        [context]
    );

    const disposers = useMemo(() => {
        return context.puzzle.typeManager.getReactions?.(context) ?? [];
    }, [context]);
    useEffect(() => {
        return () => {
            for (const disposer of disposers) {
                disposer();
            }
        };
    }, [disposers]);

    timer.stop();

    return context;
};
