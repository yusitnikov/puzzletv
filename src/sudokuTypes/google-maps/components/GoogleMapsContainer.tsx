import {FC} from "react";
import {Status, Wrapper} from "@googlemaps/react-wrapper";
import {GoogleMapsApiContext} from "../contexts/GoogleMapsApiContext";
import {observer} from "mobx-react-lite";
import {profiler} from "../../../utils/profiler";

export const GoogleMapsContainer: FC = observer(function GoogleMapsContainer({children}) {
    profiler.trace();

    return <Wrapper
        apiKey={"AIzaSyBZiaVNC0uzZkIeVW_G_gG1fWflAa0M8Vo"}
        language={"en"}
        render={(status) => {
            switch (status) {
                case Status.FAILURE:
                    return <div>Failed to load the map :(</div>;
                case Status.LOADING:
                    return <div/>;
                case Status.SUCCESS:
                    return <GoogleMapsApiContext.Provider value={(window as any).google}>
                        {children}
                    </GoogleMapsApiContext.Provider>;
            }
        }}
    />;
});
