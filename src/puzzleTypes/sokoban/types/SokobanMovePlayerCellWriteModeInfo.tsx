import { CellWriteModeInfo } from "../../../types/puzzle/CellWriteModeInfo";
import { SokobanPTM } from "./SokobanPTM";
import { MoveCellWriteModeInfo } from "../../../types/puzzle/cellWriteModes/move";
import { LanguageCode } from "../../../types/translations/LanguageCode";
import { ControlButtonItemProps } from "../../../components/puzzle/controls/ControlButtonsManager";
import { CellWriteModeButton } from "../../../components/puzzle/controls/CellWriteModeButton";
import { AutoSvg } from "../../../components/svg/auto-svg/AutoSvg";
import { SokobanPlayerByData } from "../constraints/SokobanPlayer";
import { ControlButton, controlButtonPaddingCoeff } from "../../../components/puzzle/controls/ControlButton";
import { ArrowLeft, ArrowRight, ArrowDown, ArrowUp } from "@emotion-icons/fluentui-system-filled";
import { gridStateHistoryAddState } from "../../../types/puzzle/GridStateHistory";
import { myClientId } from "../../../hooks/useMultiPlayer";
import { GameStateActionCallback, getNextActionId } from "../../../types/puzzle/GameStateAction";
import { CellsMap } from "../../../types/puzzle/CellsMap";
import { Absolute } from "../../../components/layout/absolute/Absolute";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../utils/profiler";
import { SokobanClue } from "./SokobanPuzzleExtension";
import { Position } from "../../../types/layout/Position";
import { translate } from "../../../utils/translate";

const base = MoveCellWriteModeInfo<SokobanPTM>();

export const moveSokobanPlayer =
    (xDirection: number, yDirection: number): GameStateActionCallback<SokobanPTM> =>
    (context) => {
        const {
            puzzleIndex: { allCells },
            puzzle,
        } = context;
        const { isLightClue, isSmashableClue, isFallingClue } = puzzle.extension.options ?? {};
        const clues = puzzle.extension.clues ?? [];

        return {
            extension: {
                sokobanDirection: { top: yDirection, left: xDirection },
                animating: true,
            },
            gridStateHistory: gridStateHistoryAddState(context, myClientId, getNextActionId(), (gridState) => {
                let {
                    extension: { cluePositions, clueSmashed, sokobanPosition },
                } = gridState;

                sokobanPosition = {
                    top: sokobanPosition.top + yDirection,
                    left: sokobanPosition.left + xDirection,
                };
                if (!allCells[sokobanPosition.top]?.[sokobanPosition.left]) {
                    return gridState;
                }

                interface OffsetClueInfo {
                    clue: SokobanClue;
                    index: number;
                    cells: Position[];
                }
                let offsetClueCells: OffsetClueInfo[] = [];
                let cellsMap: CellsMap<OffsetClueInfo> = {};
                const updateCellsMap = () => {
                    offsetClueCells = clues
                        .map((clue, index): OffsetClueInfo | undefined => {
                            const offset = cluePositions[index];
                            const smashed = clueSmashed[index];
                            return smashed
                                ? undefined
                                : {
                                      clue,
                                      index,
                                      cells: clue.cells.map(({ top, left }) => ({
                                          top: top + offset.top,
                                          left: left + offset.left,
                                      })),
                                  };
                        })
                        .filter(Boolean) as OffsetClueInfo[];

                    cellsMap = {};
                    for (const clue of offsetClueCells) {
                        for (const { top, left } of clue.cells) {
                            cellsMap[top] = cellsMap[top] ?? {};
                            cellsMap[top][left] = clue;
                        }
                    }
                };
                updateCellsMap();

                const updateState = (
                    moveClues: OffsetClueInfo[],
                    smashClues: OffsetClueInfo[],
                    xDirection: number,
                    yDirection: number,
                ) => {
                    const moveIndexes = moveClues.map(({ index }) => index);
                    cluePositions = cluePositions.map((position, index) =>
                        moveIndexes.includes(index)
                            ? {
                                  top: position.top + yDirection,
                                  left: position.left + xDirection,
                              }
                            : position,
                    );
                    const smashIndexes = smashClues.map(({ index }) => index);
                    clueSmashed = clueSmashed.map((smashed, index) => smashed || smashIndexes.includes(index));
                    updateCellsMap();
                };

                const movingClue = cellsMap[sokobanPosition.top]?.[sokobanPosition.left];
                if (movingClue !== undefined) {
                    const tryMoveClue = (clue: OffsetClueInfo): { move: OffsetClueInfo[]; smash: OffsetClueInfo[] } => {
                        const isSmashable = isSmashableClue?.(clue.clue);
                        const chainedClues = new Set<OffsetClueInfo>();

                        for (const { top, left } of clue.cells) {
                            const offsetTop = top + yDirection;
                            const offsetLeft = left + xDirection;
                            if (!allCells[offsetTop]?.[offsetLeft]) {
                                return { move: [], smash: isSmashable ? [clue] : [] };
                            }
                            const offsetClue = cellsMap[offsetTop]?.[offsetLeft];
                            if (offsetClue !== undefined && offsetClue !== clue) {
                                if (isLightClue?.(offsetClue.clue)) {
                                    chainedClues.add(offsetClue);
                                } else {
                                    return { move: [], smash: isSmashable ? [clue] : [] };
                                }
                            }
                        }

                        if (chainedClues.size === 0) {
                            return { move: [clue], smash: [] };
                        }

                        const move: OffsetClueInfo[] = [];
                        const smash: OffsetClueInfo[] = [];
                        for (const chainedClue of chainedClues) {
                            const result = tryMoveClue(chainedClue);
                            if (!result.move.length && !result.smash.length) {
                                return { move: [], smash: isSmashable ? [clue] : [] };
                            }
                            move.push(...result.move);
                            smash.push(...result.smash);
                        }
                        if (isSmashable && smash.length) {
                            smash.push(clue);
                        } else {
                            move.push(clue);
                        }

                        return { move, smash };
                    };

                    const { move, smash } = tryMoveClue(movingClue);
                    if (!move.length && !smash.length) {
                        return gridState;
                    }
                    updateState(move, smash, xDirection, yDirection);
                }

                const gracefullyFallenClueIndexes = new Set<number>();
                while (true) {
                    let changed = false;

                    for (const clue of offsetClueCells) {
                        if (!isFallingClue?.(clue.clue)) {
                            continue;
                        }

                        let isGracefulFall = false;
                        let fallAmount: number;
                        for (fallAmount = 0; ; fallAmount++) {
                            let shouldStop = false;
                            for (let { top, left } of clue.cells) {
                                top += fallAmount + 1;
                                if (!allCells[top]?.[left]) {
                                    shouldStop = true;
                                    break;
                                }
                                if (top === sokobanPosition.top && left === sokobanPosition.left) {
                                    shouldStop = true;
                                    isGracefulFall = true;
                                    break;
                                }
                                const offsetClue = cellsMap[top]?.[left];
                                if (offsetClue !== undefined && offsetClue !== clue) {
                                    shouldStop = true;
                                    if (gracefullyFallenClueIndexes.has(offsetClue.index)) {
                                        isGracefulFall = true;
                                        break;
                                    }
                                }
                            }
                            if (shouldStop) {
                                break;
                            }
                        }

                        if (fallAmount > 0) {
                            if (isGracefulFall) {
                                gracefullyFallenClueIndexes.add(clue.index);
                            }

                            updateState(
                                [clue],
                                isGracefulFall || !isSmashableClue?.(clue.clue) ? [] : [clue],
                                0,
                                fallAmount,
                            );
                            changed = true;
                            break;
                        }
                    }

                    if (!changed) {
                        break;
                    }
                }

                return {
                    ...gridState,
                    extension: { cluePositions, clueSmashed, sokobanPosition },
                };
            }),
        };
    };

const ButtonComponent = observer(function ButtonFc({ context, top, left }: ControlButtonItemProps<SokobanPTM>) {
    profiler.trace();

    const { cellSizeForSidePanel: cellSize, cellWriteMode } = context;

    return (
        <>
            <CellWriteModeButton
                context={context}
                top={top}
                left={left}
                cellWriteMode={base.mode}
                data={(size) => (
                    <AutoSvg width={size} height={size} viewBox={{ top: 0, left: 0, width: 1, height: 1 }}>
                        <SokobanPlayerByData />
                    </AutoSvg>
                )}
                title={`${translate({
                    [LanguageCode.en]: "Move the sokoban player",
                    [LanguageCode.ru]: "Двигать игрока",
                    [LanguageCode.de]: "Bewegen Sie den Sokoban-Spieler",
                })} (${translate("shortcut")}: ${base.hotKeyStr})`}
            />

            {cellWriteMode === base.mode && (
                <>
                    <ControlButton
                        cellSize={cellSize}
                        top={1}
                        left={0}
                        onClick={() => context.onStateChange(moveSokobanPlayer(-1, 0))}
                    >
                        <ArrowLeft />
                    </ControlButton>
                    <ControlButton
                        cellSize={cellSize}
                        top={0}
                        left={1}
                        onClick={() => context.onStateChange(moveSokobanPlayer(0, -1))}
                    >
                        <ArrowUp />
                    </ControlButton>
                    <ControlButton
                        cellSize={cellSize}
                        top={1}
                        left={1}
                        onClick={() => context.onStateChange(moveSokobanPlayer(0, 1))}
                    >
                        <ArrowDown />
                    </ControlButton>
                    <ControlButton
                        cellSize={cellSize}
                        top={1}
                        left={2}
                        onClick={() => context.onStateChange(moveSokobanPlayer(1, 0))}
                    >
                        <ArrowRight />
                    </ControlButton>

                    <Absolute
                        top={cellSize * 2 * (1 + controlButtonPaddingCoeff)}
                        left={0}
                        width={cellSize * (3 + 2 * controlButtonPaddingCoeff)}
                        style={{
                            fontSize: cellSize * 0.25,
                            lineHeight: "normal",
                        }}
                    >
                        {translate({
                            [LanguageCode.en]:
                                'Note: you can use A/W/S/D keys to move the player while being in the "digits" mode',
                            [LanguageCode.ru]: "Используйте клавиши AWSD для управления игроком при вводе цифр",
                            [LanguageCode.de]:
                                "Hinweis: Sie können den Player mit den Tasten A/W/S/D bewegen, während Sie sich im Ziffernmodus befinden",
                        })}
                    </Absolute>
                </>
            )}
        </>
    );
});

export const SokobanMovePlayerCellWriteModeInfo: CellWriteModeInfo<SokobanPTM> = {
    mode: base.mode,
    hotKeyStr: base.hotKeyStr,
    mainButtonContent: ButtonComponent,
    isNoSelectionMode: true,
    digitsCount: 0,
};
