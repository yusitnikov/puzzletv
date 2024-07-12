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

    const [grids = [], setGrids, connected] = useAblyChannelState<CaterpillarGrid[]>(ablyOptions, "caterpillar", []);

    const padding = 1;
    const boundingRect = getRectsBoundingBox(...grids.map(getGridRect));
    boundingRect.top -= padding;
    boundingRect.left -= padding;
    boundingRect.width += padding * 2;
    boundingRect.height += padding * 2;

    const coeff = Math.min(windowSize.width / boundingRect.width, windowSize.height / boundingRect.height);

    const transformRect = ({top, left, width, height}: Rect): Rect => ({
        top: (top - boundingRect.top - regionBorderWidth / 2) * coeff,
        left: (left - boundingRect.left - regionBorderWidth / 2) * coeff,
        width: width * coeff,
        height: height * coeff,
    });

    return <>
        <Absolute {...windowSize}>
            {!readOnly && <div>
                {indexes(Math.ceil(windowSize.width / coeff), true).map((x) => <Absolute
                    key={"column" + x}
                    top={0}
                    left={x * coeff}
                    width={1}
                    height={windowSize.height}
                    style={{background: lightGreyColor}}
                />)}
                {indexes(Math.ceil(windowSize.height / coeff), true).map((y) => <Absolute
                    key={"row" + y}
                    left={0}
                    top={y * coeff}
                    height={1}
                    width={windowSize.width}
                    style={{background: lightGreyColor}}
                />)}
            </div>}
            <div>
                {grids.map(({offset, size = 6}, index) => <Absolute
                    key={"background" + index}
                    {...transformRect({...offset, width: size, height: size})}
                    style={{background: "#fff"}}
                />)}

                {grids.map((grid, index) => <SudokuPad
                    key={"SudokuPad" + index}
                    data={grid.data}
                    bounds={transformRect(getGridRect(grid))}
                />)}
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
