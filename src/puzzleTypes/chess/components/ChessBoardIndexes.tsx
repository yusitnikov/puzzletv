import { indexes } from "../../../utils/indexes";
import { textColor } from "../../../components/app/globals";
import { chessColumnNameFromIndex, chessRowNameFromIndex } from "../utils/chessCoords";
import { GridLayer } from "../../../types/puzzle/GridLayer";
import { CenteredText } from "../../../components/svg/centered-text/CenteredText";
import { Constraint, ConstraintProps, ConstraintPropsGenericFcMap } from "../../../types/puzzle/Constraint";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../utils/profiler";

export const chessBoardIndexesMargin = 0.5;
const chessBoardIndexesFontSize = chessBoardIndexesMargin * 0.8;

export const ChessBoardIndexes: ConstraintPropsGenericFcMap = {
    [GridLayer.regular]: observer(function ChessBoardIndexes<T extends AnyPTM>({
        context: {
            puzzle: {
                gridSize: { gridSize },
            },
        },
    }: ConstraintProps<T>) {
        profiler.trace();

        const offset = gridSize / 2 - 4;

        return (
            <>
                {indexes(8).map((index) => (
                    <CenteredText
                        key={`top-${index}`}
                        left={offset + index + 0.5}
                        top={offset - chessBoardIndexesMargin / 2}
                        fill={textColor}
                        size={chessBoardIndexesFontSize}
                    >
                        {chessColumnNameFromIndex(index)}
                    </CenteredText>
                ))}

                {indexes(8).map((index) => (
                    <CenteredText
                        key={`bottom-${index}`}
                        left={offset + index + 0.5}
                        top={offset + 8 + chessBoardIndexesMargin / 2}
                        fill={textColor}
                        size={chessBoardIndexesFontSize}
                    >
                        {chessColumnNameFromIndex(index)}
                    </CenteredText>
                ))}

                {indexes(8).map((index) => (
                    <CenteredText
                        key={`left-${index}`}
                        left={offset - chessBoardIndexesMargin / 2}
                        top={offset + index + 0.5}
                        fill={textColor}
                        size={chessBoardIndexesFontSize}
                    >
                        {chessRowNameFromIndex(index)}
                    </CenteredText>
                ))}

                {indexes(8).map((index) => (
                    <CenteredText
                        key={`right-${index}`}
                        left={offset + 8 + chessBoardIndexesMargin / 2}
                        top={offset + index + 0.5}
                        fill={textColor}
                        size={chessBoardIndexesFontSize}
                    >
                        {chessRowNameFromIndex(index)}
                    </CenteredText>
                ))}
            </>
        );
    }),
};

export const ChessBoardIndexesConstraint = <T extends AnyPTM>(): Constraint<T> => ({
    name: "chess board indexes",
    cells: [],
    component: ChessBoardIndexes,
    props: undefined,
});
