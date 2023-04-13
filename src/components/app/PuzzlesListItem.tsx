import {headerPadding, lighterGreyColor} from "./globals";
import React from "react";
import {useLanguageCode, useTranslate} from "../../hooks/useTranslate";
import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {buildLink} from "../../utils/link";
import {FieldPreview} from "../sudoku/field/FieldPreview";
import {AnyPTM} from "../../types/sudoku/PuzzleTypeMap";

const padding = headerPadding;

export interface PuzzlesListItemProps<T extends AnyPTM> {
    puzzle: PuzzleDefinition<T>;
    width: number;
    hide?: boolean;
}

export const PuzzlesListItem = <T extends AnyPTM>({puzzle, width, hide}: PuzzlesListItemProps<T>) => {
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
            marginLeft: padding,
            background: "white",
        }}>
            <FieldPreview puzzle={puzzle} width={thumbnailWidth} hide={hide}/>
        </div>

        <div><strong>{translate(puzzle.title)}</strong></div>
        {puzzle.author && <div style={{marginTop: padding}}>{translate("by")} {translate(puzzle.author)}</div>}
    </a>;
};
