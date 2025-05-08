import { PTM } from "../../../types/puzzle/PuzzleTypeMap";
import { GoogleMapsState } from "./GoogleMapsState";

export type GoogleMapsPTM<CellType = number> = PTM<CellType, GoogleMapsState>;

export type AnyGoogleMapsPTM = GoogleMapsPTM<any>;
