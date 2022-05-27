import {headerPadding, lighterGreyColor} from "./globals";
import React, {useMemo} from "react";
import {useLanguageCode, useTranslate} from "../../contexts/LanguageCodeContext";
import {Field} from "../sudoku/field/Field";
import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {PuzzleContext} from "../../types/sudoku/PuzzleContext";
import {useGame} from "../../hooks/sudoku/useGame";
import {addLanguageToLink} from "../../utils/link";

const padding = headerPadding;

export interface PuzzlesListItemProps<CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}> {
    puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>;
    width: number;
}

export const PuzzlesListItem = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    {puzzle, width}: PuzzlesListItemProps<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
) => {
    const language = useLanguageCode();
    const translate = useTranslate();

    const thumbnailWidth = (width - padding * 2) * 0.4;
    const thumbnailCellSize = thumbnailWidth / (puzzle.fieldSize.fieldSize + (puzzle.fieldMargin || 0) * 2);

    const [processedGameState, mergeGameState] = useGame(puzzle, true);

    const context = useMemo<PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>>(() => ({
        puzzle,
        state: processedGameState,
        onStateChange: mergeGameState,
        cellSize: thumbnailCellSize,
    }), [puzzle, processedGameState, mergeGameState, thumbnailCellSize]);

    return <a
        href={addLanguageToLink(`#${puzzle.slug}`, language)}
        style={{
            background: lighterGreyColor,
            flex: "1 1 100%",
            padding,
            borderRadius: padding / 2,
            color: "inherit",
            textDecoration: "none",
            overflow: "hidden",
        }}
        title={translate("Play %1").replace("%1", '"' + translate(puzzle.title) + '"')}
    >
        <div style={{
            float: "right",
            position: "relative",
            width: thumbnailWidth,
            height: thumbnailWidth,
            marginLeft: padding,
            background: "white",
            pointerEvents: "none",
        }}>
            <Field
                rect={{
                    left: 0,
                    top: 0,
                    width: thumbnailWidth,
                    height: thumbnailWidth,
                }}
                context={context}
            />
        </div>

        <div><strong>{translate(puzzle.title)}</strong></div>
        {puzzle.author && <div style={{marginTop: padding}}>{translate("by")} {translate(puzzle.author)}</div>}
    </a>;
};

export const PuzzlesListItemSpace = () => <div style={{
    flex: "1 1 100%",
    padding,
}}/>;
