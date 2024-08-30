import {makeAutoObservable, runInAction} from "mobx";
import {buildLink} from "../../../utils/link";
import {LanguageCode} from "../../../types/translations/LanguageCode";
import {myClientId} from "../../../hooks/useMultiPlayer";

export enum MatchPointGameState {
    HomePage,
    Setting,
    Answer,
    Match,
}

export class MatchPointGameController {
    state = MatchPointGameState.HomePage;
    gameId = "";
    private questions: string[] = [];
    answers: MatchPointPlayerInfo[] = [];
    currentAnswerIndex = 0;
    isShowingResults = false;

    get questionsForEditing() {
        const {questions} = this;

        return questions[questions.length - 1] === "" ? questions : [...questions, ""];
    }
    get questionsForGame() {
        return this.questions
            .map((question) => question.trim())
            .filter((question) => question !== "");
    }

    constructor() {
        makeAutoObservable(this);
    }

    createNew() {
        runInAction(() => {
            this.state = MatchPointGameState.Setting;
            this.gameId = Date.now().toString();
            this.questions = [];
        });
    }

    setGameId(gameId: string) {
        runInAction(() => {
            this.gameId = gameId;
        });
    }

    setQuestions(questions: string[]) {
        runInAction(() => {
            this.questions = questions;
        });
    }
    setQuestion(index: number, question: string) {
        const newQuestions = [...this.questions];
        newQuestions[index] = question;
        this.setQuestions(newQuestions);
    }
    removeQuestion(index: number) {
        const newQuestions = [...this.questions];
        newQuestions.splice(index, 1);
        this.setQuestions(newQuestions);
    }

    getLink(languageCode: LanguageCode, gameId?: string) {
        return buildLink("match-point", languageCode, {host: myClientId, game: gameId}, true);
    }

    get link() {
        return this.getLink(LanguageCode.en, this.gameId);
    }

    startAnswering() {
        runInAction(() => {
            this.state = MatchPointGameState.Answer;
        });
    }

    startMatching(answers: MatchPointPlayerInfo[]) {
        runInAction(() => {
            this.answers = [...answers].sort(() => Math.random() < 0.5 ? 1 : -1);
            this.currentAnswerIndex = 0;
            this.isShowingResults = false;
            this.state = MatchPointGameState.Match;
        });
    }

    selectPlayer() {
        runInAction(() => {
            this.isShowingResults = true;
        });
    }

    goToNextPlayer() {
        runInAction(() => {
            this.isShowingResults = false;
            this.currentAnswerIndex++;
        });
    }
}

export interface MatchPointGameControllerProps {
    controller: MatchPointGameController;
}

export interface MatchPointHostInfo {
    name: string;
    state: MatchPointGameState;
    questions: string[];
    currentAnswerIndex: number;
    isShowingResults: boolean;
    answers: MatchPointPlayerInfo[];
}

export interface MatchPointPlayerInfo {
    name: string;
    answers: string[];
}
