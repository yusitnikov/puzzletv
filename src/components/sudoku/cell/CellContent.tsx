import {CellBackground} from "./CellBackground";
import {CellDigits, CellDigitsProps} from "./CellDigits";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";

export interface CellContentProps<T extends AnyPTM> extends CellDigitsProps<T> {
}

export const CellContent = <T extends AnyPTM>({context, data, size, ...otherProps}: CellContentProps<T>) => <>
    {!!data.colors?.size && <CellBackground context={context} colors={data.colors} size={size}/>}

    <CellDigits context={context} data={data} size={size} {...otherProps}/>
</>;
