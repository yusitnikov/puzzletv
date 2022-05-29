/** @jsxImportSource @emotion/react */
import {Absolute} from "../../layout/absolute/Absolute";
import {Rect} from "../../../types/layout/Rect";
import styled from "@emotion/styled";
import {
    blueColor, currentPlayerColor,
    globalPaddingCoeff,
    greenColor,
    h1HeightCoeff,
    h2HeightCoeff, otherPlayerColor, textColor,
    textHeightCoeff
} from "../../app/globals";
import {useTranslate} from "../../../contexts/LanguageCodeContext";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {Fragment} from "react";
import {myClientId} from "../../../hooks/useMultiPlayer";
import {GameState} from "../../../types/sudoku/GameState";

const StyledContainer = styled(Absolute)({
    display: "flex",
    flexDirection: "column",
});

export interface RulesProps<CellType> {
    context: PuzzleContext<CellType, any, any>;
    rect: Rect;
}

export const Rules = <CellType,>({rect, context}: RulesProps<CellType>) => {
    const translate = useTranslate();

    const {
        puzzle: {title, author, rules},
        state: {currentPlayer},
        cellSize,
        multiPlayer: {isEnabled, allPlayerIds, playerNicknames},
    } = context;

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

            {isEnabled && <>
                {allPlayerIds.length > 1 && allPlayerIds.map((playerId, index) => <Fragment key={playerId}>
                    {index > 0 && <strong> vs </strong>}
                    <span
                        style={{cursor: playerId === myClientId ? "pointer" : undefined}}
                        onClick={() => {
                            if (playerId === myClientId) {
                                context.onStateChange({isShowingSettings: true} as Partial<GameState<CellType>>);
                            }
                        }}
                    >
                        <span style={{
                            display: "inline-block",
                            width: "0.7em",
                            height: "0.7em",
                            padding: 0,
                            backgroundColor: playerId === myClientId ? currentPlayerColor : otherPlayerColor,
                            border: `1px solid ${textColor}`,
                        }}/>
                        &nbsp;
                        <span style={{fontWeight: playerId === currentPlayer ? 700 : 400}}>{playerNicknames[playerId]}</span>
                        {playerId === myClientId && <>&nbsp;({translate("you")})</>}
                    </span>
                </Fragment>)}

                {allPlayerIds.length <= 1 && `${translate("Waiting for people to connect")}...`}
            </>}
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
                {rules?.(translate, context)}
            </div>
        </div>
    </StyledContainer>;
};
