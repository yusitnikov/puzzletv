import {CellBackground} from "./CellBackground";
import {CellDigits, CellDigitsProps} from "./CellDigits";

export interface CellContentProps<CellType> extends CellDigitsProps<CellType> {
}

export const CellContent = <CellType,>({data, size, ...otherProps}: CellContentProps<CellType>) => <>
    {data.colors && <CellBackground colors={data.colors} size={size}/>}

    <CellDigits data={data} size={size} {...otherProps}/>
</>;
