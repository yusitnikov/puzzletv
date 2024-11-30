import { PuzzleDefinitionLoader } from "../../types/sudoku/PuzzleDefinition";
import { NumberPTM } from "../../types/sudoku/PuzzleTypeMap";
import { FPuzzles, SudokuMaker } from "./Import";
import { ColorsImportMode, PuzzleImportOptions, PuzzleImportPuzzleType } from "../../types/sudoku/PuzzleImportOptions";

export const infinityLoopTemplateLink =
    "https://sudokumaker.app/?puzzle=N4IgZg9gTgtghgFwGoFMoGcCWEB2IBcIAjAHQBMJADCADQgAOArgF7MA2KBoOcMnhASRxhMOTAhQACNhAj1JEmPTaJOdOIwQALaARC0QAYwgw%2BOBHoBy0eG0miRYidNnyojDuklx6ygJ74ADo4ALSSACpaUkysHJLGOFjoCF4QYN6S6GiYKKnpUKIA5ug0kspwhigAJvY4mYyGWhkA7nB%2BClqIkigVTQU4hZKdqThScFUAVhUo5pKjmIVaAEbQkv2DuB1SolhVYzg1m9pSEJq7KCTBYQCap-FwdTwAbguqHVCni1vSbWh5a0UvEt2sxZDAirVJAAKADUAEpJKtTghoSE4ZdQpIAAoqSrfKoLcReIghABskPQDSacEkrXa2i6OAgkgJhXE9i8UBQ9B6EhqogyH2apWMbEYMBwpVWAEdGOMoA8UWlvDh6c1meMppVZut0BiwpEpCooIU0PEUGw2CNvsjzt4uWU4FAlekVto1hBmugAPSi8WJRHpY61UZQAEDexBqLtJ1jSbTWYIDXmy2B76iUPhwr6yQAQUksvliviuCSKTT2i5Ukqlq8DJRkFgGWMUEzyuDyLN61p4iawc1CZRNatFaiIa7EKhWAAHimRwKkwg4Gx0QYEH4eXpDIxkiYDM1MFVtAQiJQ6FEFloLPhT3R4NOACKE6%2BkujD9AEADawAAvjRQKK0AfvgAAslAAJykn%2BAEQDIGAEGBkHQUYsFAQhEFQf%2B0HIYB8GgRhOGoXhiGYTBcHASR2H-ih5HoUhWHUbhFEEYxRHMfRv4MWRaH4RxNE8ZRXH8cRLHcSJfFMXRpGEbRvHSUJklyVRYnsaRwmqTJAmiepUmaeJ8mcYZekaaxsmCSpulccpxmWRZSlWQ5RmOTp9l2eZ1kKWxtkueZPmiR5hl%2BRJXmuUFamKb5EX%2BaZWkccpYXxVFwVmdpSUGQlMX6QFGVudFuVxZlJn5eFIXuZ5KXJbFJUVdJAC6b6lggCqiCkX6gOum74JQyEdfwp6UGeIB7I44jYHg%2BDcLw-AgEII3ODIcgGKITDXp%2B9UgEsFQANYzFUXAgL1W4QHsBjGCdhAJMkmSYMwUgALxlCw7AXOgPKGCQWC3SQB5Hk03qSGQkhhEQwSXSipoIAAwrIUA1A9ULrCKMNVAid0AHySMAwSSFmkgAKQPZ9KDY2sKAIIwraSJ%2BiPXbdpRE5IMKSEQ9M3VIABUAOM8zQNZrVn7GNAVS1cEP6g41kgQ5DFp2PDNPTqUfioxjMTPSQUsy7mCBQlLyMI0UpTTnCpS60L%2BsDIrcJwuLiQouMVQABKnFkkjw%2B%2ByuPbEFz29DtvNeY0NKLgMza6MzTQu%2BJAcAM7p3XHkjkgA-JITs7iggf0MHsz4JIT5gGAaAh0%2BbIpBnWcIHCUIkwA5FybKbF01fc1EbA8hgJA8OCAzq2T0u1g%2BuSGAU9AIGNULuzQJPvsEVs21d9up1kXjwwt9B91aHtY3U3hVI7zsoFCq-r3q8D0FCULAPLis-h7GuWubhSG5bs-bwv%2B%2BH64x8kKf5%2BXwbkgK0kH4G%2BrsMZ3zYA-UoABmXmfhDZW2tq-Xei8D5HxlifHwv8r5AJAejSWvcZaQMkDAsIgCSFAIQSTN%2BacP5yC-j-C%2B2DgG3wIffGmcDiG8yNi-MWOBgiNmhBwFE3YHqUAANy4wADy0xQBI9YMJ4SYyocg-e6AoSfhJjjP%2BFsAE5zPEAvRf5NGY3ljnFmBjJDdUntvLRpjLGKzMUYmxJiig527Ezcx049EOMsU4nGtjXG4w8YbMxPirHGO0YUNxEJgm6PsRYogfjJC1UQTjahS91ERLsfogIzMkkBIGNEiMsSvHxNyeE5xkSimDBKaEixFT-EuMKUE5mISAZhPyU0qJLTPE5ygR06xjTIltP6QkpJKTlF7zTmojRlTsk%2BMSYM-xVSekjIWeM1JO8pkZNmUM9Y1Tua9LKY4pZBTH5xNGbkxZJMJk4F4cEVWHASA%2B0av7KGJhM6jHMFCMO2IuTDVENUSGDwCRVFUOgMuXztY107GGd81clkAGVGBVAgFtRgxdxCIrJiQMAHwYDqKICkpZn4SBkpbm3PUw4BBVD1BDXMlp140rUXCWquLMBsAkFAc%2Bw5N7GKEQA12ns1YQwABrjxlpsnGs4HoAFlEBaG-qIKEgCGac0Bh4rhUrpBkyAUKx5FwIbXAlZabV7Q5UKqVTgKEHC1Vc01WEJWxiuTk0piq128cGYADIvV6rjoTNmCIAA%2BQboSzgAISerZpIH1erI0BtujG31Eb45Ou3jfGecIQB-hQkHKFwE1o5uWpoLgObkh%2BA4KWn8tUfw-iAA";

export const InfinityLoopIntro1: PuzzleDefinitionLoader<NumberPTM> = {
    loadPuzzle: () =>
        FPuzzles.loadPuzzle({
            type: PuzzleImportPuzzleType.InfiniteRings,
            noSpecialRules: true,
            load: "N4IgzglgXgpiBcBGADAGhAFwhgNneIAkgHYYBOA9gASIjoCGArhgBYVkIgDCL9AtjDwVidEGUZ4wMDJxIAzCMWwBPKgBkKFAA5VxkqvS1acy+AB1iAWioAVFjCpbGUKHioBjYZDAYwVCnIGVFJkEDB+AbqKAOZgqI449O4wACZUisGM7ixBAO70qqz0GFQwSTmhxNFUvBHEDvQpAFZJMKRU9RDRLABG7FFV/sRUrA6KkCkNxGnCI/b+zBMwAHQW1gCaFIwe9MPE9ABuXcUOrJSM3XMOicowZBGBlbFUPapQmnwx6cMAFADUAEp/GQFiUfpYAasrFQAAqJZJXKgpLrYPyISwANm+mWyeQKc2KHWoyOi2HSfjIMC0ZQwqWx9F0FFy8U8OEYfGI8X6AEdGI0yLsSpFdoVctRGi1ku0nmAodY7Nd6GRoncPIIcHVEVtfBBJgZKY4lULAn1WIzcmAAPSs9nEB6IxT1EFPdKBUaqJUNZqtdoYcVqnA4fxu+aO1VPOVUACCVF5/MFHi8EB89rOMAcyUDfiKJTk7D4QU8ZCdwa1zHDX1y2ByowM3qlJUzGtLtbDzq+P0gAA8A82Mn6MPQcJDRNFQikEABtSfAAC+qDnC/ni5XIAOQ8Y+AATOhSQc2ghyJvlyel0uALqoGenlc3u9nueX68Ptcb/AAVl3EH3IngR5g963g+J5PkBYGAXeoGvmy+CIF+P6HuIAHAS+7icAAxMgWHYaI7hRmQArKFOICYdhWEgOey4gGhBCkWRuH4YRxF0ThlELtBm4IBi8EHn+SEQaBEHsTRJFkeR6B4QRBTMWJyAUVRIkseJ1GMdJ8CTqJYnySht6CTpQngXp4EvuuMEIJ+IB7rx/43hx248b+NnAUZgF2QgAAsDmIce+nOVeoCmZx8AAMxeXxPnGZFkGUUAA",
        } as PuzzleImportOptions),
    noIndex: false,
    slug: "infinity-loop-intro1",
};

export const InfinityLoopIntro2: PuzzleDefinitionLoader<NumberPTM> = {
    loadPuzzle: () =>
        FPuzzles.loadPuzzle({
            type: PuzzleImportPuzzleType.InfiniteRings,
            noSpecialRules: true,
            load: "N4IgzglgXgpiBcBGADAGhAFwhgNneIAkgHYYBOA9gAQBMI6AhgK4YAWFZCIAwqwwLYw8FYvRBkmeMDAxcSAMwjFsATyoAZChQAOVCVKoNt2nCvgAdYgFoqAFVYwq2plCh4qAYxGQwGMFQp5QyppMggYf0C9JQBzMFQnHAYPGAATKiUQpg9WYIB3BjU2BgwqGGTcsOIYqj5I4kcGVIArZJhSKgaIGNYAIw5o6oDiKjZHJUhUxuJ0kVGHAJZJmAA6SxsATQomTwYR4gYAN26SxzZKJh75xySVGDJIoKq4ql61KC1+WIyRgAoAagAlAEyItSr8rIC1tYqAAFJIpa5UVLdbD+RBWABsPyyOXyhXmJU61BRMWwGX8ZBg2nKGDSOIYegoeQSXhwTH4xASAwAjkwmmQ9qUonsinlqE1WikOs8wNCbPYbgwyDF7p4hDh6kjtn4IFNDFSnMrhUF+mwmXkwAB6Nkc4iPJFKBqg54ZIJjNTKxotNodDAS9U4HABd0LJ1q57yqgAQSofIFQs83ggvgd5xgjhSQf8xVK8g4/GCXjIzpD2pYEe+eWwuTGhh90tKWc1Zbr4Zd31+kAAHoGW5l/RgGDgoWIYmFUggANpT0CHYdMfCIdBkw7tBDkRcAX1QwB3e93+5A8/Z+BoK4ga9E8E3MH398Pj73AF1ULOHwfPx/v4fX++nz+X4Ab+b5AWBgHfn+c4LvgADMF5XhuEh3sBn4gB4XAAMTIDhuFiB40ZkIKKjTiA2G4ThIDPkeGEEORFH4YRxGkfReHUU+x4wQg54gKu643shkGgR+nGnggy68Ze/G3iJtFkRRlHoARRGFCxCnIFRNFYepjEqSR8BTvJCmaah95QRBHEnouCCYgh0mCaZIH/uBjngeZrlHlZ+AACx2deMkee5LnBSJXkIAArH5SHbs+1FAA=",
        } as PuzzleImportOptions),
    noIndex: false,
    slug: "infinity-loop-intro2",
};

const misterFantasticLoadString =
    "N4IgzglgXgpiBcBGADAGhAFwhgNneIAshGBjAE4AEAYgIYB2GtpEAxiOrQK4YAWA9uQQgAwr1oBbGHn70OIclzxgYGYQB4AJqtoQcYAHwAdeurBcJE2uQCeBgJL0AZhHrYblADL9+AB0qKypS0vr44NgB06gD05pbWdibqSsamOBAGACq8MJS+XFBQeJSsspCkYJT8TsGUKuQQMJXVAa4A5mCoeTi0rDCalK51XKy8tQDutB58tBiUML1jDfRtlOLN9Lm0mgBWvTCMlJsQbbwARoKtK1X0lHy5rpDawfQDsnc5VTxPMFHR6al1ACAJr8LglBhHWgANxOs1yfHIYNOH1yPRsFGaNWWHUoZw8UB8Enag1uAAoANQASiqVDBczJAFoqX8AUkAQAFHp9VGUTQnbCVRCMgBspOGowmUw+syO/D5ArmJACMF8CzIAyGtAC/HGXVKOAs9C6lwAjlxtuQGHMWgxpuN5ds9n1DjiwKyMuyMtk0dY2hQStJ9DdefSfsFyLlfNYbTULnwdeMwNEDUasbzXJsqDjBjV7h5rFtdvtDhhHYGcDgqnnPpmAziPYCAQBBSjmy3WkplEgYdOImC5PqVyozOZOQQSWqlchZ6uhnj1knjbBje7BYsuuZD4MtNd17MksmQAAeFeDQzLTBwLJibNM0RSSWi2iYekMJiSvgMAGUmK9rAMkb0GckKBE08AKm0grBDgsirGu+TkGEaKuLkEhcKQlDjuQk7aiosZdvQKisDwEDQrk/JQb24p2rS2jkH8X7yG0DSaAgADa7HAAAvqgoDsAQADEzYAByiaJ8isM25BWjYHEgMJYlKSAAC6vH8cIiniSJknSbJ8lacpal8SAAkKdpEnoFJMlTAZFk6cZPF8eppmafZuk2XJ8DseZSkSY5rlCe5Vl6bZ3m+dpqkuWZhmWaZoVeT5sUOep3EqagXGBRFykhZ5dl+SlzkmTFwXxXl4XJVFxVuQVHn6RV7mOal1VBbVuX1UljXRTVkXtWFnW1U1LXZXF1kdSNKXpZlJVtWV42VQFM29XN/UTVVTkaa1y1jatC3NRtWWVX1iVrUNm1rcd+WRYtPU5StJ17VN51HfdV1Gd1W13TtD1dcNL3fW9/n7cDf2lQDDWDR9F2vRD11Q/9CWA5NGUbSD/GIxVyBY9j60w0l2M42dwNPWj0UY/jBPILj4MUwT62k09h1g+Tp3w8z5UDXDoOzTTrNFaj/NMzzLN7dz20i79z3s/NXWM0tX0S5DYsKxzfMHfLo2K1zAtS8Lqui+rt2a/rktC+LJuQ3LRs6ZdsPvSZ0K0Ia+AAMzoFB5FyPAGCKDAbN6zLSu6+bgfa/tZsq6H9vB5Hu2m47zsICK7tkQcCA+1wfvK8bUdAyT2c23jasRzncdByXhe8wb4ca5XWvRxXdVl9rje25z0dpelCgHCBXuZekmxgBxPkAEoAKwiAALPII+TyIY8z3PIozxPADsqkBQPTTDyAI8u/PM/79P6B7yILuLyIABMK9XzfiAby5W9D95o9z+vJ/7w5m+oc/nG76vU8Z4iTPg/EyT8d4jxFCIAAnDPABsCT7AMLiPYB79d7AOXipNSXct4cVAOAl+u8J7H13nPBeJ8l433Xlg9A9It4iE0tQZAIpV5MPkMuTQfAEDIAiJPdATgkQSBEGUH2uhGDCBHj3BgIBH4/wgfvchu8j6HxARQ2+J8J7Xw0SIe+NCQB0NQgwoSTCWFsPQBwrh8AeF8JAAI/gQiRFWlcGoAgkjgLSNkYPCBb8VFf1oTwehjDmGsKpuYiAnDeDcN4fwwRwiiKiOcRIqRchPHb0ISPABJCUEgL0QYzYRiFImJCew8JljrExPsXE0gTjxGuOSTIsBcj0lQIQf/GBQCRDINQR0zBXc8kwAKYJIpZiQAWMiVY6JtjYmOLES43e9S0rcSAA==";
const misterFantasticLoadOptions: PuzzleImportOptions = {
    type: PuzzleImportPuzzleType.InfiniteRings,
    htmlRules: true,
    startOffset: 3,
    noSpecialRules: true,
    load: misterFantasticLoadString,
};
export const MisterFantastic: PuzzleDefinitionLoader<NumberPTM> = {
    loadPuzzle: () => FPuzzles.loadPuzzle(misterFantasticLoadOptions),
    noIndex: false,
    slug: "mister-fantastic",
};
export const MisterFantasticPreview: PuzzleDefinitionLoader<NumberPTM> = {
    loadPuzzle: () =>
        FPuzzles.loadPuzzle({
            ...misterFantasticLoadOptions,
            visibleRingsCount: 4,
        } as PuzzleImportOptions),
    slug: "mister-fantastic-preview",
};
export const MisterFantasticPreviewNoOffset: PuzzleDefinitionLoader<NumberPTM> = {
    loadPuzzle: () =>
        FPuzzles.loadPuzzle({
            ...misterFantasticLoadOptions,
            visibleRingsCount: 4,
            startOffset: 0,
        } as PuzzleImportOptions),
    slug: "mister-fantastic-preview",
};
export const MisterFantasticSource: PuzzleDefinitionLoader<NumberPTM> = {
    loadPuzzle: () =>
        FPuzzles.loadPuzzle({
            htmlRules: true,
            load: misterFantasticLoadString,
        } as PuzzleImportOptions),
    slug: "mister-fantastic-source",
};

export const WalkingOnTheEdge: PuzzleDefinitionLoader<NumberPTM> = {
    loadPuzzle: () =>
        FPuzzles.loadPuzzle({
            type: PuzzleImportPuzzleType.InfiniteRings,
            noSpecialRules: true,
            htmlRules: true,
            load: "N4IgzglgXgpiBcBGADAGhAFwhgNneIA6gIY4DWEAdgOYAEA9pbRgBYy0wAm1c6xArq3oAnBCADCLYgFsYeRiHTD+eMDAxiAPJ3XEIOMAD4AOpU1h+06cWEBPQwElKAMyrZbtADL16AB1rKqrTEvr44tgB0mgD0FlY29qaaKiZmOBCGACpstL78UFB4tADGjJBgGGAMzsG0asIQMFX0NQ00YKi5OMTFXLRUdfzFLLUA7sQerMQYHD0jbXRSzZTsxJwAVj0wlDMrENQsAEYiAVR0jMw5VJA6wZScDEys7PSCNzBR0empmt8Amq8SsQmJRiAA3fbTdisYSvA6XdjdWwwYTNVpnKqHDxQHzSM79JgACgA1ABKBjCBiCWiEgC0pM+3yS3wACt1egjaJx9tgqohaQA2AmDYZjCaXaa0Sj0Lk8mYQKrCGC+GBQh4DYgBeijTqlHCWSidE4AR34a2EwJmLTuk1GMrWm16O1O7UZGWZGWyiJsPEpvRwBkenNelQgtxs7F8NitNWOrC1ozA0T1BrRnKoK0pC36NWeHgjwQ2W2dGHtJTkOGq6comZd1DdP2+AEFaKbzZaSmUFZUqzCYOx/YGpjNnCJpLVSsJa9bnlSMCi67RRtgRrOHcWZoO07OMwvs4TIAAPcsBqoDUsYUgMmJMszRFJJaI6S/6IymJK+QwAZUv9xsDzIWFfAoLl6EqTppSlGBqGmCAwQHMoMAtKgMAiWgABE5WWMYWGwdhODA2hpH4CpaEOBDKDUYpBDgj4MKwoNNUOdkyFAmZiNI8jhU1C0sBla1EHgAAmGkIAiOjGHYBVmGXDlgTAthhGvaJP0UEBqAaTgEAAbW04AAF9UFAYoxAAYibAAOSzLLU4om2EC1bB0kBzKstyQAAXUM4yzOs9z0DshyJmc1y/M87yQBMghQv8yL7MckK/JsryjJAJVqAgBRhIi9LMsoBAAGYIqilykos2z4uC+BtNKtzkuK3y6vKgLKqc6rarClKfOisqKqCtqapi+qjP0jzUD0yLGrClr+sSprwtS3KssQHLoLyhBEACqbYsChL2qG8qurStblq2nr5pmvbBt6o6lvy+AisWk77qE1aMqytBJvO6a4tm/abre9b4E+kqDr6q6Ovc27noQZAGu+nbWrmzrRvG0A7ths7IZsy6quu+bofe+7Nq+7Hmt+iGwcJoG4aeonMdJsHcYGsmFoMka6aBknQd65nkahwHlsF+6Qe2nGKbx1nqdOxneYllmqdRiaMeBrGmfl/nhvRmGkDVuXdslxXOY+vWLo1/6CeFjarYem3XuNkWbe5sXyYNhWAYdhmebNt3NcOp3TZ+32LZRsblZ1+3tfph70DBUh+HwEmMvg+6kITu2bceqOgaEtXkHzgvwcNgvC+l+6CrzkvkCLhWq+rsuEEj47o6z5uc9j+P8Fz9TaNT5QYEzpXs6y1uVablXR4jzPK5LmuQrrtm26y7vQYXvn9oXhvbc97Kd8n6PXrD4ficDxG/vxlGd9FhHxeDi+BZ352b9dpGQ4f4/YYzvenZt6/WfX++Wsl4n1lj7V+gD/ZX1PrfcBUsh7AI2tAl+584FQNAUHWBRsP5IADugs+lMPbYP3jnX+SC55vyASrWm2Cn7/3NhAxeVCyEALgUfBBus8EwJQVg9h1DeHMPoag7Bf91Z3yEew8eOtiEy29hg7hhD2G0NEZghRKsVpoNkfgw2AM2FqNwZorhBDLaPwEWInhajTEqOMUQr+wjLHyOsfwzhyCjGXzsc48hDCt5ww8mNEA3JnDOBRNsXoOljIVjAM5AASgAVnEIgNSUSBTxMXluaJySUCJLiZko6aT2qxPEOTJJhTUkROiQAdnEOUxJyTqleT8bxTKYTIplPyXEgqNTxAdNya0mqUSUDiBiYkgZApwpeSAA==",
        } as PuzzleImportOptions),
    noIndex: false,
    slug: "walking-on-the-edge",
};

const infinityLoopDotsExampleLoadString =
    "N4IgZg9gTgtghgFwGoFMoGcCWEB2IBcIAjAHQBMJADCADQgAOArgF7MA2KBoOcMnhASRxhMOTAhQACNhAj1JEmPTaJOdOIwQALaARC0QAYwgw%2BOBHoBy0eG0miRYidNnyojDuklx6ygJ74ADo4ALSSACpaUkysHJLGOFjoCF4QYN6S6GiYKKnpUKIA5ug0kspwhigAJvY4mYyGWhkA7nB%2BClqIkigVTQU4hZKdqThScFUAVhUo5pKjmIVaAEbQkv2DuB1SolhVYzg1m9pSEJq7KCTBYQCap-FwdTwAbguqHVCni1vSbWh5a0UvEt2sxZDAirVJAAKADUAEpJKtTghoSE4ZdQpIAAoqSrfKoLcReIghABskPQDSacEkrXa2i6OAgkgJhXE9i8UBQ9B6EhqogyH2apWMbEYMBwpVWAEdGOMoA8UWlvDh6c1meMppVZut0BiwpEpCooIU0PEUGw2CNvsjzt4uWU4FAlekVto1hBmugAPSi8WJRHpY61UZQAEDexBqLtJ1jSbTWYIDXmy2B76iUPhwr6yQAQUksvliviuCSKTT2i5Ukqlq8DJRkFgGWMUEzyuDyLN61p4iawc1CZRNatFaiIa7EKhWAAHimRwKkwg4Gx0QYEH4eXpDIxkiYDM1MFVtAQiJQ6FEFloLPhT3R4NOACKE6%2BkujD9AEADawAAvjRQKK0AfvgAAslAAJykn%2BAEQDIGAEGBkHQUYsFAQhEFQf%2B0HIYB8GgRhOGoXhiGYTBcHASR2H-ih5HoUhWHUbhFEEYxRHMfRv4MWRaH4RxNE8ZRXH8cRLHcSJfFMXRpGEbRvHSUJklyVRYnsaRwmqTJAmiepUmaeJ8mcYZekaaxsmCSpulccpxmWRZSlWQ5RmOTp9l2eZ1kKWxtkueZPmiR5hl%2BRJXmuUFamKb5EX%2BaZWkccpYXxVFwVmdpSUGQlMX6QFGVudFuVxZlJn5eFIXuZ5KXJbFJUVdJAC6b6lggCqiCkX6gOum74GQlBnkYYq5G1IBPMujD8EQdDVKaBAAOyUMhw39SeE1VFN%2BDTUQ80jWNy2rdNZCbYtN47fw00AMw-vVICjIUiCYE8-CfpdED3VABR7JYKA3Qgd0oAASrdEDAU1o3IR1-DdeNfWjcB35DVtBBkMdBBqQto0I0jXUo-DXUYyBWOHYjICTfwpJQZd123fdX5PS9b0oB9X0-U%2BYBgGgMyVED7goBdP4-kAA";
export const InfinityLoopDotsExample: PuzzleDefinitionLoader<NumberPTM> = {
    loadPuzzle: () =>
        SudokuMaker.loadPuzzle({
            type: PuzzleImportPuzzleType.InfiniteRings,
            visibleRingsCount: 4,
            load: infinityLoopDotsExampleLoadString,
        } as PuzzleImportOptions),
    slug: "infinity-loop-dots-example",
};
export const InfinityLoopDotsExampleSource: PuzzleDefinitionLoader<NumberPTM> = {
    loadPuzzle: () =>
        SudokuMaker.loadPuzzle({
            colorsImportMode: ColorsImportMode.Initials,
            load: infinityLoopDotsExampleLoadString,
        } as PuzzleImportOptions),
    slug: "infinity-loop-dots-example-source",
};
