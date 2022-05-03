import {CellBackground} from "./CellBackground";
import {CellDigits, CellDigitsProps} from "./CellDigits";

export interface CellContentProps<CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>
    extends CellDigitsProps<CellType, GameStateExtensionType, ProcessedGameStateExtensionType> {
}

export const CellContent = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    {data, size, ...otherProps}: CellContentProps<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
) => <>
    {!!data.colors?.size && <CellBackground colors={data.colors} size={size}/>}

    <CellDigits data={data} size={size} {...otherProps}/>
</>;
