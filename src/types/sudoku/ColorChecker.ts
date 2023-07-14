import {HashSet} from "../struct/Set";

export interface ColorChecker<T extends string | number> {
    isValidData(actualColor: string, expectedData: T): boolean;

    isValidPuzzle(): boolean;
}

export class ColorMapChecker<T extends string | number> implements ColorChecker<T> {
    private dataToColorMap: Partial<Record<T, string>> = {};

    isValidData(actualColor: string, expectedData: T) {
        const expectedColor = this.dataToColorMap[expectedData];
        if (!expectedColor) {
            this.dataToColorMap[expectedData] = actualColor;
        } else if (actualColor !== expectedColor) {
            return false;
        }

        return true;
    }

    isValidPuzzle() {
        // Check that all mapped colors are unique
        const allColors = Object.values(this.dataToColorMap);
        return new HashSet(allColors).size === allColors.length;
    }
}

export class ExactColorChecker implements ColorChecker<string> {
    private usedSolutionColors: Record<string, true> = {};
    private unshadedCellColor: string | undefined = undefined;

    isValidData(actualColor: string, expectedColor: string) {
        if (expectedColor) {
            this.usedSolutionColors[expectedColor] = true;
        } else if (this.unshadedCellColor !== undefined) {
            expectedColor = this.unshadedCellColor;
        } else {
            expectedColor = this.unshadedCellColor = actualColor;
        }

        return actualColor === expectedColor
            && (this.unshadedCellColor === undefined || !this.usedSolutionColors[this.unshadedCellColor]);
    }

    isValidPuzzle() {
        return true;
    }
}
