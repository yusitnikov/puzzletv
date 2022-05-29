import {Types} from "ably/promises";
import {useAblyChannelPresence, useSetMyAblyChannelPresence} from "./useAbly";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {usePureMemo} from "./usePureMemo";

export const myClientId = (window.localStorage.clientId = window.localStorage.clientId || Math.random().toString().substring(2));

export const ablyOptions: Types.ClientOptions = {
    key: "fzkxHw.SEUR7g:J1rgfUWwc397XqQ34wjLftylIcQlAWZeJHxV-bFpPuM",
    clientId: myClientId,
};

interface PlayerPresenceData {
    clientId: string;
    connectionsCount: number;
    data: any;
}

interface Message {
    id: number;
    data: any;
}

export interface UseMultiPlayerResult {
    isLoaded: boolean;
    isEnabled: boolean;
    hostId: string;
    isHost: boolean;
    isDoubledConnected: boolean;
    allPlayerIds: string[];
    playersDataMap: Record<string, PlayerPresenceData>;
    hostData?: any;
    sendMessage: (message: any) => void;
}

export const useMultiPlayer = (
    gameId: string,
    hostId: string,
    roomId: string,
    myHostData: any,
    onMessage: (message: any, clientId: string) => void
): UseMultiPlayerResult => {
    const channelName = `game:${gameId}:${hostId}:${roomId}`;
    const isEnabled = !!hostId;
    const isHost = hostId === myClientId;

    const [presenceData, isLoaded] = useAblyChannelPresence(ablyOptions, channelName, isEnabled);

    const playersDataMap = usePureMemo<Record<string, PlayerPresenceData>>(() => {
        const map: Record<string, PlayerPresenceData> = {};

        for (const {clientId, data} of presenceData) {
            map[clientId] = map[clientId] || {clientId, data, connectionsCount: 0};
            ++map[clientId].connectionsCount;
        }

        map[myClientId] = map[myClientId] || {clientId: myClientId, data: undefined, connectionsCount: 1};

        return map;
    }, [presenceData]);

    const allPlayerIds = useMemo(() => Object.keys(playersDataMap).sort(), [playersDataMap]);

    const {data: hostData, processed: hostProcessedMessageIds} = playersDataMap[hostId]?.data || {};
    const myProcessedMessageId = hostProcessedMessageIds?.[myClientId] || 0;

    const [myMessages, setMyMessages] = useState<Message[]>([]);
    const sendMessage = useCallback(
        (data: any) => setMyMessages(messages => [...messages, {id: Date.now(), data}]),
        [setMyMessages]
    );

    const [processedMessageIds, setProcessedMessageIds] = useState<Record<string, number>>({});

    const onMessageRef = useRef(onMessage);
    onMessageRef.current = onMessage;
    useEffect(() => {
        if (!isHost) {
            return;
        }

        setProcessedMessageIds(processedMessageIds => {
            const newProcessedMessageIds = {...processedMessageIds};
            let changed = false;

            for (const {clientId, data: messages} of Object.values(playersDataMap)) {
                if (clientId === myClientId) {
                    continue;
                }

                const processedMessageId = processedMessageIds[clientId] || 0;

                for (const {id, data} of messages as Message[]) {
                    if (id <= processedMessageId) {
                        continue;
                    }

                    try {
                        onMessageRef.current(data, clientId);
                    } catch (err) {
                        console.error(err);
                    }
                    newProcessedMessageIds[clientId] = id;
                    changed = true;
                }
            }

            return changed ? newProcessedMessageIds : processedMessageIds;
        });
    }, [isHost, setProcessedMessageIds, playersDataMap, onMessageRef]);

    const dataToSend = useMemo(() => {
        return isHost
            ? {
                data: myHostData,
                processed: processedMessageIds,
            }
            : myMessages.filter(({id}) => id > myProcessedMessageId);
    }, [isHost, myHostData, myMessages, processedMessageIds, myProcessedMessageId]);
    useSetMyAblyChannelPresence(ablyOptions, channelName, dataToSend, isEnabled);

    return usePureMemo({
        isLoaded,
        isEnabled,
        hostId,
        isHost,
        isDoubledConnected: playersDataMap[myClientId]?.connectionsCount > 1,
        allPlayerIds,
        playersDataMap,
        hostData,
        sendMessage,
    });
};
