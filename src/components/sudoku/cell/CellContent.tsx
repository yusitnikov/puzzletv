import { CellBackground } from "./CellBackground";
import { CellDigits, CellDigitsProps } from "./CellDigits";
import { AnyPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { profiler } from "../../../utils/profiler";
import { observer } from "mobx-react-lite";
import { ReactElement } from "react";

export const CellContent = observer(function CellContentFc<T extends AnyPTM>({
    context,
    data,
    size,
    ...otherProps
}: CellDigitsProps<T>) {
    profiler.trace();

    return (
        <>
            {!!data.colors?.size && (
                <CellBackground context={context} colors={data.colors.sorted().items} size={size} />
            )}

            <CellDigits context={context} data={data} size={size} {...otherProps} />
        </>
    );
}) as <T extends AnyPTM>(props: CellDigitsProps<T>) => ReactElement;
