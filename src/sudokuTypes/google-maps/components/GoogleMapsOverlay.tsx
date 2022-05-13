import {FC} from "react";
import {useGoogleMapsApiContext} from "../contexts/GoogleMapsApiContext";
import {useGoogleMapProjection} from "../contexts/GoogleMapContext";

export interface GoogleMapsOverlayProps {
    bounds: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral;
}

export const GoogleMapsOverlay: FC<GoogleMapsOverlayProps> = ({bounds, children}) => {
    const google = useGoogleMapsApiContext();

    const {north, west, south, east} = bounds instanceof google.maps.LatLngBounds ? bounds.toJSON() : bounds;

    const projection = useGoogleMapProjection();
    const {x: x1, y: y1} = projection.fromLatLngToDivPixel(new google.maps.LatLng({
        lat: north,
        lng: west
    }));
    const {x: x2, y: y2} = projection.fromLatLngToDivPixel(new google.maps.LatLng({
        lat: south,
        lng: east
    }));

    const width = Math.abs(x1 - x2);
    const height = Math.abs(y1 - y2);

    return <div
        style={{
            position: "absolute",
            left: Math.min(x1, x2),
            top: Math.min(y1, y2),
            width,
            height,
            textAlign: "center",
            lineHeight: `${height}px`,
            fontSize: `${height}px`,
        }}
    >
        {children}
    </div>;
};
