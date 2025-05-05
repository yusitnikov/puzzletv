import { AutoSvg } from "../../svg/auto-svg/AutoSvg";
import { indexesFromTo } from "../../../utils/indexes";
import { ReactElement, ReactNode } from "react";
import { PuzzleContextProps } from "../../../types/sudoku/PuzzleContext";
import { AnyPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../utils/profiler";

export interface FieldLoopProps<T extends AnyPTM> extends PuzzleContextProps<T> {
    children: ReactNode | ((topOffset: number, leftOffset: number) => ReactNode);
}

export const FieldLoop = observer(function FieldLoop<T extends AnyPTM>({
    context: { puzzle },
    children,
}: FieldLoopProps<T>) {
    profiler.trace();

    let {
        fieldSize: { fieldSize, rowsCount, columnsCount },
        typeManager: { ignoreRowsColumnCountInTheWrapper },
        loopHorizontally,
        loopVertically,
    } = puzzle;

    if (ignoreRowsColumnCountInTheWrapper) {
        rowsCount = fieldSize;
        columnsCount = fieldSize;
    }

    return (
        <>
            {indexesFromTo(loopVertically ? -1 : 0, loopVertically ? 1 : 0, true).flatMap((topOffset) =>
                indexesFromTo(loopHorizontally ? -1 : 0, loopHorizontally ? 1 : 0, true).map((leftOffset) => (
                    <AutoSvg
                        key={`${topOffset}-${leftOffset}`}
                        left={leftOffset * columnsCount}
                        top={topOffset * rowsCount}
                    >
                        <FieldLoopItem topOffset={topOffset * rowsCount} leftOffset={leftOffset * rowsCount}>
                            {children}
                        </FieldLoopItem>
                    </AutoSvg>
                )),
            )}
        </>
    );
}) as <T extends AnyPTM>(props: FieldLoopProps<T>) => ReactElement;

interface FieldLoopItemProps<T extends AnyPTM> extends Pick<FieldLoopProps<T>, "children"> {
    topOffset: number;
    leftOffset: number;
}

const FieldLoopItem = observer(function FieldLoopItem<T extends AnyPTM>({
    topOffset,
    leftOffset,
    children,
}: FieldLoopItemProps<T>) {
    profiler.trace();

    return <>{typeof children === "function" ? children(topOffset, leftOffset) : children}</>;
}) as <T extends AnyPTM>(props: FieldLoopItemProps<T>) => ReactElement;
