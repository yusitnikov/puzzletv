import {CellBackground} from "./CellBackground";
import {CellDigits, CellDigitsProps} from "./CellDigits";

export interface CellContentProps<CellType, ExType = {}, ProcessedExType = {}>
    extends CellDigitsProps<CellType, ExType, ProcessedExType> {
}

export const CellContent = <CellType, ExType = {}, ProcessedExType = {}>(
    {context, data, size, ...otherProps}: CellContentProps<CellType, ExType, ProcessedExType>
) => <>
    {!!data.colors?.size && <CellBackground context={context} colors={data.colors} size={size}/>}

    <CellDigits context={context} data={data} size={size} {...otherProps}/>
</>;
