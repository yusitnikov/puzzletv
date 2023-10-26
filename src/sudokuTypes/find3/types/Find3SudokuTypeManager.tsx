import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {Find3GameState} from "./Find3GameState";
import {DigitSudokuTypeManager} from "../../default/types/DigitSudokuTypeManager";
import {
    aboveRulesTextHeightCoeff,
    rulesMarginCoeff,
    lightRedColor,
    globalPaddingCoeff
} from "../../../components/app/globals";
import {LanguageCode} from "../../../types/translations/LanguageCode";
import {Button} from "../../../components/layout/button/Button";
import React, {useState} from "react";
import {AnyFind3PTM} from "./Find3PTM";
import {getRegionCells, PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {IReactionDisposer, reaction} from "mobx";
import {indexes} from "../../../utils/indexes";
import {mergeGivenDigitsMaps} from "../../../types/sudoku/GivenDigitsMap";
import {Gift} from "@emotion-icons/fluentui-system-filled";
import {Modal} from "../../../components/layout/modal/Modal";
import {arrayContainsPosition, Position} from "../../../types/layout/Position";
import {cancelOutsideClickProps} from "../../../utils/gestures";

export const Find3SudokuTypeManager = <T extends AnyFind3PTM>(
    {initialGameStateExtension, serializeGameState, unserializeGameState, ...baseTypeManager}: SudokuTypeManager<any> = DigitSudokuTypeManager(),
    giftsInSight = false,
): SudokuTypeManager<T> => ({
    ...baseTypeManager,

    initialGameStateExtension: (puzzle) => ({
        ...(
            typeof initialGameStateExtension === "function"
                ? (initialGameStateExtension as ((puzzle: PuzzleDefinition<T>) => T["stateEx"]))(puzzle)
                : initialGameStateExtension
        ),
        giftsCount: 0,
    }),
    serializeGameState({giftsCount, ...other}): any {
        return {giftsCount, ...serializeGameState(other)};
    },
    unserializeGameState({giftsCount = 0, ...other}: any): Partial<Find3GameState> {
        return {giftsCount, ...unserializeGameState(other)};
    },

    getAboveRules: function Find3AboveRules(translate, context, isPortrait) {
        // Cell to use as a gift - a confirmation popup will be shown when it's set
        const [confirmationCell, setConfirmationCell] = useState<Position | undefined>(undefined);
        const [showExplanation, setShowExplanation] = useState(false);

        const {
            puzzle: {
                fieldSize: {rowsCount, columnsCount},
                typeManager: {createCellDataByTypedDigit, getDigitByCellData},
                solution,
                regions = [],
            },
            cellSizeForSidePanel: cellSize,
            stateExtension: {giftsCount},
        } = context;

        if (!giftsCount) {
            return null;
        }

        return <>
            {baseTypeManager.getAboveRules?.(translate, context, isPortrait)}

            <div style={{
                marginBottom: cellSize * rulesMarginCoeff,
                fontSize: cellSize * aboveRulesTextHeightCoeff * 2,
                lineHeight: "1em",
                display: "flex",
                justifyContent: "center",
                gap: "0.1em",
            }}>
                {indexes(giftsCount).map((index) => <a
                    key={index}
                    href={"#"}
                    {...cancelOutsideClickProps}
                    onClick={(ev) => {
                        ev.preventDefault();

                        const {
                            selectedCells,
                            stateInitialDigits,
                        } = context;

                        if (selectedCells.size !== 1) {
                            setShowExplanation(true);
                            return;
                        }

                        const selectedCell = selectedCells.first()!;
                        if (stateInitialDigits[selectedCell.top]?.[selectedCell.left] !== undefined) {
                            setShowExplanation(true);
                            return;
                        }

                        if (giftsInSight) {
                            const selectedCellRegion = regions
                                .map(getRegionCells)
                                .find((cells) => arrayContainsPosition(cells, selectedCell))
                                ?? [];

                            const sees3 = indexes(rowsCount).some((top) => indexes(columnsCount).some((left) => {
                                if (top !== selectedCell.top && left !== selectedCell.left && !arrayContainsPosition(selectedCellRegion, {top, left})) {
                                    return false;
                                }

                                const data = stateInitialDigits[top]?.[left];

                                return data !== undefined && getDigitByCellData(data, context, {top, left}) === 3;
                            }));

                            if (!sees3) {
                                setShowExplanation(true);
                                return;
                            }
                        }

                        setConfirmationCell(selectedCell);
                    }}
                    style={{color: lightRedColor}}
                >
                    <Gift size={"1em"}/>
                </a>)}
            </div>

            {showExplanation && <Modal cellSize={cellSize} onClose={() => setShowExplanation(false)}>
                <div>{context.translate({
                    [LanguageCode.en]: "Please select one empty cell" + (giftsInSight ? " in sight of a 3" : "") + " to reveal the digit in it",
                    [LanguageCode.ru]: "Пожалуйста, выберите одну пустую ячейку" + (giftsInSight ? " в зоне видимости тройки" : "") + ", чтобы показать цифру в ней",
                    [LanguageCode.de]: "Bitte wählen Sie eine leere Zelle" + (giftsInSight ? " in Sichtweite einer 3" : "") + " aus, um die darin enthaltene Ziffer anzuzeigen",
                })}!</div>

                <Button
                    type={"button"}
                    cellSize={cellSize}
                    onClick={() => setShowExplanation(false)}
                    autoFocus={true}
                    style={{
                        marginTop: cellSize * globalPaddingCoeff,
                        padding: "0.5em 1em",
                    }}
                >
                    OK
                </Button>
            </Modal>}

            {confirmationCell && <Modal cellSize={cellSize} onClose={() => setConfirmationCell(undefined)}>
                <div>{context.translate({
                    [LanguageCode.en]: "Are you sure that you want to use the gift for this cell",
                    [LanguageCode.ru]: "Пожалуйста, выберите одну пустую ячейку, чтобы показать цифру в ней",
                    [LanguageCode.de]: "Bitte wählen Sie eine leere Zelle aus, um die darin enthaltene Ziffer anzuzeigen",
                })}?</div>

                <div style={{
                    marginTop: cellSize * globalPaddingCoeff,
                    display: "flex",
                    justifyContent: "center",
                    gap: cellSize * globalPaddingCoeff,
                }}>
                    <Button
                        type={"button"}
                        cellSize={cellSize}
                        onClick={() => {
                            const digit = Number(solution![confirmationCell.top][confirmationCell.left]);
                            const data = createCellDataByTypedDigit(digit, context, confirmationCell);

                            context.onStateChange((prev) => ({
                                initialDigits: mergeGivenDigitsMaps(
                                    prev.stateInitialDigits,
                                    {[confirmationCell.top]: {[confirmationCell.left]: data}}
                                ),
                                extension: {giftsCount: prev.stateExtension.giftsCount - 1},
                            }));

                            setConfirmationCell(undefined);
                        }}
                        style={{padding: "0.5em 1em"}}
                    >
                        {context.translate("Yes")}
                    </Button>

                    <Button
                        type={"button"}
                        cellSize={cellSize}
                        onClick={() => setConfirmationCell(undefined)}
                        autoFocus={true}
                        style={{padding: "0.5em 1em"}}
                    >
                        {context.translate("No")}
                    </Button>
                </div>
            </Modal>}
        </>;
    },

    getReactions(context): IReactionDisposer[] {
        const {
            puzzle: {
                typeManager: {createCellDataByTypedDigit},
                fieldSize: {rowsCount, columnsCount},
                solution,
            },
        } = context;

        return indexes(rowsCount)
            .flatMap((top) => indexes(columnsCount).map((left) => ({top, left})))
            .filter(({top, left}) => solution?.[top]?.[left] === 3)
            .map(({top, left}) => reaction(
                () => context.getCellDigit(top, left) === 3 && !context.stateInitialDigits[top]?.[left],
                (is3) => {
                    if (is3) {
                        context.onStateChange((prev) => ({
                            initialDigits: mergeGivenDigitsMaps(
                                prev.stateInitialDigits,
                                {[top]: {[left]: createCellDataByTypedDigit(3, prev, {top, left})}}
                            ),
                            extension: {giftsCount: prev.stateExtension.giftsCount + 1},
                        }));
                    }
                },
            ));
    }
});
