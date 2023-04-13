import {GameStateAction, GameStateActionType} from "../../../../../types/sudoku/GameStateAction";
import {isSamePosition, Position} from "../../../../../types/layout/Position";
import {CellWriteMode} from "../../../../../types/sudoku/CellWriteMode";
import {QuadInputSudokuTypeManagerOptions} from "./QuadInputSudokuTypeManager";
import {QuadInputState} from "./QuadInputState";
import {PartialGameStateEx} from "../../../../../types/sudoku/GameState";
import {AnyQuadInputPTM} from "./QuadInputPTM";

export const setQuadPositionActionTypeKey = "set-quad-position";

export const setQuadPositionActionType = <T extends AnyQuadInputPTM>(
    {
        isQuadAllowedFn = () => true,
        onQuadFinish,
    }: QuadInputSudokuTypeManagerOptions<T>
): GameStateActionType<Position | undefined, T> => ({
    key: setQuadPositionActionTypeKey,
    callback: (
        position,
        {
            puzzle: {
                params = {},
                fieldSize: {rowsCount, columnsCount},
            },
            state: {currentPlayer, extension: {currentQuad, allQuads}},
            multiPlayer: {isEnabled}
        },
        clientId
    ) => (state): PartialGameStateEx<T> => {
        if (position && !(position.top > 0 && position.top < rowsCount && position.left > 0 && position.left < columnsCount)) {
            return {};
        }

        const isMyTurn = !isEnabled || currentPlayer === clientId || params.share;
        if (!isMyTurn || !isQuadAllowedFn(state) || state.processed.cellWriteMode !== CellWriteMode.quads) {
            return {};
        }

        if (!position) {
            return {
                extension: {currentQuad: undefined} as Partial<T["stateEx"]>
            };
        }

        if (onQuadFinish) {
            return {
                extension: {
                    currentQuad: {
                        position,
                        digits: [] as T["cell"][],
                    },
                } as Partial<T["stateEx"]>,
            };
        }

        if (currentQuad) {
            allQuads = [...allQuads, currentQuad];
        }

        const isSame = ({position: otherPosition}: QuadInputState<T["cell"]>) => isSamePosition(otherPosition, position);
        const sameQuad = allQuads.find(isSame);
        allQuads = allQuads.filter(quad => !isSame(quad));

        return {
            extension: {
                allQuads,
                currentQuad: {
                    position,
                    digits: sameQuad?.digits || [],
                },
            } as Partial<T["stateEx"]>,
        };
    },
});

export const setQuadPositionAction = <T extends AnyQuadInputPTM>(
    position: Position | undefined,
    options: QuadInputSudokuTypeManagerOptions<T>
): GameStateAction<Position | undefined, T> => ({
    type: setQuadPositionActionType(options),
    params: position,
});
