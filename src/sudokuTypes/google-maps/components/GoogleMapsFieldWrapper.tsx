import {PropsWithChildren} from "react";
import {PuzzleContextProps} from "../../../types/sudoku/PuzzleContext";
import {GoogleMapsContainer} from "./GoogleMapsContainer";
import {GoogleMap} from "./GoogleMap";
import {GoogleMapsPanePortal} from "./GoogleMapsPanePortal";
import {latLngLiteralToPosition} from "../utils/googleMapsCoords";
import {GoogleMapsOverlay} from "./GoogleMapsOverlay";
import {CellWriteMode} from "../../../types/sudoku/CellWriteMode";
import {useEventListener} from "../../../hooks/useEventListener";
import {AnyGoogleMapsPTM} from "../types/GoogleMapsPTM";

export const GoogleMapsFieldWrapper = (initialBounds: google.maps.LatLngBoundsLiteral) =>
    function GoogleMapsFieldWrapperComponent<T extends AnyGoogleMapsPTM>(
        {
            context: {
                puzzle: {fieldSize: {fieldSize}},
                state: {
                    isShowingSettings,
                    processed: {cellWriteMode, isReady},
                    extension: {map},
                },
                onStateChange,
                cellSize,
            },
            children
        }: PropsWithChildren<PuzzleContextProps<T>>
    ) {
        const isDragMode = cellWriteMode === CellWriteMode.move;

        useEventListener(window, "keydown", ({key}) => {
            if (isShowingSettings || !isReady) {
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
                        onStateChange(() => ({
                            extension: {map} as Partial<T["stateEx"]>
                        }));
                    }}
                    onOverlayReady={(overlay) => onStateChange({
                        extension: {overlay} as Partial<T["stateEx"]>
                    })}
                    onRender={(renderVersion) => onStateChange({
                        extension: {renderVersion} as Partial<T["stateEx"]>
                    })}
                    onCenterChanged={(ev) => onStateChange({
                        extension: {center: latLngLiteralToPosition(ev.center)} as Partial<T["stateEx"]>
                    })}
                    onZoomChanged={(ev) => onStateChange({
                        extension: {zoom: ev.zoom} as Partial<T["stateEx"]>
                    })}
                    onClick={(ev) => console.debug("google maps click", ev.latLng.toJSON())}
                >
                    <GoogleMapsPanePortal pane={"overlayMouseTarget"}>
                        <div style={{pointerEvents: "none"}}>
                            <GoogleMapsOverlay fieldSize={fieldSize * cellSize}>
                                {children}
                            </GoogleMapsOverlay>
                        </div>
                    </GoogleMapsPanePortal>
                </GoogleMap>
            </div>
        </GoogleMapsContainer>;
    };
