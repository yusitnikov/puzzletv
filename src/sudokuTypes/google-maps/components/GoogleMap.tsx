import { PropsWithChildren, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { GoogleMapContext } from "../contexts/GoogleMapContext";
import { useGoogleMapsApiContext } from "../contexts/GoogleMapsApiContext";
import { useLastValueRef } from "../../../hooks/useLastValueRef";
import { runInAction } from "mobx";
import { profiler } from "../../../utils/profiler";
import { observer } from "mobx-react-lite";

export interface CenterChangedEvent {
    center: google.maps.LatLngLiteral;
}

export interface ZoomChangedEvent {
    zoom: number;
}

export interface GoogleMapProps extends google.maps.MapOptions {
    onReady?: (map: google.maps.Map) => void;
    onOverlayReady?: (overlay: google.maps.OverlayView) => void;
    onRender?: (renderVersion: number) => void;
    onClick?: (ev: google.maps.MapMouseEvent) => void;
    onMouseMove?: (ev: google.maps.MapMouseEvent) => void;
    onCenterChanged?: (ev: CenterChangedEvent) => void;
    onZoomChanged?: (ev: ZoomChangedEvent) => void;
    // TODO: other events
}

export const GoogleMap = observer(function GoogleMapFn({
    children,
    onReady,
    onOverlayReady,
    onRender,
    onClick,
    onMouseMove,
    onCenterChanged,
    onZoomChanged,
    ...mapOptions
}: PropsWithChildren<GoogleMapProps>) {
    profiler.trace();

    const google = useGoogleMapsApiContext();

    const ref = useRef<HTMLDivElement>(null);

    const [map, setMap] = useState<google.maps.Map>();
    const [renderVersion, setRenderVersion] = useState(0);
    const [isOverlayReady, setIsOverlayReady] = useState(false);
    const [overlay] = useState(
        () =>
            new (class extends google.maps.OverlayView {
                draw() {
                    setRenderVersion((version) => version + 1);
                    setIsOverlayReady(true);
                }

                onRemove() {
                    setIsOverlayReady(false);
                }
            })(),
    );

    useLayoutEffect(
        () => {
            if (!ref.current) {
                return;
            }

            const map = new google.maps.Map(ref.current, mapOptions);
            setMap(map);
            onReady?.(map);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [ref.current, setMap],
    );

    useEffect(
        () => {
            if (isOverlayReady) {
                onOverlayReady?.(overlay);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [overlay, isOverlayReady],
    );

    useEffect(
        () => onRender?.(renderVersion),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [renderVersion],
    );

    // region All map options
    const {
        draggable,
        zoom,
        backgroundColor,
        center,
        clickableIcons,
        controlSize,
        disableDefaultUI,
        disableDoubleClickZoom,
        draggableCursor,
        draggingCursor,
        fullscreenControl,
        fullscreenControlOptions,
        gestureHandling,
        heading,
        keyboardShortcuts,
        mapTypeControl,
        mapTypeControlOptions,
        mapTypeId,
        maxZoom,
        minZoom,
        noClear,
        panControl,
        panControlOptions,
        restriction,
        rotateControl,
        rotateControlOptions,
        scaleControl,
        scaleControlOptions,
        scrollwheel,
        streetView,
        streetViewControl,
        streetViewControlOptions,
        styles,
        tilt,
        zoomControl,
        zoomControlOptions,
    } = mapOptions;
    // endregion
    useEffect(
        () => map?.setOptions(mapOptions),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
            map,
            draggable,
            zoom,
            backgroundColor,
            center,
            clickableIcons,
            controlSize,
            disableDefaultUI,
            disableDoubleClickZoom,
            draggableCursor,
            draggingCursor,
            fullscreenControl,
            fullscreenControlOptions,
            gestureHandling,
            heading,
            keyboardShortcuts,
            mapTypeControl,
            mapTypeControlOptions,
            mapTypeId,
            maxZoom,
            minZoom,
            noClear,
            panControl,
            panControlOptions,
            restriction,
            rotateControl,
            rotateControlOptions,
            scaleControl,
            scaleControlOptions,
            scrollwheel,
            streetView,
            streetViewControl,
            streetViewControlOptions,
            styles,
            tilt,
            zoomControl,
            zoomControlOptions,
        ],
    );

    useEffect(() => {
        if (!map || !overlay) {
            return;
        }

        overlay.setMap(map);

        return () => overlay.setMap(null);
    }, [overlay, map]);

    const contextData = useMemo(() => ({ map: map!, overlay, renderVersion }), [map, overlay, renderVersion]);

    const onClickRef = useLastValueRef(onClick);
    const onMouseMoveRef = useLastValueRef(onMouseMove);
    const onCenterChangedRef = useLastValueRef(onCenterChanged);
    const onZoomChangedRef = useLastValueRef(onZoomChanged);

    useEffect(() => {
        map?.addListener("click", (ev) => runInAction(() => onClickRef.current?.(ev)));
        map?.addListener("mousemove", (ev) => runInAction(() => onMouseMoveRef.current?.(ev)));
        map?.addListener("center_changed", () =>
            runInAction(() => onCenterChangedRef.current?.({ center: map!.getCenter().toJSON() })),
        );
        map?.addListener("zoom_changed", () => runInAction(() => onZoomChangedRef.current?.({ zoom: map!.getZoom() })));
    }, [map, onClickRef, onMouseMoveRef, onCenterChangedRef, onZoomChangedRef]);

    return (
        <div
            style={{
                position: "absolute",
                inset: 0,
            }}
            ref={ref}
        >
            {map && overlay && isOverlayReady && (
                <GoogleMapContext.Provider value={contextData}>{children}</GoogleMapContext.Provider>
            )}
        </div>
    );
});
