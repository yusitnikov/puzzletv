import { FC } from "react";
import { useGoogleMapProjection } from "../contexts/GoogleMapContext";
import { profiler } from "../../../utils/profiler";
import { observer } from "mobx-react-lite";

export interface GoogleMapsOverlayProps {
    gridSize: number;
}

export const GoogleMapsOverlay: FC<GoogleMapsOverlayProps> = observer(function GoogleMapsOverlay({
    gridSize,
    children,
}) {
    profiler.trace();

    const projection = useGoogleMapProjection();
    if (!projection) {
        return null;
    }

    const { x, y } = projection.fromLatLngToDivPixel(
        projection.fromContainerPixelToLatLng(new google.maps.Point(0, 0)),
    );

    return (
        <div
            style={{
                position: "absolute",
                left: x,
                top: y,
                width: gridSize,
                height: gridSize,
                textAlign: "center",
                lineHeight: `${gridSize}px`,
                fontSize: `${gridSize}px`,
            }}
        >
            {children}
        </div>
    );
});
