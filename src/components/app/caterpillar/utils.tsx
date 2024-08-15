import {CaterpillarGrid} from "./types";
import {WindowSize} from "../../../hooks/useWindowSize";
import {getRectsBoundingBox, Rect} from "../../../types/layout/Rect";
import {safetyMargin} from "./globals";

const regionBorderWidth = 0.07;

export const getGridRect = ({offset, size = 6}: CaterpillarGrid): Rect => {
    const fullWidth = size + safetyMargin * 2 + regionBorderWidth;
    const fullHeight = size + safetyMargin * 2 + regionBorderWidth;
    const fullSize = Math.max(fullWidth, fullHeight);

    return {
        top: offset.top - safetyMargin - (fullSize - fullHeight) / 2,
        left: offset.left - safetyMargin - (fullSize - fullWidth) / 2,
        width: fullSize,
        height: fullSize,
    };
};

export const getDimensions = (grids: CaterpillarGrid[], windowSize: WindowSize, readOnly: boolean) => {
    const padding = readOnly ? 1 : 6;
    const boundingRect = {...getRectsBoundingBox(...grids.map(getGridRect))};
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

    return {coeff, transformRect};
};
