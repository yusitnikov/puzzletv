import {PropsWithChildren} from "react";
import {PuzzleContextProps} from "../../../types/sudoku/PuzzleContext";
import {GoogleMapsContainer} from "./GoogleMapsContainer";
import {GoogleMap} from "./GoogleMap";
import {GoogleMapsPanePortal} from "./GoogleMapsPanePortal";
import {GoogleMapsState} from "../types/GoogleMapsState";
import {latLngLiteralToPosition} from "../utils/googleMapsCoords";
import {GoogleMapsOverlay} from "./GoogleMapsOverlay";
import {CellWriteMode} from "../../../types/sudoku/CellWriteMode";
import {useEventListener} from "../../../hooks/useEventListener";

export const GoogleMapsFieldWrapper = (initialBounds: google.maps.LatLngBoundsLiteral) =>
    function GoogleMapsFieldWrapperComponent<CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
        {
            context: {
                puzzle: {fieldSize: {fieldSize}},
                state: {cellWriteMode, map, overlay, isReady},
                onStateChange,
                cellSize,
            },
            children
        }: PropsWithChildren<PuzzleContextProps<CellType, GameStateExtensionType & GoogleMapsState, ProcessedGameStateExtensionType & GoogleMapsState>>
    ) {
        const projection = overlay?.getProjection();
        const topLeft = projection?.fromContainerPixelToLatLng(new google.maps.Point(0, 0))?.toJSON();
        const bottomRight = projection?.fromContainerPixelToLatLng(new google.maps.Point(fieldSize * cellSize, fieldSize * cellSize))?.toJSON();

        const isDragMode = cellWriteMode === CellWriteMode.move;

        useEventListener(window, "keydown", ({key}: KeyboardEvent) => {
            if (!isReady) {
                return;
            }

            switch (key) {
                case "+":
                    map.setZoom(map.getZoom() + 1);
                    break;
                case "-":
                    map.setZoom(map.getZoom() - 1);
                    break;
            }
        });

        return <GoogleMapsContainer>
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "all",
                }}
            >
                <GoogleMap
                    streetViewControl={false}
                    fullscreenControl={false}
                    rotateControl={false}
                    keyboardShortcuts={false}
                    disableDoubleClickZoom={true}
                    draggable={isDragMode}
                    panControl={isDragMode}
                    gestureHandling={isDragMode ? "auto" : "none"}
                    onReady={(map) => {
                        map.fitBounds(initialBounds, 0);
                        onStateChange(() => ({map} as Partial<GoogleMapsState> as any));
                    }}
                    onOverlayReady={(overlay) => onStateChange({overlay} as Partial<GoogleMapsState> as any)}
                    onRender={(renderVersion) => onStateChange({renderVersion} as Partial<GoogleMapsState> as any)}
                    onCenterChanged={(ev) => onStateChange({center: latLngLiteralToPosition(ev.center)} as Partial<GoogleMapsState> as any)}
                    onZoomChanged={(ev) => onStateChange({zoom: ev.zoom} as Partial<GoogleMapsState> as any)}
                    // onClick={(ev) => console.log(ev.latLng.toJSON())}
                >
                    <GoogleMapsPanePortal pane={"overlayMouseTarget"}>
                        <div style={{pointerEvents: "none"}}>
                            <GoogleMapsOverlay bounds={{
                                east: bottomRight?.lng || 0,
                                west: topLeft?.lng || 1,
                                south: bottomRight?.lat || 1,
                                north: topLeft?.lat || 0,
                            }}>
                                {children}
                            </GoogleMapsOverlay>
                        </div>
                    </GoogleMapsPanePortal>
                </GoogleMap>
            </div>
        </GoogleMapsContainer>;
    };
