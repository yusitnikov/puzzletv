import {createContext, useContext} from "react";

export interface GoogleMapContextData {
    map: google.maps.Map;
    overlay: google.maps.OverlayView;
    renderVersion: number;
}

export const GoogleMapContext = createContext<GoogleMapContextData>({
    map: undefined as any,
    overlay: undefined as any,
    renderVersion: 0
});

export const useGoogleMapContext = () => useContext(GoogleMapContext);

export const useGoogleMap = () => useGoogleMapContext().map;

export const useGoogleMapProjection = () => useGoogleMapContext().overlay.getProjection();

export const useGoogleMapPanes = () => useGoogleMapContext().overlay.getPanes();
