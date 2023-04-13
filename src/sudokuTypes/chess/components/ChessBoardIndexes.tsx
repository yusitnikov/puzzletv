import {indexes} from "../../../utils/indexes";
import {textColor} from "../../../components/app/globals";
import {chessColumnNameFromIndex, chessRowNameFromIndex} from "../utils/chessCoords";
import {withFieldLayer} from "../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../types/sudoku/FieldLayer";
import {CenteredText} from "../../../components/svg/centered-text/CenteredText";
import {ComponentType} from "react";
import {Constraint, ConstraintProps} from "../../../types/sudoku/Constraint";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";

export const chessBoardIndexesMargin = 0.5;
const chessBoardIndexesFontSize = chessBoardIndexesMargin * 0.8;

export interface ChessBoardIndexesProps {
    shifted?: boolean;
}

export const ChessBoardIndexes = withFieldLayer(FieldLayer.regular, ({shifted}: ChessBoardIndexesProps) => <>
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
        left={index + (shifted ? 1 : 0) + 0.5}
        top={8 + (shifted ? 1 : 0) + chessBoardIndexesMargin / 2}
        fill={textColor}
        size={chessBoardIndexesFontSize}
    >
        {chessColumnNameFromIndex(index)}
    </CenteredText>)}

    {indexes(8).map(index => <CenteredText
        key={`left-${index}`}
        left={-chessBoardIndexesMargin / 2}
        top={index + (shifted ? 1 : 0) + 0.5}
        fill={textColor}
        size={chessBoardIndexesFontSize}
    >
        {chessRowNameFromIndex(index)}
    </CenteredText>)}

    {indexes(8).map(index => <CenteredText
        key={`right-${index}`}
        left={8 + (shifted ? 1 : 0) + chessBoardIndexesMargin / 2}
        top={index + 0.5}
        fill={textColor}
        size={chessBoardIndexesFontSize}
    >
        {chessRowNameFromIndex(index)}
    </CenteredText>)}
</>);

export const ChessBoardIndexesConstraint = <T extends AnyPTM>(): Constraint<T> => ({
    name: "chess board indexes",
    cells: [],
    component: ChessBoardIndexes as ComponentType<ConstraintProps<T>>,
    props: undefined,
});
