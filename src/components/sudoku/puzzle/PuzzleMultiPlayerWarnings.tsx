import { useTranslate } from "../../../hooks/useTranslate";
import { Modal } from "../../layout/modal/Modal";
import { AnyPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { PuzzleContext } from "../../../types/sudoku/PuzzleContext";
import { observer } from "mobx-react-lite";
import { ReactElement } from "react";
import { profiler } from "../../../utils/profiler";

export interface PuzzleMultiPlayerWarningsProps<T extends AnyPTM> {
    context: PuzzleContext<T>;
}

export const PuzzleMultiPlayerWarnings = observer(function PuzzleMultiPlayerWarning<T extends AnyPTM>({
    context,
}: PuzzleMultiPlayerWarningsProps<T>) {
    profiler.trace();

    const translate = useTranslate();

    const {
        cellSizeForSidePanel,
        multiPlayer: { isEnabled, isLoaded, isDoubledConnected, hostData },
    } = context;

    if (!isEnabled) {
        return null;
    }

    return (
        <>
            {!isLoaded && (
                <Modal cellSize={cellSizeForSidePanel}>
                    <div>{translate("Loading")}...</div>
                </Modal>
            )}

            {isLoaded && (
                <>
                    {isDoubledConnected && (
                        <Modal cellSize={cellSizeForSidePanel}>
                            <div>{translate("You opened this puzzle in more than one tab")}!</div>
                            <div>{translate("Please leave only one active tab")}.</div>
                        </Modal>
                    )}

                    {!hostData && (
                        <Modal cellSize={cellSizeForSidePanel}>
                            <div>{translate("The host of the game is not connected")}!</div>
                            <div>{translate("Please wait for them to join")}.</div>
                        </Modal>
                    )}
                </>
            )}
        </>
    );
}) as <T extends AnyPTM>(props: PuzzleMultiPlayerWarningsProps<T>) => ReactElement;
