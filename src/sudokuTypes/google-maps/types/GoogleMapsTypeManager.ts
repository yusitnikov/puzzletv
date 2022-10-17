import {defaultProcessArrowDirection, SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {GoogleMapsState} from "./GoogleMapsState";
import {emptyPosition, Position} from "../../../types/layout/Position";
import {GameState} from "../../../types/sudoku/GameState";
import {positionToLatLngLiteral} from "../utils/googleMapsCoords";

export const GoogleMapsTypeManager = <CellType>(
    baseTypeManager: SudokuTypeManager<CellType, GoogleMapsState, GoogleMapsState>
): SudokuTypeManager<CellType, GoogleMapsState, GoogleMapsState> => ({
    ...baseTypeManager,
    initialGameStateExtension: {
        zoom: 0,
        center: emptyPosition,
        map: undefined as any,
        overlay: undefined as any,
        renderVersion: 0,
    },
    keepStateOnRestart(state): Partial<GameState<CellType> & GoogleMapsState> {
        const {zoom, center, map, overlay, renderVersion} = state;

        return {...baseTypeManager.keepStateOnRestart?.(state), zoom, center, map, overlay, renderVersion};
    },
    transformCoords(coords, puzzle, state, cellSize): Position {
        coords = baseTypeManager.transformCoords?.(coords, puzzle, state, cellSize) || coords;

        const projection = state.overlay?.getProjection();
        if (!projection) {
            return coords;
        }

        const {x, y} = projection.fromLatLngToContainerPixel(new google.maps.LatLng(positionToLatLngLiteral(coords)));
        return {
            left: x,
            top: y,
        };
    },
    processArrowDirection(cell, xDirection, yDirection, context, isMainKeyboard): Position | undefined {
        return (baseTypeManager.processArrowDirection || defaultProcessArrowDirection)(cell, xDirection, -yDirection, context, isMainKeyboard);
    },
});
