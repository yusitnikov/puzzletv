import {indexes} from "../../../utils/indexes";
import {textColor} from "../../../components/app/globals";
import {chessColumnNameFromIndex, chessRowNameFromIndex} from "../utils/chessCoords";
import {FieldLayer} from "../../../types/sudoku/FieldLayer";
import {CenteredText} from "../../../components/svg/centered-text/CenteredText";
import {Constraint} from "../../../types/sudoku/Constraint";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";
import {observer} from "mobx-react-lite";
import {profiler} from "../../../utils/profiler";

export const chessBoardIndexesMargin = 0.5;
const chessBoardIndexesFontSize = chessBoardIndexesMargin * 0.8;

export const ChessBoardIndexes = {
    [FieldLayer.regular]: observer(function ChessBoardIndexes() {
        profiler.trace();

        return <>
            {indexes(8).map(index => <CenteredText
                key={`top-${index}`}
                left={index + 0.5}
                top={-chessBoardIndexesMargin / 2}
                fill={textColor}
                size={chessBoardIndexesFontSize}
            >
                {chessColumnNameFromIndex(index)}
            </CenteredText>)}

            {indexes(8).map(index => <CenteredText
                key={`bottom-${index}`}
                left={index + 0.5}
                top={8 + chessBoardIndexesMargin / 2}
                fill={textColor}
                size={chessBoardIndexesFontSize}
            >
                {chessColumnNameFromIndex(index)}
            </CenteredText>)}

            {indexes(8).map(index => <CenteredText
                key={`left-${index}`}
                left={-chessBoardIndexesMargin / 2}
                top={index + 0.5}
                fill={textColor}
                size={chessBoardIndexesFontSize}
            >
                {chessRowNameFromIndex(index)}
            </CenteredText>)}

            {indexes(8).map(index => <CenteredText
                key={`right-${index}`}
                left={8 + chessBoardIndexesMargin / 2}
                top={index + 0.5}
                fill={textColor}
                size={chessBoardIndexesFontSize}
            >
                {chessRowNameFromIndex(index)}
            </CenteredText>)}
        </>;
    }),
};

export const ChessBoardIndexesConstraint = <T extends AnyPTM>(): Constraint<T> => ({
    name: "chess board indexes",
    cells: [],
    component: ChessBoardIndexes,
    props: undefined,
});
