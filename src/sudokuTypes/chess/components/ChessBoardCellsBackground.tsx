import {indexes} from "../../../utils/indexes";
import {lightGreyColor} from "../../../components/app/globals";
import {FieldLayer} from "../../../types/sudoku/FieldLayer";
import {Constraint} from "../../../types/sudoku/Constraint";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";
import {observer} from "mobx-react-lite";
import {profiler} from "../../../utils/profiler";

export const ChessBoardCellsBackground = {
    [FieldLayer.beforeBackground]: observer(function ChessBoardCellsBackground() {
        profiler.trace();

        return <>
            {indexes(8).flatMap(
                x => indexes(8).map(
                    y => {
                        const isBlackSquare = (x + y) % 2;
                        const color = isBlackSquare ? lightGreyColor : undefined;

                        return color && <rect
                            key={`${x}-${y}`}
                            x={x}
                            y={y}
                            width={1}
                            height={1}
                            fill={color}
                        />;
                    }
                )
            )}
        </>;
    }),
};

export const ChessBoardCellsBackgroundConstraint = <T extends AnyPTM>(): Constraint<T> => ({
    name: "chess board cells background",
    cells: [],
    component: ChessBoardCellsBackground,
    props: undefined,
});
