import { ClientOptions } from "ably";
import { myClientId } from "../../../hooks/useMultiPlayer";

export const matchPointAblyOptions: ClientOptions = {
    key: "rkOvZw.6Icfbw:VmbfYny1jIczARaMFtyIbjDpKi_tl6UrSAuZtG929nA",
    clientId: myClientId,
};

export const getMatchPointHostChannelName = (gameId: string) => `matchPointHost-${gameId}`;

export const getMatchPointPlayerChannelName = (host: string, gameId: string) => `matchPointPlayer-${host}-${gameId}`;
