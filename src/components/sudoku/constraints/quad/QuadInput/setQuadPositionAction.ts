import {GameStateAction, GameStateActionType} from "../../../../../types/sudoku/GameStateAction";
import {isSamePosition, Position} from "../../../../../types/layout/Position";
import {CellWriteMode} from "../../../../../types/sudoku/CellWriteMode";
import {QuadInputGameState} from "./QuadInputGameState";
import {QuadInputSudokuTypeManagerOptions} from "./QuadInputSudokuTypeManager";
import {QuadInputState} from "./QuadInputState";

export const setQuadPositionActionTypeKey = "set-quad-position";

export const setQuadPositionActionType = <CellType, GameStateExtensionType extends QuadInputGameState<CellType>, ProcessedGameStateExtensionType extends QuadInputGameState<CellType>>(
    {
        isQuadAllowedFn = () => true,
        onQuadFinish,
    }: QuadInputSudokuTypeManagerOptions<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
): GameStateActionType<Position | undefined, CellType, GameStateExtensionType, ProcessedGameStateExtensionType> => ({
    key: setQuadPositionActionTypeKey,
    callback: (
        position,
        {
            puzzle: {
                params = {},
                fieldSize: {rowsCount, columnsCount},
            },
            state: {currentPlayer, currentQuad, allQuads},
            multiPlayer: {isEnabled}
        },
        clientId
    ) => (state) => {
        if (position && !(position.top > 0 && position.top < rowsCount && position.left > 0 && position.left < columnsCount)) {
            return {};
        }

        const isMyTurn = !isEnabled || currentPlayer === clientId || params.share;
        if (!isMyTurn || !isQuadAllowedFn(state) || state.cellWriteMode !== CellWriteMode.quads) {
            return {};
        }

        if (!position) {
            return {currentQuad: undefined} as Partial<GameStateExtensionType>;
        }

        if (onQuadFinish) {
            return {
                currentQuad: {position, digits: []},
            } as Partial<QuadInputGameState<CellType>> as any;
        }

        if (currentQuad) {
            allQuads = [...allQuads, currentQuad];
        }

        const isSame = ({position: otherPosition}: QuadInputState<CellType>) => isSamePosition(otherPosition, position);
        const sameQuad = allQuads.find(isSame);
        allQuads = allQuads.filter(quad => !isSame(quad));

        return {
            allQuads,
            currentQuad: {
                position,
                digits: sameQuad?.digits || [],
            },
        } as Partial<QuadInputGameState<CellType>> as any;
    },
});

export const setQuadPositionAction = <CellType, GameStateExtensionType extends QuadInputGameState<CellType>, ProcessedGameStateExtensionType extends QuadInputGameState<CellType>>(
    position: Position | undefined,
    options: QuadInputSudokuTypeManagerOptions<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
): GameStateAction<Position | undefined, CellType, GameStateExtensionType, ProcessedGameStateExtensionType> => ({
    type: setQuadPositionActionType(options),
    params: position,
});
