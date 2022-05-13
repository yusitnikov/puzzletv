import {Position} from "../../../types/layout/Position";

export interface GoogleMapsState {
    map: google.maps.Map;
    overlay: google.maps.OverlayView;
    renderVersion: number;
    center: Position;
    zoom: number;
}
