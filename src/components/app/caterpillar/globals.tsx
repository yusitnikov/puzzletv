import {localStorageManager} from "../../../utils/localStorage";

export const safetyMargin = 6;

export const baseShortId = localStorageManager.getStringManager<string>("caterpillarShortId", "memeristor/caterdokupillar");
export const baseSmallShortId = localStorageManager.getStringManager<string>("caterpillarSmallShortId", "memeristor/smoldokupillar");
export const apiKey = localStorageManager.getStringManager("caterpillarApiKey");
