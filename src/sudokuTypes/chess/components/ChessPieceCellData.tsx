import {CellDataProps, getDefaultCellDataColor} from "../../../components/sudoku/cell/CellDataProps";
import {CellDataComponentType} from "../../../components/sudoku/cell/CellDataComponentType";
import {ChessPTM} from "../types/ChessPTM";
import {profiler} from "../../../utils/profiler";
import {observer} from "mobx-react-lite";
import {ChessPiece} from "./ChessPiece";

export const ChessPieceCellData = observer(function ChessPieceCellData(props: CellDataProps<ChessPTM>) {
    profiler.trace();

    const {data: {type, color}, size, left = 0, top = 0} = props;

    return <ChessPiece
        top={top}
        left={left}
        type={type}
        pieceColor={color}
        size={size * 1.2}
        fontColor={getDefaultCellDataColor(props)}
    />;
});

export const ChessPieceCellDataComponentType: CellDataComponentType<ChessPTM> = {
    component: ChessPieceCellData,
    widthCoeff: 0.7,
};
