import { makeAutoObservable } from "mobx";
import { localStorageManager } from "../../utils/localStorage";
import { PencilmarksCheckerMode } from "../puzzle/PencilmarksCheckerMode";
import { AnimationSpeed } from "../puzzle/AnimationSpeed";
import { UAParser } from "ua-parser-js";
import { LanguageCode } from "../translations/LanguageCode";

class Settings {
    isOpened = false;

    languageCode = LanguageCode.en;

    readonly enableConflictChecker = localStorageManager.getBoolManager("enableConflictChecker", true);

    readonly pencilmarksCheckerMode = localStorageManager.getNumberManager<PencilmarksCheckerMode>(
        "pencilmarksCheckerMode",
        PencilmarksCheckerMode.CheckObvious,
    );

    readonly autoCheckOnFinish = localStorageManager.getBoolManager("autoCheckOnFinish", true);

    readonly animationSpeed = localStorageManager.getNumberManager<AnimationSpeed>(
        "animationSpeed",
        AnimationSpeed.regular,
    );

    readonly flipKeypad = localStorageManager.getBoolManager("flipKeypad");

    readonly backgroundOpacity = localStorageManager.getNumberManager<number>("backgroundOpacity", 0.5);

    readonly highlightSeenCells = localStorageManager.getBoolManager("highlightSeenCells");

    readonly nickname = localStorageManager.getStringManager("nickname");

    readonly debugSolutionChecker = localStorageManager.getBoolManager("debugSolutionChecker");

    readonly simplifiedGraphics = localStorageManager.getBoolManager(
        "simplifiedGraphics",
        !process.env.STORYBOOK && new UAParser().getResult().device.vendor !== "apple",
    );

    constructor() {
        makeAutoObservable(this);
    }

    toggle(open: boolean) {
        this.isOpened = open;
    }

    setLanguageCode(languageCode: LanguageCode) {
        if (this.languageCode !== languageCode) {
            this.languageCode = languageCode;
        }
    }
}

export const settings = new Settings();
(window as any).settings = settings;
