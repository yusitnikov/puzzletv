import { ReactNode } from "react";
import { SudokuMaker } from "./Import";
import { ColorsImportMode, PuzzleImportOptions, PuzzleImportPuzzleType } from "../../types/sudoku/PuzzleImportOptions";
import { PuzzleDefinitionLoader } from "../../types/sudoku/PuzzleDefinition";
import { NumberPTM } from "../../types/sudoku/PuzzleTypeMap";
import { buildLink } from "../../utils/link";
import { LanguageCode } from "../../types/translations/LanguageCode";

const loadPuzzle = (options: PuzzleImportOptions) =>
    SudokuMaker.loadPuzzle({
        type: PuzzleImportPuzzleType.MergedCells,
        fractionalSudoku: true,
        noSpecialRules: true,
        ...options,
    } as PuzzleImportOptions);
const addSuccessMessage = (
    slug: string,
    puzzle: PuzzleDefinitionLoader<NumberPTM>,
    successMessage: ReactNode,
): PuzzleDefinitionLoader<NumberPTM> => ({
    loadPuzzle: () => ({
        ...puzzle.loadPuzzle({}),
        successMessage,
    }),
    slug,
    noIndex: true,
});

export const FractionallyHarder: PuzzleDefinitionLoader<NumberPTM> = {
    loadPuzzle: () =>
        loadPuzzle({
            digitsCount: 6,
            load: "N4IgZg9gTgtghgFwGoFMoGcCWEB2IBcIAjAHQCsJADCADQgAOArgF7MA2KBoOcMnhAMShwAxgmw82bAJ4ACABJwoAEzS0QcRggAW0AiACymEdrgo2sgDIowAawgB3TAmbqREGHxwJ9AgEoAggDCACoAkgDyAHIBlrIAygCqACIRANKJADo4ALSyIdqY6LJMrByyRbJwsgBssgDrtbIA5lCYyrIQYLIi5mzoNLIOhSZVUChjwjjNKB2YOLJYAB6yUI7FcDgdyz0QbIwwOMVdi5grvVLFKKLaJLJBfRvjssqYAG7tsxXeELKZIBcLPRMCheuh-rIAEZyVooORseYodAkbJ5ADqbQQE2qr2azlkYDWMFkREAyAR1eaya6jQElEG9FG5WTJTB4hDFeByHAQBCrFD0a68ynVQGMvJhBbU7SrRyDdz7Q6DTYdSEQJaDHQTBA8uAWJTXTrdTU9Pp00FI3beODzebNWTG3H4oiyGCMdC8lAAR0Yuvt2mx42qJ2qWGm5VF%2BX9i14E0qCCgjAmkCgfomjvZsgATIMAMyDAAsgzISq2tTFsjR-oWtOB5uKlON6BjJqkslMbwmXp9FiwzBQg2kEEYLrgchQ3jQqcwKfT9clzn9KegqigJHUCGkAv0Ijd2pg6icyh0BCI2ZA-tZ2h8%2BFPdHgSxZbIINTogPQBAA2qA8R28Ph44mdBvLqiYEMWAJ7NA774AAHAAvjQoDylBBCZmQNQIUhkEYKhmEQWwKH4JmeHITh%2BA5sRiH4YRaEYVRpHQfmJHYYxzEEWRFFsYR8H0Sxz5Mbx7HQTUAlYUJBA8WJNHoVxZGUVJcmydBnGCdJdEKaxqlkaJ1EcfJunQZJBn8UpJlaZpGkEDpP7jgQAH9iAwH7PwRCvnx5H6QxEmmfgIk%2BX55kECpllET5tFhTJVE2X%2B9lASB-DgV5sFhT5OlJWl7nBcZyWBb5GXiXlPlZUlnnueFuXlSFRklf5%2BVqalDVRe8tn-gmDlOaBRFuQVlXZdV7kBSFg3ZaVPVFaNhHFQNdVyZFIUzRZI1zX142rRVKW5f1BVbZNE16bVPk7Yp60VctJXLdFdltXFzlgd13GHY181rSFU0FcNSVHdBe3fRF6lLf9SUfdNT3ZQtZlVX9UO5W9D1Nb%2BV2AY58VWfdx0hfpl2tUjHX8C%2BYOg0lsP7blwPbdDGNnZlP3eaT4OFbl9P0zToUnRjeFY7FyO3eRaPCfTxOLelj2bS92WC6hVM9VLNEbUNAss0zIuQ3TB2nYDZUyQAum5Rzxta3jQV%2BIAblu%2BCUHhpsuXQ4x4rgRuUDQjvO07ruue7NAe65Ls%2B27nv%2B17ru%2By7geB8HQcB5HHvZjHNCx9meaJzQSd5vHcfpwnydZynGe57HOc52nacF9nNCFuXZeV4WxY1zQtfFhXjeV-Xdetw3Vcd9Xbfd%2B3TcVy39da3BQ9wUAA",
        } as PuzzleImportOptions),
    slug: "fractionally-harder",
    noIndex: true,
};
export const FractionallyHarderSeries = addSuccessMessage(
    "5-fractionally-harder",
    FractionallyHarder,
    "Well done! (5/5 complete)",
);

export const Superposition: PuzzleDefinitionLoader<NumberPTM> = {
    loadPuzzle: () =>
        loadPuzzle({
            digitsCount: 6,
            load: "N4IgZg9gTgtghgFwGoFMoGcCWEB2IBcIAjAHQCsJADCADQgAOArgF7MA2KBoOcMnhAZUb009CFgTY8dOIwQALaARABZTAgDG8lGzYACADIpOdDRBh8cCZQDEASgEEAwgBUAkgHkAcg4N6BAKoAIh4A0gEAOjgAtHou8pjoekysHHqJenB6AGx6AOs5egDmUJgAJnoQYHoaOmzoNHoA7glamVAo7VBwOEUoFZg4elgAHnpQEE1JPRWjNRBsjDA4SVXDmGO1ukkocFokek510x16ZZgAbuX96VYQehEgW-r0mCi16I96AEYAnsUdf5sQYodAkKKxADqpQQnSy5yK6j0YAmMD0REAyAS5QZ6XZtZ7JN61cExPRBTCIhBJeD-HAQBDjFAiRC3TI1Ook2JuIZ4%2BTjSaNMyLZaNGY-CAjRoKToIelwfRwDpZNbS9m6QnvUHzKxwQaDIp6VUIpFEPQwRjoBkoACOjHlhu07V2lWqWSwvTSzwO8U66F4nQyCCgjE6kCgDs6xqpegATI0AMyNAAsjTIopwFWynL0kO0QwJr01SRxqr9fDV%2BnkcAunRtdv0WGYKEavwgjDNcH%2BKCsaAjmHDUeLPPU2nD0DKaBItBACF%2BImUGgtspg06a5QUBCIcZA2gp8ms%2BC3dHgI3JlII2VMxwIAG1QIia3h8EGQ3QLvKQ5vTAtoOgL0mAF8aFAIVf3-ICQJ-DACHjGMIKeKC-3wAAOeDQOg-BYLQxCCFQ4CELYMD8EA-D0KQkjIMIjCsNInCUOwqikJoyiiLwliMOyCiCKIziGKI5juIwtjBKYuDaMY3C%2BIwriyIIGS6IE2T6PE-ixPYpDhKUzSFLUkAH27AgX2bEB30WfhtyU3iVI4%2BSJOU9SYN0rSpNEly5Lc4iPO0uzFLo7zVI8qyHPwIKRMk6zXIi8Lgt8uzbKI%2BKhI82KAqi%2Byws8tKuP0p8jLfD9%2BETDLQssxLIuC-zqKcvyPLK9y0pSpKstqwK6pCtrGo05LqrsyryJatK%2BscrzuoG4LssuAzn2DYzTM-Yjvzskq6OW3rRsG9aKs2jKhswnqErG4q2tW1jtuchr9qqkaLuumLLq6m6NvwnLDJm-KzIINMjtaw6lI6%2B7ooyzrAaU4H0tBgHwZW462th26gch3awbhp67t%2BuiJsfV7XxMgqL0WniYfhiHiZ09G4tJnzIZR4KTpsgCAF1vxWINdSsJC7xnOd%2BEoeDZ3nQ86A6RFcA5ygaHFyWJelogaFl%2BW5cVqXlZlxWFYVlWVfVtWlelzWde12W42NmgTbjRMLZoS3EzN027fNq3Het%2B2XZN53ndt233admgUz932A5TNNg5oEO039iOA7D0OY-DwP46D2Ok7jyP-ejsOGcZgCAKAA",
        }),
    slug: "superposition",
    noIndex: true,
};
export const SuperpositionSeries = addSuccessMessage(
    "4-superposition",
    Superposition,
    <>
        Well done! (4/5 complete)
        <br />
        Next up: <a href={buildLink(FractionallyHarderSeries.slug)}>Fractionally Harder</a>
    </>,
);

export const FunkyTown: PuzzleDefinitionLoader<NumberPTM> = {
    loadPuzzle: () =>
        loadPuzzle({
            digitsCount: 4,
            load: "N4IgZg9gTgtghgFwGoFMoGcCWEB2IBcIAjAHQCsJADCADQgAOArgF7MA2KBoOcMnhAMUY4A1gE8ABABUIAdzx04jBAAtoBEAFlMAYxVwUbCQBkUYEXMwJmtEDogw%2BOBBoEAlAIIBhKQEkA8gByHsYSAMoAqgAi-gDSEQA6OAC00iqY6BJMrBwSGRJwEgAsEgDrxRIA5lCYACYSEGASOoZs6DQSsul6BVAovVBwOJUo9Zg4EpCMUBJQcplD9VMz9myMMDiZjZMQ082tmShweiQSXge9-bWYAG51o3nOEBIJdq1ZmCgt6K8SAEaSaooSRscYodAkJKpADqNQQ-UK10qVkmcxgEiIgGQCErjCRHHotNhGeifFqQlISKKYZEITLwSQ4CAIWYoehHZm4wqEtjk1K%2BCb4lSzOQdVbrHAdRb-CAADw6qn6CCZcCMcD6hW2Cv2RI%2BX3BzVwCDg43GlQkWqRKKIEhgjHQzJQAEdGCrzSoEeqGk1ClhhrluacpO6JOheP18ggoIx%2BpAZhbqVZMgAmDoAZklOHqRV5Emh7om3N130ebv6ob42qM%2Bhu-SdLqMWGYKA6Yl2NrgkhQzjQpcwM0ttJLKCs7pm0FqaBItgQYjZGh0dqVMFssjqqgIAA46O7qSoXPgtyB4DKqTSCEU6Nz0AQANqgVbQa-4VNJgC%2BNHvEDYj-P78-34wAgADYij-Owvx-fAQLAh9APwMgiDfD9wIAp8EKQ-9II3GCILgl8cNQgh8OQ2Cn2g5DkRrPB8EjaM6BuFVowIFMUMg4jMLg8iOKfJMyCAgjIN4-iSNwp9sJEwj8FAiSsIEuDxO438ZLg6TFOfDDWLwjTSOA1TNLIvSdIPOSxJMojtNEpS1PYkBKK7AhaObEAGLWfh030qyPKgwzLO8sz1P8nzJK4ryFK8kKjLCoyiGEtSYv8my7Ooxz6MY-gL3CoLIKy%2BT-Ii3yot89D-OK5Sn3isqCAqtTCskmyjJyp96t8xrN38oT2r4-zarYizgtavzKoCobsIAXUvXB7UGcZaVvUAZznfBKDAhb%2BCIOg%2BmRSbb0oGhdv2mh1qOw69tOg7juOg7zpOy6ztOi6TpTJ6aBTdM3podNnue973q%2Bl6PoB37-u%2BwGPtGlbZ34JNKBhuhQRwcFb3GkB7TEDguBAVRdBEBH0CfSgSCIMgJoAjQAGIUCApMgKIMAQFfV9wdfIA",
        }),
    slug: "funky-town",
    noIndex: true,
};
export const FunkyTownSeries = addSuccessMessage(
    "3-funky-town",
    FunkyTown,
    <>
        Well done! (3/5 complete)
        <br />
        Next up: <a href={buildLink(SuperpositionSeries.slug)}>Superposition</a>
    </>,
);

export const Mitosis: PuzzleDefinitionLoader<NumberPTM> = {
    loadPuzzle: () =>
        loadPuzzle({
            digitsCount: 4,
            load: "N4IgZg9gTgtghgFwGoFMoGcCWEB2IBcIAjAHQCsJADCADQgAOArgF7MA2KBoOcMnhAWUwIIWdLRBxGCABbQCIIQgDGMlGzYACADIpOdZRBh8cCBQDEASgEEAwgBUAkgHkActe2aAygFUAIs4A0j4AOjgAtJr2MpjomkysHJqxmnCaACyaAOsZmgDmUJgAJpoQYJrK6mzoNJoA7jGqqVAozVBwOHkoJZg4mpCMUJpQEHVxHSUDQ4ZsjDA4cWX9EIMVVXEocKokmrbrza1FmABuxd3JphCaISCVGvGYKJXoN5oARgCe%2BS1fbL0o6BIYUiAHVCghWmkjnlhP0RjBNERAMgEmV6mk2TTuWnoj0qQIimj8mBhCDi8C%2BOAgCGGKHom2paLSWPxkUcfQxMmGo1qMzmOFqE3eEAAHrVZK0RAg4Fo4C00ktxWt7jingCKrgpb1enlNIrobCiJoYIx0NSUABHRjS3VqA7y8ppLCdJLMqK29C8VopBBQRitSBDPXE4RxABMtQAzAKcCV0izNCC1H0sQ9VXE0YqPXwlVoZHBjq0LVatFhmChah8Vka4F8UKY0DaUJghvrSRd0cI1ENoEU0CQJAgPnSFMoTSIYBI6sVZAQABx0NTEmRmfDzkDwYVEkkEdIGdYEADaoBhBbw%2BB9frox2lfoIRAMEDY0HE%2BAjoYAvjRQDNnwQ35-v0fX98HSADbiAjA5zAn9IJA6CIJfWcwJPOsCAvcsQGvWZ%2BHDcCn1g-8vzw4DCMA-CX1I4iCI-IiYJfUDaIQqDGPInd4NY1d2JImiyO4rjYKQljgIY3iBP4%2BjxOY0SJKEsTZJk6SpKohTlKUui2PktSmLgzTON0kTVJ0xS9OMgz1JMwyzO0wTTMkizzKsjibMsuznIc1y7Mc4DnJQs90KvG9%2BCjQzKPM0LrM8jz9Ls8KONivjdPiuTbN0tztK86iYo-ABdB8Fh9OBelJQ9QEHYd8EoMCyv4e8QBaGFcBfA9KBoFq2poe9Oo61qevarquvavruoG3qev67rw0mmhwyjWaaCjKaprmubFum%2Bb1pWtalo2%2BbsvfPb3yAA",
        }),
    slug: "mitosis",
    noIndex: true,
};
export const MitosisSeries = addSuccessMessage(
    "2-mitosis",
    Mitosis,
    <>
        Well done! (2/5 complete)
        <br />
        Next up: <a href={buildLink(FunkyTownSeries.slug)}>Funky Town</a>
    </>,
);

const closeQuartersLoadString =
    "N4IgZg9gTgtghgFwGoFMoGcCWEB2IBcIAjAHQCsJADCADQgAOArgF7MA2KBoOcMnhAYTYR0KAAQBFRnCgI06WiDiMEAC2gEQAWUwBjVXBRsxAGRRgA1hADumBM0W6IMPjgSaAYgCUAggIAqAJIA8gByPiZiAMoAqgAiwQDSMQA6OAC0Yv6qmOhiTKwcYrlicGIALGIA6xViAOZQmAAmYhBgYrpGbOg0YtY5%2BqVQ4jJQcDh1KC2YOGKQjFBiUDZ54y3zi05sjDA4eW1zEAsdXXkocPokYgKnQ%2BJNmABuzVPFbhBiKSCdbMb0mChOugvmIAEYAT3qw0hbBmKHQJDSmQA6o05KUxA86nY5ssYGIiIBkAkqMzE50GPz%2BAM6iIyYjimGxCDy8EhOAgCCWKHo505pLKlNpmUCs3JqiWNl6Wx2OF6azBEAAHr01OIEBy4MYZOdWu1VSdfvlqfCOrgEHAZjM6mJ9VicUQxDBGOhOSgAI7SYz67VlA5lLATIqCrKqcToXjiEoIKCMcSQRa2xl2PIAJl6AGY5TgWuUhWJkaHZpSjYCTaT9eG%2BAbjAZHuJ3Z6xFhmCheuCjo64JCUG40DbQ5hFnbmW8yXZQ4toE00CRFAhwTzNLpneqYIpbE01AQABx0Ad1VTufC7kDwRUMpkEcp0SkKfAAbVAW2gd5TAF8aE%2BIMIMAQiAA2D8vx-O9yiA75vxfK9wOfX98HfT8IJAndwOxOs8HwaNYzoR5NVjP8b0guCwMQ2DQJgojyNIyi-0A6jkOPCiGO3JioPg1i4IQ4C2JI7jiI4u8WPotihL418BNoiT8F4pCeKk0TZM4%2BTlOEpTVPE9ToM06SVLElDtK4xSqL0xjtIUsiCEMtCewILDWxAXDtn4TMjP0kyZIsnSDKkwzPPMmjTJM3yAuChiPIC8Kwt01yvJMgDor8nyEoi6LrIwuycLw-hrxi0K2LyuD-OYpLvIAXUIvZowtNw70fEAeD4TQbkNAAFY0xAAISObMZABBQ6AecNQQ4JpbJjez50XeDKBmuhYRweECHvOrFQIkBwQIShwNW-AiDoDbdu2taDvfcqVuOv8jvwSh9sus7QB2tN1suxCdpcg6iCunKPrfe6QB2vbnvwOiHou-AAHYrsBg6WL%2Bt7buBq73oISHXqvBHIbhghkYhq6noOzGaHOiGEZB-6UYxq6TwJ36idB-AyARmSdsZoGyCu-8EfZrGSaBwydvBhH0ypoXaeJ1mDq2tGGYRz7pc5oHPp56GtPplWGbxrmxfp77saR0XpZx07ypAF1wQ4LgQDUPQLAW9A70oEgntgzQAGJQXKD2PbAMAQDfcCGv4EAAHFGiaebFoG3I4GGqYxuwq2F34FMZpukAI9q4n8c2zXFdzk78716Xs9i8n4K14vScL3HK6B2G6bLtODrJgGq9r5v9aBlv0a7q6JYIbvgbb%2BnBd76XqYH7Wy4VmGOcp%2BXh%2Bniv6Zn1Wl6B4WF75q7R4L8eEdOhudqbyyoYP6v%2Bex8-pd19jpf7u%2BV%2Bvp%2B863yXfpNs2LfwUBrd0W34QOyoDlF2hBXap1Tj7P2AcIyaC8CgbEuBOrdSaL1SOIBBoxxGvHCaSdLKpzmnCTOOtF47VvqjEhdc%2B4IwUjtVegUy67zcmXCeDCdqsIoSw0hO5l5cKBszCm-C55CPvkzL6Yib68LIVXHmt9aFXyoe3ZhrdFH0xPmwza881HcOulIzRIi1YSPpiXAR%2BAcamNvhYg2lC942JenY661CgZSxfu-aWTDHH72cSLV%2B9NWGX2PNYvhB0wI83UaY9Rm9tHb2luouW0S3GGO8Uozx9McYuLLrfLapVP7zm-r-AYAD7abRIEQZ2RE3YQJmlA-2iFMGx1GphcadBJrOUoIDXQcBJi1SfKcJaN09q7gAJwm0cvhVJ3w%2BkPgAjQIggsUzXhTGQUZWUc6kSmfedMaZ0yZnKDdcoRAVlOTWb034tVyi7nKEMmgZBOZkHBkc8ZGTbxLTIDdMge0yC7jICMzKxyJkvIfOma86ZGblDTOUdMjz%2BDPI2UQXcRBrkpk5imB5fynkwQ2ds2ZAzDnophZis5S1ryMzKbMqF%2BKTmTKJQ%2BFONAUx7RTLuFMvyHKrIBRs9MnN0yC3KNecoyzKUcppfeMgaYyCZn-Ddf8eK2X-NhSKsgJLGb-jTP%2BClcqMXrJFemXc6ZrnlE5uUNFmqCXau6EtFMaYUyZnTDddMsqxlmtORah8nNBZEGvEQQVpqc65PNvwX%2BKBFRHj4pUqpfsbxdMDYpcNVTqD%2B3Aq0qlgdNChxQJCOIHJ%2BoYOjg0nBLS8HTUoE9egMheA9MTlNEAXRMD0FEIoKAx9SkKygJLFtdBxh1G-mnMAmBfhuzAJQIdQ7QT-kUC6ZYFgg7gIjXQSdEBp3ImaFuRxn9wQwFBN%2BTOjtGa7rOqQPd5Azq7tmceomKZyA0H3Req9h6zqXsZo%2Bs66Yr3PqJqe9995T25kFfeQ9NBf0PqvUBj9V7-znv-eByDj6aAQb-a%2BlVkHf1wcg-B1Df7wbQb-eh0D94UN4ZQze0VV7iMoa-ehr9WGn3HtKkmotgNhiIL2P069bGBmzM43tG6PG2N7X45x3jvGBMCaE3xrjnHrX0uk7amgsmpNSdk-J6Tim5NqczApmT6m5N0bo2%2BIAA";
export const CloseQuarters: PuzzleDefinitionLoader<NumberPTM> = {
    loadPuzzle: () =>
        loadPuzzle({
            digitsCount: 4,
            load: closeQuartersLoadString,
        }),
    slug: "close-quarters",
    noIndex: true,
};
// The first puzzle of the pack is published on the main page as a pack
export const CloseQuartersSeries: PuzzleDefinitionLoader<NumberPTM> = {
    loadPuzzle: (_options, isPreview) => {
        let puzzle = {
            ...CloseQuarters.loadPuzzle({}),
            successMessage: (
                <>
                    Well done! (1/5 complete)
                    <br />
                    Next up: <a href={buildLink(MitosisSeries.slug)}>Mitosis</a>
                </>
            ),
        };

        if (isPreview) {
            puzzle = {
                ...puzzle,
                title: {
                    [LanguageCode.en]: "Introduction to Fractional Sudoku (5 puzzles)",
                    [LanguageCode.ru]: "Введение в дробное судоку (5 головоломок)",
                    [LanguageCode.de]: "Einführung in Bruch-Sudoku (5 Rätsel)",
                },
                author: {
                    [LanguageCode.en]: "Michael Lefkowitz & Mitchell Lee",
                },
            };
        }

        return puzzle;
    },
    slug: "1-close-quarters",
    noIndex: false,
};
export const CloseQuartersSource: PuzzleDefinitionLoader<NumberPTM> = {
    loadPuzzle: () =>
        SudokuMaker.loadPuzzle({
            colorsImportMode: ColorsImportMode.Initials,
            load: closeQuartersLoadString,
        } as PuzzleImportOptions),
    slug: "close-quarters-source",
};

const random3x3LoadString =
    "N4IgZg9gTgtghgFwGoFMoGcCWEB2IBcIAjAHQCsJADCADQgAOArgF7MA2KBoOcMnhAOV4oO6dAAJ0jACYQA1o1og4jBAAtoBEEoQBPevxABjRugQQYSgO6Zp6gkQBMdNSkwBzNQgfOQ8AB4AIh6Y3vgALHRGImzoBADaoEYQbNBx%2BI4AvjRJKWkEWTnGeRgF2bmppfhOABzlIABucGyM-JHFlem19cmdBHVFvfkRPSXp4aN9%2BADMhRXD3YNjPgPzVYtr6XONza0E01HLGZPD20NVs-VNLfxEh1OXRdd7GffDqzs3BW9VE0tTf1Az1uP3Sj02KyuuzaoMh-2G4I6pxOVTORzRDwxCKxVQ%2B53GKIJ8IuOK6jjxRw2IHcmAaKDw%2BAQUFadGBDlhM1J-UJ3OJYK51XJPMFFKmVLZMw5AoFouRfLK8uOT2h3yRuOFHwldzV-OF4pVEQ5VPxcIhSrN2wlvhN%2BE1BoOOoVQIN2ptRAAbFCvobHSKNf7ld72m6hYrEVqOYibeGXUbPYqPQGLXr42bjUcoxmBYDfbL1YqBemxaG0yXPi9XVnhZnMdXLbHfTHvdajjmbXbmxyOy8HTbC2WJcHKWWaXSGUyWeX%2BL30XWvT2pcL60GOe620c18L11M8%2Bld07fUWFmW%2B3OC0v5zDDyfh-vORfz2HC6nDy%2BbWQnEnc1%2BQ3f9d7K1rQMF19aVL3ZRtn3A6o42gmcpg-GVoJbHcf1vPUbyA5NH1AUd6QICcUFZA0h2LO9N2Aq8bQos1ELQ1DFTqABdQ4cDMKA4EwHAEHSRIQD0AwIKgFAaVwXjKBoCSpMkmS7jkmh5LuaTlNkhS1MUmSVOkjSNK0zT1IM%2BS9O0wyDOM1SdLU5xrJoGznAOByaEcg47Nstz7KczznPcnybO87zXNc-yvN80LgscwKfPCpymPqAT%2BEoTJYsyIA";
export const RandomFractional3x3: PuzzleDefinitionLoader<NumberPTM> = {
    loadPuzzle: () =>
        loadPuzzle({
            digitsCount: 4,
            cellPieceWidth: 3,
            cellPieceHeight: 3,
            load: random3x3LoadString,
        }),
    slug: "random-fractional-3x3",
    noIndex: true,
};
export const RandomFractional3x3Source: PuzzleDefinitionLoader<NumberPTM> = {
    loadPuzzle: () =>
        SudokuMaker.loadPuzzle({
            colorsImportMode: ColorsImportMode.Initials,
            load: random3x3LoadString,
        } as PuzzleImportOptions),
    slug: "random-fractional-3x3-source",
};
