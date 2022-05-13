import {FC} from "react";
import {Status, Wrapper} from "@googlemaps/react-wrapper";
import {GoogleMapsApiContext} from "../contexts/GoogleMapsApiContext";

export const GoogleMapsContainer: FC = ({children}) => <Wrapper
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
