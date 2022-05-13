import {FC} from "react";
import {createPortal} from "react-dom";
import {useGoogleMapPanes} from "../contexts/GoogleMapContext";

export interface GoogleMapsPanePortalProps {
    pane: keyof google.maps.MapPanes;
}

export const GoogleMapsPanePortal: FC<GoogleMapsPanePortalProps> = ({pane, children}) => {
    const panes = useGoogleMapPanes();

    return panes && panes[pane] && createPortal(children, panes[pane]);
};
