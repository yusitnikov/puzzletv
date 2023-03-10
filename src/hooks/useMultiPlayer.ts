import {Types} from "ably/promises";
import {useAblyChannelPresence, useSetMyAblyChannelPresence} from "./useAbly";
import {useCallback, useEffect, useMemo, useState} from "react";
import {usePureMemo} from "./usePureMemo";
import {useTranslate} from "./useTranslate";
import {useLastValueRef} from "./useLastValueRef";

export const myClientId: string = (window.localStorage.clientId = window.localStorage.clientId || Math.random().toString().substring(2));

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

export interface MessageWithClientId {
    data: any;
    clientId: string;
}

export interface UseMultiPlayerResult {
    isLoaded: boolean;
    isEnabled: boolean;
    hostId: string;
    isHost: boolean;
    isDoubledConnected: boolean;
    allPlayerIds: string[];
    playerNicknames: Record<string, string>;
    playersDataMap: Record<string, PlayerPresenceData>;
    hostData?: any;
    myPendingMessages: Message[];
    sendMessage: (message: any) => void;
}

export const useMultiPlayer = (
    gameId: string,
    hostId: string,
    roomId: string,
    myNickname: string,
    myHostData: any,
    onMessages: (messages: MessageWithClientId[]) => void
): UseMultiPlayerResult => {
    const translate = useTranslate();

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

    const allPlayerIds = useMemo(() => {
        const allIds = Object.keys(playersDataMap);

        return [
            ...allIds.filter(id => comparePlayerIds(id, hostId) >= 0).sort(comparePlayerIds),
            ...allIds.filter(id => comparePlayerIds(id, hostId) < 0).sort(comparePlayerIds),
        ];
    }, [playersDataMap, hostId]);

    const hostStr = translate("host");
    const guestStr = translate("guest");
    const playerNicknames = useMemo(
        () => Object.fromEntries(Object.values(playersDataMap).map(({clientId, data}) => [
            clientId,
            (clientId === myClientId ? myNickname : data?.nickname || "") || (clientId === hostId ? hostStr : `${guestStr}#${clientId.substring(0, 4)}`),
        ])),
        [playersDataMap, myNickname, hostId, hostStr, guestStr]
    );

    const {data: hostData, processed: hostProcessedMessageIds} = playersDataMap[hostId]?.data || {};
    const myProcessedMessageId = hostProcessedMessageIds?.[myClientId] || 0;

    const [myMessages, setMyMessages] = useState<Message[]>([]);
    const sendMessage = useCallback(
        (data: any) => setTimeout(() => setMyMessages(messages => [...messages, {id: Date.now(), data}])),
        [setMyMessages]
    );

    const [processedMessageIds, setProcessedMessageIds] = useState<Record<string, number>>({});

    const onMessagesRef = useLastValueRef(onMessages);
    useEffect(() => {
        if (!isHost) {
            return;
        }

        setProcessedMessageIds(processedMessageIds => {
            const newProcessedMessageIds = {...processedMessageIds};
            const messagesToProcess: MessageWithClientId[] = [];

            for (const {clientId, data: presenceData} of Object.values(playersDataMap)) {
                if (clientId === myClientId) {
                    continue;
                }

                const processedMessageId = processedMessageIds[clientId] || 0;

                for (const {id, data} of presenceData?.messages || [] as Message[]) {
                    if (id <= processedMessageId) {
                        continue;
                    }

                    messagesToProcess.push({data, clientId});
                    newProcessedMessageIds[clientId] = id;
                }
            }

            if (messagesToProcess.length) {
                try {
                    onMessagesRef.current(messagesToProcess);
                } catch (err) {
                    console.error(err);
                }

                return newProcessedMessageIds;
            } else {
                return processedMessageIds;
            }
        });
    }, [isHost, setProcessedMessageIds, playersDataMap, onMessagesRef]);

    const myPendingMessages = useMemo(
        () => myMessages.filter(({id}) => id > myProcessedMessageId),
        [myMessages, myProcessedMessageId]
    );
    const myPendingMessagesSliced = useMemo(
        () => myPendingMessages.slice(0, 50),
        [myPendingMessages]
    );

    const dataToSend = useMemo(() => {
        const sharedData = {
            nickname: myNickname,
        };

        return isHost
            ? {
                ...sharedData,
                data: myHostData,
                processed: processedMessageIds,
            }
            : {
                ...sharedData,
                messages: myPendingMessagesSliced
            };
    }, [isHost, myNickname, myHostData, myPendingMessagesSliced, processedMessageIds]);
    useSetMyAblyChannelPresence(ablyOptions, channelName, dataToSend, isEnabled);

    return usePureMemo({
        isLoaded,
        isEnabled,
        hostId,
        isHost,
        isDoubledConnected: playersDataMap[myClientId]?.connectionsCount > 1,
        allPlayerIds,
        playerNicknames,
        playersDataMap,
        hostData,
        myPendingMessages,
        sendMessage,
    });
};

export const comparePlayerIds = (a: string, b: string) => a.localeCompare(b);

export const getNextPlayerId = (currentPlayerId: string, allPlayerIds: string[]) => {
    const sortedPlayerIds = allPlayerIds.sort(comparePlayerIds);

    return sortedPlayerIds.find(id => comparePlayerIds(id, currentPlayerId) > 0) ?? sortedPlayerIds[0];
};
