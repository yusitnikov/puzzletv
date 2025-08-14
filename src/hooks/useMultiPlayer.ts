import { ClientOptions, PresenceMessage } from "ably";
import { useAblyChannelPresence, useSetMyAblyChannelPresence } from "./useAbly";
import { useEffect } from "react";
import { autorun, comparer, makeAutoObservable, runInAction } from "mobx";
import { PuzzleContext } from "../types/puzzle/PuzzleContext";
import { AnyPTM } from "../types/puzzle/PuzzleTypeMap";
import { getAllShareState } from "../types/puzzle/GameState";
import { settings } from "../types/layout/Settings";
import { profiler } from "../utils/profiler";
import { translate } from "../utils/translate";

const emptyObject = {};

export const myClientId: string = (window.localStorage.clientId =
    window.localStorage.clientId || Math.random().toString().substring(2));

const ablyOptions: ClientOptions = {
    key: "fzkxHw.6QoA4w:VLouQX2faOhELoyD3HPD9ZmXyYw62i334WrFN5HjIBQ",
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

export class UseMultiPlayerResult<T extends AnyPTM> {
    readonly context: PuzzleContext<T>;

    presenceData: PresenceMessage[] = [];
    isLoaded = false;

    private myMessages: Message[] = [];
    private processedMessageIds: Record<string, number> = {};

    get hostId() {
        profiler.trace();

        return this.context.puzzle.params?.host ?? "";
    }
    get roomId() {
        profiler.trace();

        return this.context.puzzle.params?.room ?? "";
    }
    get gameId() {
        profiler.trace();

        return `puzzle:${this.context.puzzle.saveStateKey ?? this.context.puzzle.slug}`;
    }
    get isEnabled() {
        profiler.trace();

        return !!this.hostId;
    }
    get isHost() {
        profiler.trace();

        return this.hostId === myClientId;
    }

    get playersDataMap() {
        profiler.trace();

        const map: Record<string, PlayerPresenceData> = {};

        for (const { clientId, data } of this.presenceData) {
            map[clientId] = map[clientId] || { clientId, data, connectionsCount: 0 };
            ++map[clientId].connectionsCount;
        }

        map[myClientId] = map[myClientId] || { clientId: myClientId, data: undefined, connectionsCount: 1 };

        return map;
    }
    get allPlayerIds() {
        profiler.trace();

        const allIds = Object.keys(this.playersDataMap);

        return [
            ...allIds.filter((id) => comparePlayerIds(id, this.hostId) >= 0).sort(comparePlayerIds),
            ...allIds.filter((id) => comparePlayerIds(id, this.hostId) < 0).sort(comparePlayerIds),
        ];
    }

    get playerScores() {
        profiler.trace();

        return this.allPlayerIds
            .map((clientId) => ({
                clientId,
                score: this.context.puzzle.typeManager.getPlayerScore?.(this.context, clientId) || 0,
            }))
            .sort((a, b) => (a.score < b.score ? 1 : -1));
    }

    get myScore() {
        return this.playerScores.find(({ clientId }) => clientId === myClientId)!.score;
    }

    get playerNicknames(): Record<string, string> {
        profiler.trace();

        const hostStr = translate("host");
        const guestStr = translate("guest");

        return Object.fromEntries(
            Object.values(this.playersDataMap).map(({ clientId, data }) => [
                clientId,
                (clientId === myClientId ? settings.nickname.get() : data?.nickname || "") ||
                    (clientId === this.hostId ? hostStr : `${guestStr}#${clientId.substring(0, 4)}`),
            ]),
        );
    }

    private get hostPlayerData() {
        profiler.trace();

        return this.playersDataMap[this.hostId]?.data || emptyObject;
    }
    get hostData() {
        profiler.trace();

        return this.hostPlayerData.data;
    }

    get isDoubledConnected() {
        profiler.trace();

        return this.playersDataMap[myClientId]?.connectionsCount > 1;
    }

    get myProcessedMessageId() {
        profiler.trace();

        return this.hostPlayerData.processed?.[myClientId] || 0;
    }
    get myPendingMessages() {
        profiler.trace();

        return this.myMessages.filter(({ id }) => id > this.myProcessedMessageId);
    }

    /**
     * Current player's data to share with other players (as the host)
     */
    get myHostData() {
        profiler.trace();

        const {
            isHost,
            context: { puzzle, myGameState },
        } = this;
        const { currentPlayer, playerObjects } = myGameState;

        return {
            ...(isHost &&
                (puzzle.params?.share
                    ? getAllShareState(this.context)
                    : puzzle.typeManager.getSharedState?.(puzzle, myGameState))),
            currentPlayer,
            playerObjects,
        };
    }

    get dataToSend() {
        profiler.trace();

        const sharedData = {
            nickname: settings.nickname.get(),
        };

        return this.isHost
            ? {
                  ...sharedData,
                  data: this.myHostData,
                  processed: this.processedMessageIds,
              }
            : {
                  ...sharedData,
                  messages: this.myPendingMessages.slice(0, 50),
              };
    }

    constructor(context: PuzzleContext<T>) {
        makeAutoObservable(this, {}, { equals: comparer.structural });

        this.context = context;
    }

    sendMessage(data: any) {
        setTimeout(() =>
            runInAction(() => {
                this.myMessages.push({ id: Date.now(), data });
            }),
        );
    }

    processPendingMessages(onMessages: (messages: MessageWithClientId[]) => void) {
        if (!this.isHost) {
            return;
        }

        const newProcessedMessageIds = { ...this.processedMessageIds };
        const messagesToProcess: MessageWithClientId[] = [];

        for (const { clientId, data: presenceData } of Object.values(this.playersDataMap)) {
            if (clientId === myClientId) {
                continue;
            }

            const processedMessageId = this.processedMessageIds[clientId] || 0;

            for (const { id, data } of presenceData?.messages || ([] as Message[])) {
                if (id <= processedMessageId) {
                    continue;
                }

                messagesToProcess.push({ data, clientId });
                newProcessedMessageIds[clientId] = id;
            }
        }

        if (!messagesToProcess.length) {
            return;
        }

        try {
            onMessages(messagesToProcess);
        } catch (err) {
            console.error(err);
        }
        this.processedMessageIds = newProcessedMessageIds;
    }
}

export const useMultiPlayer = <T extends AnyPTM>(multiPlayer: UseMultiPlayerResult<T>) => {
    const channelName = `game:${multiPlayer.gameId}:${multiPlayer.hostId}:${multiPlayer.roomId}`;

    const [presenceData, isLoaded] = useAblyChannelPresence(ablyOptions, channelName, multiPlayer.isEnabled);
    runInAction(() => {
        multiPlayer.isLoaded = isLoaded;
    });
    useEffect(
        () =>
            runInAction(function updatePresenceData() {
                multiPlayer.presenceData = presenceData;
            }),
        [multiPlayer, presenceData],
    );

    useEffect(
        () =>
            autorun(function mergeHostDataToStateAutorun() {
                profiler.trace();

                multiPlayer.context.mergeHostDataToState();
            }),
        [multiPlayer],
    );

    useEffect(
        () =>
            autorun(function processPendingMessagesAutorun() {
                profiler.trace();

                multiPlayer.processPendingMessages((messages) =>
                    multiPlayer.context.update({
                        myGameState: multiPlayer.context.processMessages(messages),
                    }),
                );
            }),
        [multiPlayer],
    );

    useSetMyAblyChannelPresence(ablyOptions, channelName, multiPlayer.dataToSend, multiPlayer.isEnabled);
};

export const comparePlayerIds = (a: string, b: string) => a.localeCompare(b);

export const getNextPlayerId = (currentPlayerId: string, allPlayerIds: string[]) => {
    const sortedPlayerIds = allPlayerIds.sort(comparePlayerIds);

    return sortedPlayerIds.find((id) => comparePlayerIds(id, currentPlayerId) > 0) ?? sortedPlayerIds[0];
};
