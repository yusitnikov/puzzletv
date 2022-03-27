/** @jsxImportSource @emotion/react */
import {Absolute} from "../../layout/absolute/Absolute";
import {Rect} from "../../../types/layout/Rect";
import styled from "@emotion/styled";
import {blueColor, globalPaddingCoeff, greenColor} from "../../app/globals";

const StyledContainer = styled(Absolute)({
    display: "flex",
    flexDirection: "column",
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
            marginBottom: cellSize * Math.min(1 / 4, globalPaddingCoeff),
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
                fontSize: cellSize / 4,
            }}
        >
            Normal sudoku rules apply.<br/>
        </div>
    </div>
</StyledContainer>;
