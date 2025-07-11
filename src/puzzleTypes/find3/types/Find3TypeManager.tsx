import { PuzzleTypeManager } from "../../../types/puzzle/PuzzleTypeManager";
import { DigitPuzzleTypeManager } from "../../default/types/DigitPuzzleTypeManager";
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
import { IReactionDisposer, reaction } from "mobx";
import { indexes } from "../../../utils/indexes";
import { Gift } from "@emotion-icons/fluentui-system-filled";
import { Modal } from "../../../components/layout/modal/Modal";
import { arrayContainsPosition, Position } from "../../../types/layout/Position";
import { cancelOutsideClickProps } from "../../../utils/gestures";
import { gridFireworksController } from "../../../components/puzzle/grid/GridFireworks";
import { gridStateHistoryAddState } from "../../../types/puzzle/GridStateHistory";
import { myClientId } from "../../../hooks/useMultiPlayer";
import { getNextActionId } from "../../../types/puzzle/GameStateAction";
import { CellsMap } from "../../../types/puzzle/CellsMap";
import { addGridStateExToPuzzleTypeManager } from "../../../types/puzzle/PuzzleTypeManagerPlugin";
import { translate } from "../../../utils/translate";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";

export const Find3TypeManager = <T extends AnyFind3PTM>(
    baseTypeManager: PuzzleTypeManager<any> = DigitPuzzleTypeManager(),
    giftsInSight = false,
): PuzzleTypeManager<T> => ({
    ...addGridStateExToPuzzleTypeManager(baseTypeManager, {
        initialGridStateExtension: {
            giftedCells: [],
        },
    }),

    getAboveRules: function Find3AboveRules(context, isPortrait) {
        // Cell to use as a gift - a confirmation popup will be shown when it's set
        const [confirmationCell, setConfirmationCell] = useState<Position | undefined>(undefined);
        const [showExplanation, setShowExplanation] = useState(false);

        const {
            puzzle: {
                gridSize: { rowsCount, columnsCount },
                typeManager: { getDigitByCellData },
            },
            cellSizeForSidePanel: cellSize,
        } = context;

        const giftsCount = getGiftsCount(context);

        if (!giftsCount) {
            return null;
        }

        return (
            <>
                {baseTypeManager.getAboveRules?.(context, isPortrait)}

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
                            {translate({
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
                            {translate({
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
                                        gridStateHistory: gridStateHistoryAddState(
                                            prev,
                                            myClientId,
                                            getNextActionId(),
                                            (prevState) => ({
                                                ...prevState,
                                                extension: {
                                                    ...prevState.extension,
                                                    giftedCells: [...prevState.extension.giftedCells, confirmationCell],
                                                },
                                            }),
                                        ),
                                    }));

                                    setConfirmationCell(undefined);
                                }}
                                style={{ padding: "0.5em 1em" }}
                            >
                                {translate("Yes")}
                            </Button>

                            <Button
                                type={"button"}
                                cellSize={cellSize}
                                onClick={() => setConfirmationCell(undefined)}
                                autoFocus={true}
                                style={{ padding: "0.5em 1em" }}
                            >
                                {translate("No")}
                            </Button>
                        </div>
                    </Modal>
                )}
            </>
        );
    },

    getReactions(context): IReactionDisposer[] {
        return [
            reaction(
                () => getThreesCount(context),
                (threesCount, prevThreesCount) => {
                    if (threesCount > prevThreesCount) {
                        gridFireworksController.launch();
                    }
                },
            ),
        ];
    },

    getInitialDigits(context) {
        const result: CellsMap<T["cell"]> = {};

        const {
            puzzle: {
                solution,
                typeManager: { createCellDataByTypedDigit, getDigitByCellData },
            },
            currentGridState: {
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

const getThreesCount = <T extends AnyFind3PTM>(context: PuzzleContext<T>) =>
    context.getComputedValue("threesCount", () => {
        const {
            puzzle: {
                gridSize: { rowsCount, columnsCount },
                solution,
            },
        } = context;

        return indexes(rowsCount)
            .flatMap((top) => indexes(columnsCount).map((left) => ({ top, left })))
            .filter(({ top, left }) => solution?.[top]?.[left] === 3 && context.getCellDigit(top, left) === 3).length;
    });

const getGiftsCount = <T extends AnyFind3PTM>(context: PuzzleContext<T>) =>
    context.getComputedValue("giftsCount", () => getThreesCount(context) - context.gridExtension.giftedCells.length);
