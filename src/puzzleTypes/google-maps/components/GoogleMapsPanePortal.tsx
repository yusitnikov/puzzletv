import { FC } from "react";
import { createPortal } from "react-dom";
import { useGoogleMapPanes } from "../contexts/GoogleMapContext";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../utils/profiler";

export interface GoogleMapsPanePortalProps {
    pane: keyof google.maps.MapPanes;
}

export const GoogleMapsPanePortal: FC<GoogleMapsPanePortalProps> = observer(function GoogleMapsPanePortal({
    pane,
    children,
}) {
    profiler.trace();

    const panes = useGoogleMapPanes();

    return panes && panes[pane] && createPortal(children, panes[pane]);
});
