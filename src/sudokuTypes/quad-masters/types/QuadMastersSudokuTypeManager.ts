import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {GivenDigitsMap} from "../../../types/sudoku/GivenDigitsMap";
import {GuessSudokuTypeManager} from "../../guess/types/GuessSudokuTypeManager";
import {
    initialQuadMastersGameState,
    QuadMastersGameState,
    serializeQuadMastersGameState,
    unserializeQuadMastersGameState
} from "./QuadMastersGameState";
import {CellWriteMode} from "../../../types/sudoku/CellWriteMode";
import {Set} from "../../../types/struct/Set";
import {QuadMastersControls} from "../components/QuadMastersControls";
import {ProcessedGameState} from "../../../types/sudoku/GameState";
import {QuadConstraint, QuadConstraintBySolution} from "../../../components/sudoku/constraints/quad/Quad";
import {Position} from "../../../types/layout/Position";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";

const onCornerClick = ({onStateChange}: PuzzleContext<number, QuadMastersGameState, QuadMastersGameState>, position: Position) => onStateChange(
    ({isQuadTurn}) => isQuadTurn ? {currentQuad: {position, digits: new Set()}} : {}
);

export const QuadMastersSudokuTypeManager = (solution: GivenDigitsMap<number>): SudokuTypeManager<number, QuadMastersGameState, QuadMastersGameState> => {
    const parent = GuessSudokuTypeManager<QuadMastersGameState, QuadMastersGameState>(
        solution,
        serializeQuadMastersGameState,
        unserializeQuadMastersGameState
    );

    return ({
        ...parent,

        initialGameStateExtension: initialQuadMastersGameState,

        extraCellWriteModes: [
            {
                mode: CellWriteMode.custom,
                isDigitMode: true,
                isNoSelectionMode: true,
                onCornerClick,
                onCornerEnter: onCornerClick,
            },
        ],

        initialCellWriteMode: CellWriteMode.custom,

        mainControlsComponent: QuadMastersControls,

        items: (context) => {
            const {state: {allQuads, currentQuad}} = context;

            return [
                ...allQuads.map(({position, digits}) => QuadConstraintBySolution(context, position, digits.items, solution)),
                currentQuad && QuadConstraint(currentQuad.position, currentQuad.digits.items),
            ].filter(item => item).map(item => item!);
        },

        handleDigitGlobally(
            {state},
            cellData,
            defaultResult
        ): Partial<ProcessedGameState<number> & QuadMastersGameState> {
            const {
                cellWriteMode,
                selectedCells,
                isQuadTurn,
                currentQuad,
                allQuads,
            } = state;

            const newState = {...state, ...defaultResult};

            switch (cellWriteMode) {
                case CellWriteMode.custom:
                    if (isQuadTurn && currentQuad) {
                        const newDigits = currentQuad.digits.toggle(cellData);
                        const newQuad = {
                            ...currentQuad,
                            digits: newDigits,
                        };

                        if (newDigits.size < 4) {
                            return {currentQuad: newQuad};
                        } else {
                            return {
                                isQuadTurn: false,
                                currentQuad: undefined,
                                allQuads: [...allQuads, newQuad],
                                persistentCellWriteMode: CellWriteMode.main,
                            }
                        }
                    }
                    break;
                case CellWriteMode.main:
                    if (selectedCells.size && selectedCells.items.some(({top, left}) => !newState.initialDigits?.[top]?.[left])) {
                        return {
                            ...defaultResult,
                            isQuadTurn: true,
                            currentQuad: undefined,
                            persistentCellWriteMode: CellWriteMode.custom,
                        };
                    }

                    break;
            }

            return defaultResult;
        },
    });
};
