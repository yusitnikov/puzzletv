/** @jsxImportSource @emotion/react */
import {Absolute} from "../../layout/absolute/Absolute";
import {Rect} from "../../../types/layout/Rect";
import styled from "@emotion/styled";
import {blueColor, globalPaddingCoeff, greenColor} from "../../app/globals";

const StyledContainer = styled(Absolute)({
    display: "flex",
    flexDirection: "column",
});

const StyledParagraph = styled("p")({
    marginTop: 0,
    marginBottom: "0.3em",
});

const StyledList = styled("ul")({
    marginTop: 0,
    marginBottom: "1em",
});

export interface RulesProps {
    rect: Rect;
    cellSize: number;
}

export const Rules = ({rect, cellSize}: RulesProps) => <StyledContainer {...rect} pointerEvents={true}>
    <div
        style={{
            padding: cellSize / 8,
            textAlign: "center",
            marginBottom: cellSize * globalPaddingCoeff / 2,
            backgroundColor: blueColor,
        }}
    >
        <h1 style={{fontSize: cellSize / 3, margin: 0}}>North or South?</h1>

        <div style={{fontSize: cellSize / 4}}>by Chameleon</div>
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
            <StyledParagraph>Normal sudoku rules apply.</StyledParagraph>
            <StyledParagraph><strong>The sudoku field can be rotated clockwise.</strong> It's not known in advance in which orientation the puzzle is solvable.</StyledParagraph>
            <StyledParagraph>Anti-knight sudoku rules apply: cells separated by a chess knight's move cannot contain the same digit.</StyledParagraph>
            <StyledParagraph>Conventional notations for common sudoku objects apply:</StyledParagraph>
            <StyledList>
                <li>Killer cages: cells in cages must sum to the total given in the corner of each cage, digits cannot repeat within a cage.</li>
                <li>Arrows: digits along arrows sum to the numbers in the circles.</li>
                <li>Thermometers: along thermometers, digits must increase from the bulb end.</li>
                <li>Kropki dots: cells separated by a black dot have a ratio of 1:2.</li>
                <li>XV: cells separated by X must sum to 10.</li>
                <li>German whispers: consecutive digits along the green line must have difference of 5 or more.</li>
            </StyledList>
            <StyledParagraph>And the most important rule: <strong>try using bifurcation as little as possible</strong> ;)</StyledParagraph>
        </div>
    </div>
</StyledContainer>;
