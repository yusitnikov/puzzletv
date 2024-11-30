/*
 *   lat
 *    A
 *    |
 * ---|----> lng
 *    |
 */

import { Position } from "../../../types/layout/Position";

export const positionToLatLngLiteral = ({ top: lat, left: lng }: Position): google.maps.LatLngLiteral => ({ lat, lng });

export const latLngLiteralToPosition = ({ lat: top, lng: left }: google.maps.LatLngLiteral): Position => ({
    top,
    left,
});
