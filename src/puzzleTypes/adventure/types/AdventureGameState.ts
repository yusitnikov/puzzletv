export interface AdventureGameState {
    message: string | undefined;
    messageChoice1: string;
    messageChoice2: string;
    messageChoice1Taken: string;
    messageChoice2Taken: string;
    messageTaken: string | undefined;
    introViewed: boolean | undefined;
}