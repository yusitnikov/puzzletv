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

const base = MoveCellWriteModeInfo<SokobanPTM>();

export const moveSokobanPlayer = (xDirection: number, yDirection: number)
    : GameStateActionCallback<SokobanPTM> => (context) => {
    const {puzzleIndex: {allCells}, puzzle} = context;
    const clues = puzzle.extension?.clues ?? [];

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
                const {extension: {cluePositions, sokobanPosition}} = fieldState;

                const newTop = sokobanPosition.top + yDirection;
                const newLeft = sokobanPosition.left + xDirection;
                if (!allCells[newTop]?.[newLeft]) {
                    return fieldState;
                }

                const offsetClueCells = clues.map(({cells}, index) => {
                    const offset = cluePositions[index];
                    return cells.map(({top, left}) => ({
                        top: top + offset.top,
                        left: left + offset.left,
                    }));
                });
                const cellsMap: GivenDigitsMap<number> = {};
                for (const [index, cells] of offsetClueCells.entries()) {
                    for (const {top, left} of cells) {
                        cellsMap[top] = cellsMap[top] ?? {};
                        cellsMap[top][left] = index;
                    }
                }

                const movingIndex = cellsMap[newTop]?.[newLeft];
                if (movingIndex !== undefined) {
                    for (const {top, left} of offsetClueCells[movingIndex]) {
                        const offsetTop = top + yDirection;
                        const offsetLeft = left + xDirection;
                        if (!allCells[offsetTop]?.[offsetLeft]) {
                            return fieldState;
                        }
                        const offsetIndex = cellsMap[offsetTop]?.[offsetLeft];
                        if (offsetIndex !== undefined && offsetIndex !== movingIndex) {
                            return fieldState;
                        }
                    }
                }

                return {
                    ...fieldState,
                    extension: {
                        cluePositions: cluePositions.map(
                            (position, index) => index === movingIndex
                                ? {
                                    top: position.top + yDirection,
                                    left: position.left + xDirection,
                                }
                                : position
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
