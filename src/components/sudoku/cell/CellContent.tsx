import {CellState} from "../../../types/sudoku/CellState";
import {CellBackground} from "./CellBackground";
import {CellDigits} from "./CellDigits";

export interface CellContentProps {
    data: Partial<CellState>;
    size: number;
    sudokuAngle?: number;
    mainColor?: boolean;
}

export const CellContent = ({data, size, sudokuAngle = 0, mainColor}: CellContentProps) => {
    return <>
        {data.colors && <CellBackground colors={data.colors} size={size}/>}

        <CellDigits data={data} size={size} sudokuAngle={sudokuAngle} mainColor={mainColor}/>
    </>;
};
