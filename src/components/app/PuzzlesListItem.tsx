import {headerPadding, lighterGreyColor} from "./globals";
import React from "react";
import {useLanguageCode, useTranslate} from "../../hooks/useTranslate";
import {Field} from "../sudoku/field/Field";
import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {useGame} from "../../hooks/sudoku/useGame";
import {buildLink} from "../../utils/link";

const padding = headerPadding;

export interface PuzzlesListItemProps<CellType, ExType = {}, ProcessedExType = {}> {
    puzzle: PuzzleDefinition<CellType, ExType, ProcessedExType>;
    width: number;
    hide?: boolean;
}

export const PuzzlesListItem = <CellType, ExType = {}, ProcessedExType = {}>(
    {puzzle, width, hide}: PuzzlesListItemProps<CellType, ExType, ProcessedExType>
) => {
    const language = useLanguageCode();
    const translate = useTranslate();

    const thumbnailWidth = (width - padding * 2) * 0.4;

    return <a
        href={buildLink(puzzle.slug, language)}
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
            {!hide && <PuzzlesListItemField puzzle={puzzle} width={thumbnailWidth}/>}
        </div>

        <div><strong>{translate(puzzle.title)}</strong></div>
        {puzzle.author && <div style={{marginTop: padding}}>{translate("by")} {translate(puzzle.author)}</div>}
    </a>;
};

export const PuzzlesListItemField = <CellType, ExType = {}, ProcessedExType = {}>(
    {puzzle, width: thumbnailWidth}: Omit<PuzzlesListItemProps<CellType, ExType, ProcessedExType>, "hide">
) => {
    const thumbnailCellSize = thumbnailWidth / (puzzle.fieldSize.fieldSize + (puzzle.fieldMargin || 0) * 2);

    const context = useGame(puzzle, thumbnailCellSize, thumbnailCellSize, true);

    return <Field
        rect={{
            left: 0,
            top: 0,
            width: thumbnailWidth,
            height: thumbnailWidth,
        }}
        context={context}
    />;
};
