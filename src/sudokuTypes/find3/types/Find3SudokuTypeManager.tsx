import { SudokuTypeManager } from "../../../types/sudoku/SudokuTypeManager";
import { DigitSudokuTypeManager } from "../../default/types/DigitSudokuTypeManager";
import {
    aboveRulesTextHeightCoeff,
    rulesMarginCoeff,
    lightRedColor,
    globalPaddingCoeff,
} from "../../../components/app/globals";
import { LanguageCode } from "../../../types/translations/LanguageCode";
import { Button } from "../../../components/layout/button/Button";
import React, { useState } from "react";
import { AnyFind3PTM } from "./Find3PTM";
import { computed, IReactionDisposer, reaction } from "mobx";
import { indexes } from "../../../utils/indexes";
import { Gift } from "@emotion-icons/fluentui-system-filled";
import { Modal } from "../../../components/layout/modal/Modal";
import { arrayContainsPosition, Position } from "../../../types/layout/Position";
import { cancelOutsideClickProps } from "../../../utils/gestures";
import { fieldFireworksController } from "../../../components/sudoku/field/FieldFireworks";
import { fieldStateHistoryAddState } from "../../../types/sudoku/FieldStateHistory";
import { myClientId } from "../../../hooks/useMultiPlayer";
import { getNextActionId } from "../../../types/sudoku/GameStateAction";
import { GivenDigitsMap } from "../../../types/sudoku/GivenDigitsMap";
import { addFieldStateExToSudokuManager } from "../../../types/sudoku/SudokuTypeManagerPlugin";

export const Find3SudokuTypeManager = <T extends AnyFind3PTM>(
    baseTypeManager: SudokuTypeManager<any> = DigitSudokuTypeManager(),
    giftsInSight = false,
): SudokuTypeManager<T> => ({
    ...addFieldStateExToSudokuManager(baseTypeManager, {
        initialFieldStateExtension: {
            giftsCount: 0,
            giftedCells: [],
        },
    }),

    getAboveRules: function Find3AboveRules(translate, context, isPortrait) {
        // Cell to use as a gift - a confirmation popup will be shown when it's set
        const [confirmationCell, setConfirmationCell] = useState<Position | undefined>(undefined);
        const [showExplanation, setShowExplanation] = useState(false);

        const {
            puzzle: {
                fieldSize: { rowsCount, columnsCount },
                typeManager: { getDigitByCellData },
            },
            cellSizeForSidePanel: cellSize,
            currentFieldState: {
                extension: { giftsCount },
            },
        } = context;

        if (!giftsCount) {
            return null;
        }

        return (
            <>
                {baseTypeManager.getAboveRules?.(translate, context, isPortrait)}

                <div
                    style={{
                        marginBottom: cellSize * rulesMarginCoeff,
                        fontSize: cellSize * aboveRulesTextHeightCoeff * 2,
                        lineHeight: "1em",
                        display: "flex",
                        justifyContent: "center",
                        gap: "0.1em",
                    }}
                >
                    {indexes(giftsCount).map((index) => (
                        // eslint-disable-next-line jsx-a11y/anchor-is-valid
                        <a
                            key={index}
                            href={"#"}
                            {...cancelOutsideClickProps}
                            onClick={(ev) => {
                                ev.preventDefault();

                                const { selectedCells, allInitialDigits } = context;

                                if (selectedCells.size !== 1) {
                                    setShowExplanation(true);
                                    return;
                                }

                                const selectedCell = selectedCells.first()!;
                                if (allInitialDigits[selectedCell.top]?.[selectedCell.left] !== undefined) {
                                    setShowExplanation(true);
                                    return;
                                }

                                if (giftsInSight) {
                                    const selectedCellRegion = context.getRegionByCell(
                                        selectedCell.top,
                                        selectedCell.left,
                                    )?.cells;

                                    const sees3 = indexes(rowsCount).some((top) =>
                                        indexes(columnsCount).some((left) => {
                                            if (
                                                top !== selectedCell.top &&
                                                left !== selectedCell.left &&
                                                !arrayContainsPosition(selectedCellRegion, { top, left })
                                            ) {
                                                return false;
                                            }

                                            const data = allInitialDigits[top]?.[left];

                                            return (
                                                data !== undefined &&
                                                getDigitByCellData(data, context, { top, left }) === 3
                                            );
                                        }),
                                    );

                                    if (!sees3) {
                                        setShowExplanation(true);
                                        return;
                                    }
                                }

                                setConfirmationCell(selectedCell);
                            }}
                            style={{ color: lightRedColor }}
                        >
                            <Gift size={"1em"} />
                        </a>
                    ))}
                </div>

                {showExplanation && (
                    <Modal cellSize={cellSize} onClose={() => setShowExplanation(false)}>
                        <div>
                            {context.translate({
                                [LanguageCode.en]:
                                    "Please select one empty cell" +
                                    (giftsInSight ? " in sight of a 3" : "") +
                                    " to reveal the digit in it",
                                [LanguageCode.ru]:
                                    "Пожалуйста, выберите одну пустую ячейку" +
                                    (giftsInSight ? " в зоне видимости тройки" : "") +
                                    ", чтобы показать цифру в ней",
                                [LanguageCode.de]:
                                    "Bitte wählen Sie eine leere Zelle" +
                                    (giftsInSight ? " in Sichtweite einer 3" : "") +
                                    " aus, um die darin enthaltene Ziffer anzuzeigen",
                            })}
                            !
                        </div>

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
                    </Modal>
                )}

                {confirmationCell && (
                    <Modal cellSize={cellSize} onClose={() => setConfirmationCell(undefined)}>
                        <div>
                            {context.translate({
                                [LanguageCode.en]: "Are you sure that you want to use the gift for this cell",
                                [LanguageCode.ru]:
                                    "Пожалуйста, выберите одну пустую ячейку, чтобы показать цифру в ней",
                                [LanguageCode.de]:
                                    "Bitte wählen Sie eine leere Zelle aus, um die darin enthaltene Ziffer anzuzeigen",
                            })}
                            ?
                        </div>

                        <div
                            style={{
                                marginTop: cellSize * globalPaddingCoeff,
                                display: "flex",
                                justifyContent: "center",
                                gap: cellSize * globalPaddingCoeff,
                            }}
                        >
                            <Button
                                type={"button"}
                                cellSize={cellSize}
                                onClick={() => {
                                    context.onStateChange((prev) => ({
                                        fieldStateHistory: fieldStateHistoryAddState(
                                            prev,
                                            myClientId,
                                            getNextActionId(),
                                            (prevState) => ({
                                                ...prevState,
                                                extension: {
                                                    ...prevState.extension,
                                                    giftsCount: prevState.extension.giftsCount - 1,
                                                    giftedCells: [...prevState.extension.giftedCells, confirmationCell],
                                                },
                                            }),
                                        ),
                                    }));

                                    setConfirmationCell(undefined);
                                }}
                                style={{ padding: "0.5em 1em" }}
                            >
                                {context.translate("Yes")}
                            </Button>

                            <Button
                                type={"button"}
                                cellSize={cellSize}
                                onClick={() => setConfirmationCell(undefined)}
                                autoFocus={true}
                                style={{ padding: "0.5em 1em" }}
                            >
                                {context.translate("No")}
                            </Button>
                        </div>
                    </Modal>
                )}
            </>
        );
    },

    getReactions(context): IReactionDisposer[] {
        const {
            puzzle: {
                fieldSize: { rowsCount, columnsCount },
                solution,
            },
        } = context;

        const getThreesCount = computed(
            () =>
                indexes(rowsCount)
                    .flatMap((top) => indexes(columnsCount).map((left) => ({ top, left })))
                    .filter((cell) => {
                        const { top, left } = cell;
                        const data = context.getCellDigit(top, left);
                        return (
                            solution?.[top]?.[left] === 3 &&
                            data !== undefined &&
                            context.puzzle.typeManager.getDigitByCellData(data, context, cell) === 3
                        );
                    }).length,
        );

        return [
            reaction(
                () => getThreesCount.get() - context.currentFieldState.extension.giftedCells.length,
                (giftsCount) => {
                    if (context.currentFieldState.extension.giftsCount !== giftsCount) {
                        context.onStateChange((prev) => ({
                            fieldStateHistory: fieldStateHistoryAddState(
                                prev,
                                prev.currentFieldState.clientId,
                                prev.currentFieldState.actionId,
                                (prevState) => ({
                                    ...prevState,
                                    extension: {
                                        ...prevState.extension,
                                        giftsCount,
                                    },
                                }),
                            ),
                        }));
                    }
                },
            ),
            reaction(
                () => getThreesCount.get(),
                (threesCount, prevThreesCount) => {
                    if (threesCount > prevThreesCount) {
                        fieldFireworksController.launch();
                    }
                },
            ),
        ];
    },

    getInitialDigits(context) {
        const result: GivenDigitsMap<T["cell"]> = {};

        const {
            puzzle: {
                solution,
                typeManager: { createCellDataByTypedDigit, getDigitByCellData },
            },
            currentFieldState: {
                cells,
                extension: { giftedCells },
            },
        } = context;

        for (const cell of giftedCells) {
            const { top, left } = cell;
            result[top] ??= {};
            result[top][left] = createCellDataByTypedDigit(Number(solution![top][left]), context, cell);
        }

        for (const [top, row] of cells.entries()) {
            for (const [left, { usersDigit }] of row.entries()) {
                if (
                    Number(solution![top][left]) === 3 &&
                    usersDigit !== undefined &&
                    getDigitByCellData(usersDigit, context, { top, left }) === 3
                ) {
                    result[top] ??= {};
                    result[top][left] = usersDigit;
                }
            }
        }

        return result;
    },

    saveStateKeySuffix: "v2",
});
