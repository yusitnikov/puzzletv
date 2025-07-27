export interface AdventureGameState {
    message: string | undefined;
    messageChoice1: string;
    messageChoice2: string;
    option1SolutionMessage: string
    messageChoice1Taken: string;
    messageChoice2Taken: string;
    option2SolutionMessage: string;
    messageTaken: string | undefined;
}