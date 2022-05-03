import {indexes} from "../../../utils/indexes";
import {lightGreyColor} from "../../../components/app/globals";
import {withFieldLayer} from "../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../types/sudoku/FieldLayer";

export interface ChessBoardCellsBackgroundProps {
    shifted?: boolean;
}

export const ChessBoardCellsBackground = withFieldLayer(FieldLayer.beforeBackground, ({shifted}: ChessBoardCellsBackgroundProps) => <>
    {indexes(8).flatMap(
        x => indexes(8).map(
            y => {
                const isBlackSquare = (x + y) % 2;
                const isLeft = x < 4;
                const isTop = y < 4;
                const isMainSquare = isLeft === isTop;

                const color = isBlackSquare
                    ? shifted
                        ? isMainSquare
                            ? "#b85621"
                            : "#ac9120"
                        : lightGreyColor
                    : shifted
                        ? isMainSquare
                            ? "#edb79a"
                            : "#ebd992"
                        : undefined;

                return color && <rect
                    key={`${x}-${y}`}
                    x={x + (shifted && !isTop ? 1 : 0)}
                    y={y + (shifted && isLeft ? 1 : 0)}
                    width={1}
                    height={1}
                    fill={color}
                />;
            }
        )
    )}
</>);
