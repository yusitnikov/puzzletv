import { PropsWithChildren } from "react";
import { PuzzleContextProps } from "../../../types/sudoku/PuzzleContext";
import { GoogleMapsContainer } from "./GoogleMapsContainer";
import { GoogleMap } from "./GoogleMap";
import { GoogleMapsPanePortal } from "./GoogleMapsPanePortal";
import { latLngLiteralToPosition } from "../utils/googleMapsCoords";
import { GoogleMapsOverlay } from "./GoogleMapsOverlay";
import { CellWriteMode } from "../../../types/sudoku/CellWriteMode";
import { useEventListener } from "../../../hooks/useEventListener";
import { AnyGoogleMapsPTM } from "../types/GoogleMapsPTM";
import { observer } from "mobx-react-lite";
import { settings } from "../../../types/layout/Settings";
import { profiler } from "../../../utils/profiler";

export const GoogleMapsGridWrapper = (initialBounds: google.maps.LatLngBoundsLiteral) =>
    observer(function GoogleMapsGridWrapperFc<T extends AnyGoogleMapsPTM>({
        context,
        children,
    }: PropsWithChildren<PuzzleContextProps<T>>) {
        profiler.trace();

        const {
            puzzle: {
                gridSize: { gridSize },
            },
            cellWriteMode,
            stateExtension: { map },
            cellSize,
        } = context;

        const isDragMode = cellWriteMode === CellWriteMode.move;

        useEventListener(window, "keydown", ({ key }) => {
            if (settings.isOpened || !context.isReady) {
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

        return (
            <GoogleMapsContainer>
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
                            context.onStateChange({
                                extension: { map } as Partial<T["stateEx"]>,
                            });
                        }}
                        onOverlayReady={(overlay) =>
                            context.onStateChange({
                                extension: { overlay } as Partial<T["stateEx"]>,
                            })
                        }
                        onRender={(renderVersion) =>
                            context.onStateChange({
                                extension: { renderVersion } as Partial<T["stateEx"]>,
                            })
                        }
                        onCenterChanged={(ev) =>
                            context.onStateChange({
                                extension: { center: latLngLiteralToPosition(ev.center) } as Partial<T["stateEx"]>,
                            })
                        }
                        onZoomChanged={(ev) =>
                            context.onStateChange({
                                extension: { zoom: ev.zoom } as Partial<T["stateEx"]>,
                            })
                        }
                        onClick={(ev) => console.debug("google maps click", ev.latLng.toJSON())}
                    >
                        <GoogleMapsPanePortal pane={"overlayMouseTarget"}>
                            <div style={{ pointerEvents: "none" }}>
                                <GoogleMapsOverlay gridSize={gridSize * cellSize}>{children}</GoogleMapsOverlay>
                            </div>
                        </GoogleMapsPanePortal>
                    </GoogleMap>
                </div>
            </GoogleMapsContainer>
        );
    });
