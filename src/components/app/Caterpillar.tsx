import {observer} from "mobx-react-lite";
import {profiler} from "../../utils/profiler";
import {useWindowSize} from "../../hooks/useWindowSize";
import {Absolute} from "../layout/absolute/Absolute";
import {getRectsBoundingBox, Rect} from "../../types/layout/Rect";
import {useAblyChannelState} from "../../hooks/useAbly";
import {ablyOptions} from "../../hooks/useMultiPlayer";
import {Position} from "../../types/layout/Position";
import {greenColor, lightGreyColor, lightRedColor} from "./globals";
import {indexes} from "../../utils/indexes";

interface CaterpillarGrid {
    data: string;
    offset: Position;
    size?: number;
    margin: {
        top?: number;
        left?: number;
        bottom?: number;
        right?: number;
    };
}

const regionBorderWidth = 0.07;
const getGridRect = ({offset, size = 6, margin: {top = 0, left = 0, bottom = 0, right = 0}}: CaterpillarGrid): Rect => {
    const fullWidth = size + left + right + regionBorderWidth;
    const fullHeight = size + top + bottom + regionBorderWidth;
    const fullSize = Math.max(fullWidth, fullHeight);

    return {
        top: offset.top - top - (fullSize - fullHeight) / 2,
        left: offset.left - left - (fullSize - fullWidth) / 2,
        width: fullSize,
        height: fullSize,
    };
};

export interface CaterpillarProps {
    readOnly: boolean;
}

export const Caterpillar = observer(function Caterpillar({readOnly}: CaterpillarProps) {
    profiler.trace();

    const windowSize = useWindowSize(!readOnly);
    const size = Math.min(windowSize.width, windowSize.height);

    const [grids = [], setGrids, connected] = useAblyChannelState<CaterpillarGrid[]>(ablyOptions, "caterpillar", []);

    const padding = 1;
    const boundingRect = getRectsBoundingBox(...grids.map(getGridRect));
    boundingRect.top -= padding;
    boundingRect.left -= padding;
    boundingRect.width += padding * 2;
    boundingRect.height += padding * 2;
    const boundingSize = Math.floor(Math.max(boundingRect.width, boundingRect.height));
    const coeff = size / boundingSize;

    return <>
        <Absolute width={size} height={size} style={{background: "#fff"}}>
            {!readOnly && <div>
                {indexes(boundingSize, true).map((x) => <Absolute
                    key={"column" + x}
                    top={0}
                    left={x * coeff}
                    width={1}
                    height={size}
                    style={{background: lightGreyColor}}
                />)}
                {indexes(boundingSize, true).map((y) => <Absolute
                    key={"row" + y}
                    left={0}
                    top={y * coeff}
                    height={1}
                    width={size}
                    style={{background: lightGreyColor}}
                />)}
            </div>}
            <div>
                {grids.map((grid, index) => {
                    const {left, top, width, height} = getGridRect(grid);

                    return <SudokuPad
                        key={index}
                        data={grid.data}
                        bounds={{
                            top: (top - boundingRect.top - regionBorderWidth / 2) * coeff,
                            left: (left - boundingRect.left - regionBorderWidth / 2) * coeff,
                            width: width * coeff,
                            height: height * coeff,
                        }}
                    />;
                })}
            </div>
        </Absolute>
        {!readOnly && <Absolute
            left={windowSize.width - 30}
            top={windowSize.height - 30}
            width={20}
            height={20}
            style={{
                borderRadius: "50%",
                background: connected ? greenColor : lightRedColor,
            }}
        />}
    </>;
});

interface SudokuPadProps {
    data: string;
    bounds: Rect;
}

const SudokuPad = observer(function SudokuPad({data, bounds}: SudokuPadProps) {
    profiler.trace();

    return <img
        src={`https://api.sudokupad.com/thumbnail/${data}_512x512.svg`}
        style={{
            position: "absolute",
            ...bounds,
        }}
    />;
});
