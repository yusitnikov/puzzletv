import {JigsawPTM} from "../types/JigsawPTM";
import {LanguageCode} from "../../../types/translations/LanguageCode";
import {ControlButton} from "../../../components/sudoku/controls/ControlButton";
import {useTranslate} from "../../../hooks/useTranslate";
import {ControlButtonItemProps} from "../../../components/sudoku/controls/ControlButtonsManager";
import {fieldStateHistoryGetCurrent} from "../../../types/sudoku/FieldStateHistory";
import {
    getActiveJigsawPieceIndexes,
    getActiveJigsawPieceZIndex,
    getJigsawCellCenterAbsolutePosition,
    getJigsawPiecesWithCache,
    groupJigsawPiecesByZIndex
} from "../types/helpers";
import {jigsawPieceStateChangeAction} from "../types/JigsawGamePieceState";
import {myClientId} from "../../../hooks/useMultiPlayer";
import {getNextActionId} from "../../../types/sudoku/GameStateAction";
import {useEventListener} from "../../../hooks/useEventListener";
import {useMemo} from "react";
import {AutoSvg} from "../../../components/svg/auto-svg/AutoSvg";
import {regionHighlightColor, textColor} from "../../../components/app/globals";
import {formatSvgPointsArray, Position} from "../../../types/layout/Position";
import {useTransformScale} from "../../../contexts/TransformScaleContext";
import {roundToStep} from "../../../utils/math";
import {resolveDigitsCountInCellWriteMode} from "../../../types/sudoku/CellWriteModeInfo";

export const JigsawGluePiecesButton = ({context}: ControlButtonItemProps<JigsawPTM>) => {
    const {
        cellsIndex,
        puzzle,
        cellSizeForSidePanel: cellSize,
        state: {
            fieldStateHistory,
            extension: {highlightCurrentPiece},
        },
        onStateChange,
    } = context;

    const digitsCount = resolveDigitsCountInCellWriteMode(context);

    const translate = useTranslate();

    const {extension: {pieces: piecePositions}} = fieldStateHistoryGetCurrent(fieldStateHistory);
    const activePieceZIndex = getActiveJigsawPieceZIndex(piecePositions);
    const activePieceIndexes = useMemo(() => getActiveJigsawPieceIndexes(piecePositions), [piecePositions]);
    const canUnglue = highlightCurrentPiece && activePieceIndexes.length > 1;
    const handleUnglue = () => onStateChange(jigsawPieceStateChangeAction(
        puzzle,
        undefined,
        myClientId,
        getNextActionId(),
        activePieceIndexes,
        ({allPositions}, index) => ({
            position: {
                zIndex: getActiveJigsawPieceZIndex(allPositions) + 1 + index,
            },
        }),
    ));

    const {pieces} = getJigsawPiecesWithCache(cellsIndex);
    const groups = useMemo(
        () => groupJigsawPiecesByZIndex(pieces, piecePositions),
        [pieces, piecePositions]
    );
    const pieceIndexesToGlue = useMemo(() => {
        const getCellKey = ({top, left}: Position) => `${roundToStep(top, 0.1)}-${roundToStep(left, 0.1)}`;
        const groupCells = groups.map(({pieces, indexes, zIndex}) => {
            const cells = pieces.flatMap(
                ({info: {cells}, region, index}) => cells.map(
                    (cell) => ({
                        pieceIndex: index,
                        cell,
                        position: getJigsawCellCenterAbsolutePosition(region, cell),
                    })
                )
            );

            const cellsMap: Record<string, typeof cells[0]> = {};
            for (const cell of cells) {
                cellsMap[getCellKey(cell.position)] = cell;
            }

            return {
                zIndex,
                pieceIndexes: indexes,
                cells,
                cellsMap,
            };
        });

        const groupsToGlue = groupCells.filter(({zIndex}) => zIndex === activePieceZIndex);
        let cellsMapToGlue = groupsToGlue
            .map(({cellsMap}) => cellsMap)
            .reduce((a, b) => ({...a, ...b}));
        const isGroupCell = (cell: Position) => !!cellsMapToGlue[getCellKey(cell)];
        let remainingGroups = groupCells.filter(({zIndex}) => zIndex !== activePieceZIndex);

        while (remainingGroups.length) {
            // Remove groups that have cell collisions
            remainingGroups = remainingGroups.filter(
                ({cells}) => cells.every(({position}) => !isGroupCell(position))
            );
            if (remainingGroups.length === 0) {
                break;
            }

            // Find a group that has a neighbor cell
            const nextGroupIndex = remainingGroups.findIndex(
                ({cells}) => cells.some(
                    ({position: {top, left}}) =>
                        isGroupCell({top: top - 1, left}) || isGroupCell({top: top + 1, left}) ||
                        isGroupCell({top, left: left - 1}) || isGroupCell({top, left: left + 1})
                )
            );
            if (nextGroupIndex < 0) {
                break;
            }

            const nextGroup = remainingGroups[nextGroupIndex];
            remainingGroups.splice(nextGroupIndex, 1);
            groupsToGlue.push(nextGroup);
            cellsMapToGlue = {...cellsMapToGlue, ...nextGroup.cellsMap};
        }

        return groupsToGlue.flatMap(({pieceIndexes}) => pieceIndexes);
    }, [groups, activePieceZIndex]);
    const canGlue = highlightCurrentPiece && pieceIndexesToGlue.length > activePieceIndexes.length;
    const handleGlue = () => onStateChange(jigsawPieceStateChangeAction(
        puzzle,
        undefined,
        myClientId,
        getNextActionId(),
        pieceIndexesToGlue,
        ({allPositions}) => ({
            position: {
                zIndex: getActiveJigsawPieceZIndex(allPositions) + 1,
            },
        }),
    ));

    useEventListener(window, "keydown", (ev) => {
        if (canUnglue && ev.code === "KeyU") {
            handleUnglue();
            ev.preventDefault();
        }
        if (canGlue && ev.code === "KeyG") {
            handleGlue();
            ev.preventDefault();
        }
    });

    if (digitsCount > 6) {
        return null;
    }

    return <>
        <ControlButton
            cellSize={cellSize}
            top={2}
            left={0}
            disabled={!canGlue}
            onClick={handleGlue}
            title={`${translate({
                [LanguageCode.en]: "glue jigsaw pieces together",
                [LanguageCode.ru]: "объединить куски пазла",
            })} (${translate("shortcut")}: G)`}
        >
            {(contentSize) => <AutoSvg
                width={contentSize}
                height={contentSize}
                viewBox={{top: 0, left: 0, width: 1, height: 1}}
            >
                <AutoSvg left={0.4} top={0.5}>
                    <PieceSelectionIcon/>
                </AutoSvg>
                <AutoSvg left={0.6} top={0.5} angle={180}>
                    <PieceSelectionIcon/>
                </AutoSvg>
                <AutoSvg left={0.4} top={0.5}>
                    <PieceIcon/>
                </AutoSvg>
                <AutoSvg left={0.6} top={0.5} angle={180}>
                    <PieceIcon/>
                </AutoSvg>
            </AutoSvg>}
        </ControlButton>

        <ControlButton
            cellSize={cellSize}
            top={2}
            left={1}
            onClick={handleUnglue}
            disabled={!canUnglue}
            title={`${translate({
                [LanguageCode.en]: "unglue the jigsaw pieces",
                [LanguageCode.ru]: "разъединить куски пазла",
            })} (${translate("shortcut")}: U)`}
        >
            {(contentSize) => <AutoSvg
                width={contentSize}
                height={contentSize}
                viewBox={{top: 0, left: 0, width: 1, height: 1}}
            >
                <AutoSvg left={0.3} top={0.3}>
                    <PieceSelectionIcon/>
                </AutoSvg>
                <AutoSvg left={0.7} top={0.7} angle={180}>
                    <PieceSelectionIcon/>
                </AutoSvg>
                <AutoSvg left={0.3} top={0.3}>
                    <PieceIcon/>
                </AutoSvg>
                <AutoSvg left={0.7} top={0.7} angle={180}>
                    <PieceIcon/>
                </AutoSvg>
            </AutoSvg>}
        </ControlButton>
    </>
};

interface PieceShapeIconProps {
    backgroundColor?: string;
    borderColor?: string;
    width?: number;
}
const PieceShapeIcon = ({backgroundColor = "none", borderColor = "none", width = 0}: PieceShapeIconProps) => <polygon
    points={formatSvgPointsArray([
        {top: -0.2, left: -0.2},
        {top: -0.2, left: 0.2},
        {top: 0, left: 0.2},
        {top: 0, left: 0},
        {top: 0.2, left: 0},
        {top: 0.2, left: -0.2},
    ])}
    fill={backgroundColor}
    stroke={borderColor}
    strokeWidth={width}
/>;
const PieceSelectionIcon = () => <PieceShapeIcon borderColor={regionHighlightColor} width={0.15}/>;
const PieceIcon = () => {
    const scale = useTransformScale();

    return <>
        <PieceShapeIcon backgroundColor={"#fff"} borderColor={textColor} width={0.05}/>

        <polyline
            points={formatSvgPointsArray([
                {top: -0.2, left: 0},
                {top: 0, left: 0},
                {top: 0, left: -0.2},
            ])}
            fill={"none"}
            stroke={textColor}
            strokeWidth={1 / scale}
        />
    </>;
};
