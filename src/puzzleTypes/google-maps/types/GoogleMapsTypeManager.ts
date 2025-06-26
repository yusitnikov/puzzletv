import { defaultProcessArrowDirection, PuzzleTypeManager } from "../../../types/puzzle/PuzzleTypeManager";
import { emptyPosition, Position } from "../../../types/layout/Position";
import { mergeGameStateUpdates, PartialGameStateEx } from "../../../types/puzzle/GameState";
import { positionToLatLngLiteral } from "../utils/googleMapsCoords";
import { MovePuzzleInputModeInfo } from "../../../types/puzzle/inputModes/move";
import { AnyGoogleMapsPTM } from "./GoogleMapsPTM";
import { GoogleMapsGridWrapper } from "../components/GoogleMapsGridWrapper";

export const GoogleMapsTypeManager = <T extends AnyGoogleMapsPTM>(
    baseTypeManager: PuzzleTypeManager<T>,
    initialBounds: google.maps.LatLngBoundsLiteral,
): PuzzleTypeManager<T> => ({
    ...baseTypeManager,
    gridWrapperComponent: GoogleMapsGridWrapper(initialBounds),
    gridFitsWrapper: true,
    extraInputModes: [
        ...(baseTypeManager.extraInputModes ?? []),
        {
            ...MovePuzzleInputModeInfo(),
            disableCellHandlers: true,
        },
    ],
    initialGameStateExtension: {
        zoom: 0,
        center: emptyPosition,
        map: undefined as any,
        overlay: undefined as any,
        renderVersion: 0,
    } as T["stateEx"],
    keepStateOnRestart(context): PartialGameStateEx<T> {
        const {
            stateExtension: { zoom, center, map, overlay, renderVersion },
        } = context;

        return mergeGameStateUpdates(baseTypeManager.keepStateOnRestart?.(context) ?? {}, {
            extension: { zoom, center, map, overlay, renderVersion },
        });
    },
    transformCoords(coords, context): Position {
        coords = baseTypeManager.transformCoords?.(coords, context) || coords;

        const projection = context.stateExtension.overlay?.getProjection();
        if (!projection) {
            return coords;
        }

        const { x, y } = projection.fromLatLngToContainerPixel(new google.maps.LatLng(positionToLatLngLiteral(coords)));
        return {
            left: x,
            top: y,
        };
    },
    isNonLinearTransformCoords: true,
    processArrowDirection(cell, xDirection, yDirection, context, isMainKeyboard) {
        return (baseTypeManager.processArrowDirection || defaultProcessArrowDirection)(
            cell,
            xDirection,
            -yDirection,
            context,
            isMainKeyboard,
        );
    },
});
