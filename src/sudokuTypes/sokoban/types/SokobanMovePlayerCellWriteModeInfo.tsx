import {CellWriteModeInfo} from "../../../types/sudoku/CellWriteModeInfo";
import {SokobanPTM} from "./SokobanPTM";
import {MoveCellWriteModeInfo} from "../../../types/sudoku/cellWriteModes/move";
import {LanguageCode} from "../../../types/translations/LanguageCode";
import {ControlButtonItemProps} from "../../../components/sudoku/controls/ControlButtonsManager";
import {CellWriteModeButton} from "../../../components/sudoku/controls/CellWriteModeButton";
import {AutoSvg} from "../../../components/svg/auto-svg/AutoSvg";
import {SokobanPlayerByData} from "../constraints/SokobanPlayer";
import {useTranslate} from "../../../hooks/useTranslate";
import {ControlButton, controlButtonPaddingCoeff} from "../../../components/sudoku/controls/ControlButton";
import {ArrowLeft, ArrowRight, ArrowDown, ArrowUp} from "@emotion-icons/fluentui-system-filled";
import {fieldStateHistoryAddState} from "../../../types/sudoku/FieldStateHistory";
import {myClientId} from "../../../hooks/useMultiPlayer";
import {GameStateActionCallback, getNextActionId} from "../../../types/sudoku/GameStateAction";
import {GivenDigitsMap} from "../../../types/sudoku/GivenDigitsMap";
import {Absolute} from "../../../components/layout/absolute/Absolute";
import {observer} from "mobx-react-lite";
import {profiler} from "../../../utils/profiler";
import {SokobanClue} from "./SokobanPuzzleExtension";
import {Position} from "../../../types/layout/Position";

const base = MoveCellWriteModeInfo<SokobanPTM>();

export const moveSokobanPlayer = (xDirection: number, yDirection: number)
    : GameStateActionCallback<SokobanPTM> => (context) => {
    const {puzzleIndex: {allCells}, puzzle} = context;
    const {
        distinctMovementSteps,
        isLightClue,
        isSmashableClue,
    } = puzzle.extension?.options ?? {};
    const clues = puzzle.extension?.clues ?? [];

    if (distinctMovementSteps && context.stateExtension.animationManager.isAnimating) {
        return {};
    }

    return {
        extension: {
            sokobanDirection: {top: yDirection, left: xDirection},
            animating: true,
        },
        fieldStateHistory: fieldStateHistoryAddState(
            context,
            myClientId,
            getNextActionId(),
            (fieldState) => {
                const {extension: {cluePositions, clueSmashed, sokobanPosition}} = fieldState;

                const newTop = sokobanPosition.top + yDirection;
                const newLeft = sokobanPosition.left + xDirection;
                if (!allCells[newTop]?.[newLeft]) {
                    return fieldState;
                }

                interface OffsetClueInfo {
                    clue: SokobanClue;
                    index: number;
                    cells: Position[];
                }
                const offsetClueCells = clues.map((clue, index): OffsetClueInfo => {
                    const offset = cluePositions[index];
                    const smashed = clueSmashed[index];
                    return {
                        clue,
                        index,
                        cells: smashed ? [] : clue.cells.map(({top, left}) => ({
                            top: top + offset.top,
                            left: left + offset.left,
                        })),
                    };
                });
                const cellsMap: GivenDigitsMap<OffsetClueInfo> = {};
                for (const clue of offsetClueCells) {
                    for (const {top, left} of clue.cells) {
                        cellsMap[top] = cellsMap[top] ?? {};
                        cellsMap[top][left] = clue;
                    }
                }

                const movingClue = cellsMap[newTop]?.[newLeft];
                let moveClues: OffsetClueInfo[] = [];
                let smashClues: OffsetClueInfo[] = [];
                if (movingClue !== undefined) {
                    const tryMoveClue = (clue: OffsetClueInfo): {move: OffsetClueInfo[], smash: OffsetClueInfo[]} => {
                        const isSmashable = isSmashableClue?.(clue.clue);
                        const chainedClues = new Set<OffsetClueInfo>();

                        for (const {top, left} of clue.cells) {
                            const offsetTop = top + yDirection;
                            const offsetLeft = left + xDirection;
                            if (!allCells[offsetTop]?.[offsetLeft]) {
                                return {move: [], smash: isSmashable ? [clue] : []};
                            }
                            const offsetClue = cellsMap[offsetTop]?.[offsetLeft];
                            if (offsetClue !== undefined && offsetClue !== clue) {
                                if (isLightClue?.(offsetClue.clue)) {
                                    chainedClues.add(offsetClue);
                                } else {
                                    return {move: [], smash: isSmashable ? [clue] : []};
                                }
                            }
                        }

                        if (chainedClues.size === 0) {
                            return {move: [clue], smash: []};
                        }

                        const move: OffsetClueInfo[] = [];
                        const smash: OffsetClueInfo[] = [];
                        for (const chainedClue of chainedClues) {
                            const result = tryMoveClue(chainedClue);
                            if (!result.move.length && !result.smash.length) {
                                return {move: [], smash: isSmashable ? [clue] : []};
                            }
                            move.push(...result.move);
                            smash.push(...result.smash);
                        }
                        if (isSmashable && smash.length) {
                            smash.push(clue);
                        } else {
                            move.push(clue);
                        }

                        return {move, smash};
                    };

                    const {move, smash} = tryMoveClue(movingClue);
                    if (!move.length && !smash.length) {
                        return fieldState;
                    }
                    moveClues = move;
                    smashClues = smash;
                }

                const moveIndexes = moveClues.map(({index}) => index);
                const smashIndexes = smashClues.map(({index}) => index);

                // TODO: falling clues

                return {
                    ...fieldState,
                    extension: {
                        cluePositions: cluePositions.map(
                            (position, index) => moveIndexes.includes(index)
                                ? {
                                    top: position.top + yDirection,
                                    left: position.left + xDirection,
                                }
                                : position
                        ),
                        clueSmashed: clueSmashed.map(
                            (smashed, index) => smashed || smashIndexes.includes(index)
                        ),
                        sokobanPosition: {top: newTop, left: newLeft},
                    },
                };
            },
        )
    };
};

const ButtonComponent = observer(function ButtonFc({context, top, left}: ControlButtonItemProps<SokobanPTM>) {
    profiler.trace();

    const {
        cellSizeForSidePanel: cellSize,
        cellWriteMode,
    } = context;

    const translate = useTranslate();

    return <>
        <CellWriteModeButton
            context={context}
            top={top}
            left={left}
            cellWriteMode={base.mode}
            data={(size) => <AutoSvg
                width={size}
                height={size}
                viewBox={{top: 0, left: 0, width: 1, height: 1}}
            >
                <SokobanPlayerByData/>
            </AutoSvg>}
            title={`${translate({
                [LanguageCode.en]: "Move the sokoban player",
                [LanguageCode.ru]: "Двигать игрока",
                [LanguageCode.de]: "Bewegen Sie den Sokoban-Spieler",
            })} (${translate("shortcut")}: ${base.hotKeyStr})`}
        />

        {cellWriteMode === base.mode && <>
            <ControlButton
                cellSize={cellSize}
                top={1}
                left={0}
                onClick={() => context.onStateChange(moveSokobanPlayer(-1, 0))}
            >
                <ArrowLeft/>
            </ControlButton>
            <ControlButton
                cellSize={cellSize}
                top={0}
                left={1}
                onClick={() => context.onStateChange(moveSokobanPlayer(0, -1))}
            >
                <ArrowUp/>
            </ControlButton>
            <ControlButton
                cellSize={cellSize}
                top={1}
                left={1}
                onClick={() => context.onStateChange(moveSokobanPlayer(0, 1))}
            >
                <ArrowDown/>
            </ControlButton>
            <ControlButton
                cellSize={cellSize}
                top={1}
                left={2}
                onClick={() => context.onStateChange(moveSokobanPlayer(1, 0))}
            >
                <ArrowRight/>
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
                    [LanguageCode.en]: 'Note: you can use A/W/S/D keys to move the player while being in the "digits" mode',
                    [LanguageCode.ru]: "Используйте клавиши AWSD для управления игроком при вводе цифр",
                    [LanguageCode.de]: "Hinweis: Sie können den Player mit den Tasten A/W/S/D bewegen, während Sie sich im Ziffernmodus befinden",
                })}
            </Absolute>
        </>}
    </>;
});

export const SokobanMovePlayerCellWriteModeInfo: CellWriteModeInfo<SokobanPTM> = {
    mode: base.mode,
    hotKeyStr: base.hotKeyStr,
    mainButtonContent: ButtonComponent,
    isNoSelectionMode: true,
    digitsCount: 0,
};
