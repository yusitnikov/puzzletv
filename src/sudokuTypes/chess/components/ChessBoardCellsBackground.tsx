import {indexes} from "../../../utils/indexes";
import {lightGreyColor} from "../../../components/app/globals";

export const ChessBoardCellsBackground = () => <>
    {indexes(8).flatMap(
        x => indexes(8).map(
            y => (x + y) % 2
                ? <rect
                    key={`${x}-${y}`}
                    x={x}
                    y={y}
                    width={1}
                    height={1}
                    fill={lightGreyColor}
                />
                : undefined
        )
    )}
</>;
