import { JigsawPTM } from "../types/JigsawPTM";
import { LanguageCode } from "../../../types/translations/LanguageCode";
import { ControlButton } from "../../../components/sudoku/controls/ControlButton";
import { useTranslate } from "../../../hooks/useTranslate";
import { ControlButtonItemProps } from "../../../components/sudoku/controls/ControlButtonsManager";
import {
    getActiveJigsawPieceIndexes,
    getActiveJigsawPieceZIndex,
    getJigsawCellCenterAbsolutePositionsIndex,
    groupJigsawPiecesByZIndex,
} from "../types/helpers";
import { jigsawPieceStateChangeAction } from "../types/JigsawGamePieceState";
import { myClientId } from "../../../hooks/useMultiPlayer";
import { getNextActionId } from "../../../types/sudoku/GameStateAction";
import { useEventListener } from "../../../hooks/useEventListener";
import { AutoSvg } from "../../../components/svg/auto-svg/AutoSvg";
import { regionHighlightColor, textColor } from "../../../components/app/globals";
import { formatSvgPointsArray, Position } from "../../../types/layout/Position";
import { useTransformScale } from "../../../contexts/TransformContext";
import { mergeGivenDigitsMaps } from "../../../types/sudoku/GivenDigitsMap";
import { comparer } from "mobx";
import { observer } from "mobx-react-lite";
import { useComputed, useComputedValue } from "../../../hooks/useComputed";
import { profiler } from "../../../utils/profiler";

export const JigsawGluePiecesButton = observer(function JigsawGluePiecesButton({
    context,
}: ControlButtonItemProps<JigsawPTM>) {
    profiler.trace();

    const { cellSizeForSidePanel: cellSize } = context;

    const translate = useTranslate();

    const getPiecePositions = useComputed(
        function getPiecePositions() {
            return context.fieldExtension.pieces;
        },
        { equals: comparer.structural },
    );
    const getActivePieceIndexes = useComputed(
        function getActivePieceIndexes() {
            return getActiveJigsawPieceIndexes(getPiecePositions());
        },
        { equals: comparer.structural },
    );
    const canUnglue = useComputedValue(function getCanUnglue() {
        return context.stateExtension.highlightCurrentPiece && getActivePieceIndexes().length > 1;
    });
    const handleUnglue = () =>
        context.onStateChange(
            jigsawPieceStateChangeAction(
                undefined,
                myClientId,
                getNextActionId(),
                getActivePieceIndexes(),
                ({ allPositions }, index) => ({
                    position: {
                        zIndex: getActiveJigsawPieceZIndex(allPositions) + 1 + index,
                    },
                }),
            ),
        );

    const getPieceIndexesToGlue = useComputed(
        function getPieceIndexesToGlue() {
            const groupCells = getJigsawCellCenterAbsolutePositionsIndex(groupJigsawPiecesByZIndex(context));

            const activePieceZIndex = getActiveJigsawPieceZIndex(getPiecePositions());

            const groupsToGlue = groupCells.filter(({ zIndex }) => zIndex === activePieceZIndex);
            let cellsMapToGlue = mergeGivenDigitsMaps(...groupsToGlue.map(({ cellsMap }) => cellsMap));
            const isGroupCell = ({ top, left }: Position) => !!cellsMapToGlue[top]?.[left];
            let remainingGroups = groupCells.filter(({ zIndex }) => zIndex !== activePieceZIndex);

            while (remainingGroups.length) {
                // Remove groups that have cell collisions
                remainingGroups = remainingGroups.filter(({ cells }) =>
                    cells.every(({ position }) => !isGroupCell(position)),
                );
                if (remainingGroups.length === 0) {
                    break;
                }

                // Find a group that has a neighbor cell
                const nextGroupIndex = remainingGroups.findIndex(({ cells }) =>
                    cells.some(
                        ({ position: { top, left } }) =>
                            isGroupCell({ top: top - 1, left }) ||
                            isGroupCell({ top: top + 1, left }) ||
                            isGroupCell({ top, left: left - 1 }) ||
                            isGroupCell({ top, left: left + 1 }),
                    ),
                );
                if (nextGroupIndex < 0) {
                    break;
                }

                const nextGroup = remainingGroups[nextGroupIndex];
                remainingGroups.splice(nextGroupIndex, 1);
                groupsToGlue.push(nextGroup);
                cellsMapToGlue = mergeGivenDigitsMaps(cellsMapToGlue, nextGroup.cellsMap);
            }

            return groupsToGlue.flatMap(({ pieceIndexes }) => pieceIndexes);
        },
        { equals: comparer.structural },
    );
    const canGlue = useComputedValue(function getCanGlue() {
        return (
            context.stateExtension.highlightCurrentPiece &&
            getPieceIndexesToGlue().length > getActivePieceIndexes().length
        );
    });
    const handleGlue = () =>
        context.onStateChange(
            jigsawPieceStateChangeAction(
                undefined,
                myClientId,
                getNextActionId(),
                getPieceIndexesToGlue(),
                ({ allPositions }) => ({
                    position: {
                        zIndex: getActiveJigsawPieceZIndex(allPositions) + 1,
                    },
                }),
            ),
        );

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

    if (context.digitsCountInCurrentMode > 6) {
        return null;
    }

    return (
        <>
            <ControlButton
                cellSize={cellSize}
                top={2}
                left={0}
                disabled={!canGlue}
                onClick={handleGlue}
                title={`${translate({
                    [LanguageCode.en]: "glue jigsaw pieces together",
                    [LanguageCode.ru]: "объединить куски пазла",
                    [LanguageCode.de]: "Puzzleteile zusammenkleben",
                })} (${translate("shortcut")}: G)`}
            >
                {(contentSize) => (
                    <AutoSvg
                        width={contentSize}
                        height={contentSize}
                        viewBox={{ top: 0, left: 0, width: 1, height: 1 }}
                    >
                        <AutoSvg left={0.4} top={0.5}>
                            <PieceSelectionIcon />
                        </AutoSvg>
                        <AutoSvg left={0.6} top={0.5} angle={180}>
                            <PieceSelectionIcon />
                        </AutoSvg>
                        <AutoSvg left={0.4} top={0.5}>
                            <PieceIcon />
                        </AutoSvg>
                        <AutoSvg left={0.6} top={0.5} angle={180}>
                            <PieceIcon />
                        </AutoSvg>
                    </AutoSvg>
                )}
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
                    [LanguageCode.de]: "die Puzzleteile lösen",
                })} (${translate("shortcut")}: U)`}
            >
                {(contentSize) => (
                    <AutoSvg
                        width={contentSize}
                        height={contentSize}
                        viewBox={{ top: 0, left: 0, width: 1, height: 1 }}
                    >
                        <AutoSvg left={0.3} top={0.3}>
                            <PieceSelectionIcon />
                        </AutoSvg>
                        <AutoSvg left={0.7} top={0.7} angle={180}>
                            <PieceSelectionIcon />
                        </AutoSvg>
                        <AutoSvg left={0.3} top={0.3}>
                            <PieceIcon />
                        </AutoSvg>
                        <AutoSvg left={0.7} top={0.7} angle={180}>
                            <PieceIcon />
                        </AutoSvg>
                    </AutoSvg>
                )}
            </ControlButton>
        </>
    );
});

interface PieceShapeIconProps {
    backgroundColor?: string;
    borderColor?: string;
    width?: number;
}
const PieceShapeIcon = ({ backgroundColor = "none", borderColor = "none", width = 0 }: PieceShapeIconProps) => (
    <polygon
        points={formatSvgPointsArray([
            { top: -0.2, left: -0.2 },
            { top: -0.2, left: 0.2 },
            { top: 0, left: 0.2 },
            { top: 0, left: 0 },
            { top: 0.2, left: 0 },
            { top: 0.2, left: -0.2 },
        ])}
        fill={backgroundColor}
        stroke={borderColor}
        strokeWidth={width}
    />
);
const PieceSelectionIcon = () => <PieceShapeIcon borderColor={regionHighlightColor} width={0.15} />;
const PieceIcon = () => {
    const scale = useTransformScale();

    return (
        <>
            <PieceShapeIcon backgroundColor={"#fff"} borderColor={textColor} width={0.05} />

            <polyline
                points={formatSvgPointsArray([
                    { top: -0.2, left: 0 },
                    { top: 0, left: 0 },
                    { top: 0, left: -0.2 },
                ])}
                fill={"none"}
                stroke={textColor}
                strokeWidth={1 / scale}
            />
        </>
    );
};
