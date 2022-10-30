import {GameStateAction, GameStateActionType} from "../../../../../types/sudoku/GameStateAction";
import {isSamePosition, Position} from "../../../../../types/layout/Position";
import {CellWriteMode} from "../../../../../types/sudoku/CellWriteMode";
import {QuadInputGameState} from "./QuadInputGameState";
import {QuadInputSudokuTypeManagerOptions} from "./QuadInputSudokuTypeManager";
import {QuadInputState} from "./QuadInputState";
import {PartialGameStateEx} from "../../../../../types/sudoku/GameState";

export const setQuadPositionActionTypeKey = "set-quad-position";

export const setQuadPositionActionType = <CellType, ExType extends QuadInputGameState<CellType>, ProcessedExType = {}>(
    {
        isQuadAllowedFn = () => true,
        onQuadFinish,
    }: QuadInputSudokuTypeManagerOptions<CellType, ExType, ProcessedExType>
): GameStateActionType<Position | undefined, CellType, ExType, ProcessedExType> => ({
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
    ) => (state): PartialGameStateEx<CellType, ExType> => {
        if (position && !(position.top > 0 && position.top < rowsCount && position.left > 0 && position.left < columnsCount)) {
            return {};
        }

        const isMyTurn = !isEnabled || currentPlayer === clientId || params.share;
        if (!isMyTurn || !isQuadAllowedFn(state) || state.processed.cellWriteMode !== CellWriteMode.quads) {
            return {};
        }

        if (!position) {
            return {
                extension: {currentQuad: undefined} as Partial<ExType>
            };
        }

        if (onQuadFinish) {
            return {
                extension: {
                    currentQuad: {
                        position,
                        digits: [] as CellType[],
                    },
                } as Partial<ExType>,
            };
        }

        if (currentQuad) {
            allQuads = [...allQuads, currentQuad];
        }

        const isSame = ({position: otherPosition}: QuadInputState<CellType>) => isSamePosition(otherPosition, position);
        const sameQuad = allQuads.find(isSame);
        allQuads = allQuads.filter(quad => !isSame(quad));

        return {
            extension: {
                allQuads,
                currentQuad: {
                    position,
                    digits: sameQuad?.digits || [],
                },
            } as Partial<ExType>,
        };
    },
});

export const setQuadPositionAction = <CellType, ExType extends QuadInputGameState<CellType>, ProcessedExType = {}>(
    position: Position | undefined,
    options: QuadInputSudokuTypeManagerOptions<CellType, ExType, ProcessedExType>
): GameStateAction<Position | undefined, CellType, ExType, ProcessedExType> => ({
    type: setQuadPositionActionType(options),
    params: position,
});
