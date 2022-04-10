import {SVGAttributes} from "react";
import {indexes} from "../../../utils/indexes";
import {textColor} from "../../../components/app/globals";
import {chessColumnNameFromIndex, chessRowNameFromIndex} from "../utils/chessCoords";

export const chessBoardIndexesMargin = 0.5;
const chessBoardIndexesFontSize = chessBoardIndexesMargin * 0.8;

const commonProps: SVGAttributes<SVGTextElement> = {
    textAnchor: "middle",
    alignmentBaseline: "central",
    style: {
        fontSize: `${chessBoardIndexesFontSize}px`,
        lineHeight: `${chessBoardIndexesFontSize}px`,
    },
    fill: textColor,
};

export const ChessBoardIndexes = () => <>
    {indexes(8).map(index => <text
        key={`top-${index}`}
        x={index + 0.5}
        y={-chessBoardIndexesMargin / 2}
        {...commonProps}
    >
        {chessColumnNameFromIndex(index)}
    </text>)}

    {indexes(8).map(index => <text
        key={`bottom-${index}`}
        x={index + 0.5}
        y={8 + chessBoardIndexesMargin / 2}
        {...commonProps}
    >
        {chessColumnNameFromIndex(index)}
    </text>)}

    {indexes(8).map(index => <text
        key={`left-${index}`}
        x={-chessBoardIndexesMargin / 2}
        y={index + 0.5}
        {...commonProps}
    >
        {chessRowNameFromIndex(index)}
    </text>)}

    {indexes(8).map(index => <text
        key={`right-${index}`}
        x={8 + chessBoardIndexesMargin / 2}
        y={index + 0.5}
        {...commonProps}
    >
        {chessRowNameFromIndex(index)}
    </text>)}
</>;
