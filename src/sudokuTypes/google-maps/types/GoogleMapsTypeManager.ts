import {defaultProcessArrowDirection, SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {GoogleMapsState} from "./GoogleMapsState";
import {emptyPosition, Position} from "../../../types/layout/Position";
import {mergeGameStateUpdates, PartialGameStateEx} from "../../../types/sudoku/GameState";
import {positionToLatLngLiteral} from "../utils/googleMapsCoords";

export const GoogleMapsTypeManager = <CellType>(
    baseTypeManager: SudokuTypeManager<CellType, GoogleMapsState>
): SudokuTypeManager<CellType, GoogleMapsState> => ({
    ...baseTypeManager,
    initialGameStateExtension: {
        zoom: 0,
        center: emptyPosition,
        map: undefined as any,
        overlay: undefined as any,
        renderVersion: 0,
    },
    keepStateOnRestart(state): PartialGameStateEx<CellType, GoogleMapsState> {
        const {extension: {zoom, center, map, overlay, renderVersion}} = state;

        return mergeGameStateUpdates(
            baseTypeManager.keepStateOnRestart?.(state) ?? {},
            {extension: {zoom, center, map, overlay, renderVersion}},
        );
    },
    transformCoords(coords, context): Position {
        coords = baseTypeManager.transformCoords?.(coords, context) || coords;

        const projection = context.state.extension.overlay?.getProjection();
        if (!projection) {
            return coords;
        }

        const {x, y} = projection.fromLatLngToContainerPixel(new google.maps.LatLng(positionToLatLngLiteral(coords)));
        return {
            left: x,
            top: y,
        };
    },
    isOddTransformCoords: true,
    processArrowDirection(cell, xDirection, yDirection, context, isMainKeyboard) {
        return (baseTypeManager.processArrowDirection || defaultProcessArrowDirection)(cell, xDirection, -yDirection, context, isMainKeyboard);
    },
});
