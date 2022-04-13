/** @jsxImportSource @emotion/react */
import {Absolute} from "../../layout/absolute/Absolute";
import {Rect} from "../../../types/layout/Rect";
import styled from "@emotion/styled";
import {
    blueColor,
    globalPaddingCoeff,
    greenColor,
    h1HeightCoeff,
    h2HeightCoeff,
    textHeightCoeff
} from "../../app/globals";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {useTranslate} from "../../../contexts/LanguageCodeContext";

const StyledContainer = styled(Absolute)({
    display: "flex",
    flexDirection: "column",
});

export interface RulesProps<CellType> {
    puzzle: PuzzleDefinition<CellType, any, any>;
    rect: Rect;
    cellSize: number;
}

export const Rules = <CellType,>({puzzle: {title, author, rules}, rect, cellSize}: RulesProps<CellType>) => {
    const translate = useTranslate();

    return <StyledContainer {...rect} pointerEvents={true}>
        <div
            style={{
                padding: cellSize / 8,
                textAlign: "center",
                marginBottom: cellSize * globalPaddingCoeff / 2,
                backgroundColor: blueColor,
            }}
        >
            <h1 style={{fontSize: cellSize * h1HeightCoeff, margin: 0}}>{translate(title)}</h1>

            {author && <div style={{fontSize: cellSize * h2HeightCoeff}}>{translate("by")} {translate(author)}</div>}
        </div>

        <div
            style={{
                flexGrow: 1,
                flexShrink: 1,
                flexBasis: 0,
                minHeight: 0,
                overflow: "auto",
                backgroundColor: greenColor,
            }}
        >
            <div
                style={{
                    padding: cellSize / 8,
                    fontSize: cellSize * textHeightCoeff,
                }}
            >
                {rules(translate)}
            </div>
        </div>
    </StyledContainer>;
};
