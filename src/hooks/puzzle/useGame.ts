import { useEffect, useMemo, useState } from "react";
import { getEmptyGameState, saveGameState } from "../../types/puzzle/GameState";
import { PuzzleDefinition } from "../../types/puzzle/PuzzleDefinition";
import { useMultiPlayer } from "../useMultiPlayer";
import { PuzzleContext } from "../../types/puzzle/PuzzleContext";
import { AnyPTM } from "../../types/puzzle/PuzzleTypeMap";
import { profiler } from "../../utils/profiler";
import { autorun } from "mobx";

export const useGame = <T extends AnyPTM>(
    puzzle: PuzzleDefinition<T>,
    cellSize: number,
    cellSizeForSidePanel: number,
    isReadonlyContext = false,
): PuzzleContext<T> => {
    const timer = profiler.track("useGame");

    const [context] = useState(
        () =>
            new PuzzleContext({
                puzzle,
                myGameState: (context) => getEmptyGameState(context, true, isReadonlyContext),
                cellSize,
                cellSizeForSidePanel,
                isReadonlyContext,
                applyKeys: true,
                applyPendingMessages: true,
            }),
    );
    useEffect(() => context.update({ puzzle }), [context, puzzle]);
    useEffect(() => context.update({ cellSize }), [context, cellSize]);
    useEffect(() => context.update({ cellSizeForSidePanel }), [context, cellSizeForSidePanel]);
    useEffect(() => context.update({ isReadonlyContext }), [context, isReadonlyContext]);

    useMultiPlayer(context.multiPlayer);

    useEffect(
        () =>
            autorun(function saveGameStateAutorun() {
                profiler.trace();

                if (!context.isReadonlyContext) {
                    saveGameState(context);
                }
            }),
        [context],
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

    useEffect(() => {
        return () => {
            context.dispose();
        };
    }, [context]);

    timer.stop();

    return context;
};
