export const getMatchPointHostChannelName = (gameId: string) => `matchPointHost-${gameId}`;

export const getMatchPointPlayerChannelName = (host: string, gameId: string) => `matchPointPlayer-${host}-${gameId}`;
