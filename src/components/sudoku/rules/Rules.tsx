/** @jsxImportSource @emotion/react */
import {Absolute} from "../../layout/absolute/Absolute";
import {Rect} from "../../../types/layout/Rect";
import styled from "@emotion/styled";
import {blueColor, globalPaddingCoeff, greenColor} from "../../app/globals";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";

const StyledContainer = styled(Absolute)({
    display: "flex",
    flexDirection: "column",
});

export interface RulesProps {
    puzzle: PuzzleDefinition;
    rect: Rect;
    cellSize: number;
}

export const Rules = ({puzzle: {title, author, rules}, rect, cellSize}: RulesProps) => <StyledContainer {...rect} pointerEvents={true}>
    <div
        style={{
            padding: cellSize / 8,
            textAlign: "center",
            marginBottom: cellSize * globalPaddingCoeff / 2,
            backgroundColor: blueColor,
        }}
    >
        <h1 style={{fontSize: cellSize / 3, margin: 0}}>{title}</h1>

        {author && <div style={{fontSize: cellSize / 4}}>by {author}</div>}
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
                fontSize: cellSize / 5,
            }}
        >
            {rules}
        </div>
    </div>
</StyledContainer>;
