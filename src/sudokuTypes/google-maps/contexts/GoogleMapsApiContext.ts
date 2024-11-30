import { createContext, useContext } from "react";

export const GoogleMapsApiContext = createContext<typeof google>(undefined as any);

export const useGoogleMapsApiContext = () => useContext(GoogleMapsApiContext);
