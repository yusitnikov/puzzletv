import { FPuzzles } from "./Import";
import { PuzzleImportOptions, PuzzleImportPuzzleType } from "../../types/puzzle/PuzzleImportOptions";
import { PuzzleDefinitionLoader } from "../../types/puzzle/PuzzleDefinition";
import { NumberPTM } from "../../types/puzzle/PuzzleTypeMap";

export const Shuffled: PuzzleDefinitionLoader<NumberPTM> = {
    loadPuzzle: () =>
        FPuzzles.loadPuzzle({
            type: PuzzleImportPuzzleType.Shuffled,
            digitsCount: 9,
            noPieceRegions: true,
            stickyRegion: {
                top: 0,
                left: 0,
                width: 9,
                height: 9,
            },
            load: "N4IgzglgXgpiBcBOANCALhNAbO8QGUALAVwDNScATEVAQ2LUIHsAnBEAKVoFsYwACfBAB2AYyy0IbVC2I4wMNOwByrbrSz8wxSkwDWxfrWGV+AN1osIxtP1nyjAB0dYAngDp+AIQYBCfgCCWJrixHz8hLRmMPwARjAwwlok5FT8AO6YhPxMjDAs/KHhTKT8eVo8MZCwRibJtI4wyFrEotmMtLbCTIVYYfwQAiIDaAKirCwworZYTKKdEEzCngAUAMJ94ZHR/N228Yl2uZ0wpqx2MBRTaKeeACqEMYyTMAC0ojDBcRKievy6tgUAEcwmIYsZTOUAEwADyh/AAGgA1LQgywxGC0NqFJjEYS2WgCWhaEQAcxwvX6pHOjEG/EcxBYjiYCncAEpBEwsDtygyoFAKbFXPxuEwzGT+JjsUUyj1MGMJtd+LN5hglp4ApRKJhFsING5mt1KTF1ML4vxSBBgqcBklielaMKOrY6RYsBBTNSCuUwCkrqYZXjKPlhJjGCN+CsYO5SZ4IKVypYWEx0gMBC4sTalrLHDkE48yo8WKLeDcWM1GCyYh9ggJuMQwPsYpbraZhvbHYXOmmcSxJtMLTSC0mU/wAFQQse7XIWuRuXv92xewtPIslxT5NmeNaPX6Ful8gUwADkAgAMgBZAAi9NopOb52DaEkaXs4WXUuyRXcNBApKs1DwAA2kBoBumECAAOyoKSEDRMICBoLIMAAL7IMAaEYehmE4dheFgRoEHwAArDBcGJIhyEoQAusgoG4VhjEMcxtH0fhzHsexrFMZxPF8TRdH8bxHEYdxIniVxgkSUJTFicJ8myVJCnSTRtHoGuTClvkCCgSA7qhmAOlASAABKAAsawAIy/uZaxQjZADMdmOVZIDUdRAkgI4GgiJQya8DpoD6XwRmmYgrmoCZ4X2ZFAAcawOTZ8VmW5HlqZMwixMYgV6SIIXAcZtkpZFFnETZFkAGypZ56SEIMjQsIZwFBXlTUgaZFVrMVHVrGVkWdVV7meZMsFLNo3DBTlwVtYVlm9TZc3dSZUIJTZK32UNakqnouJKM1uUGaFUVrFVkXhZBSVrLFl2INVal6FaOAsPM945TWWBtaZxFdTZ319V9J1uag4G4CAUKJcNCxMG9nwfTpAPWZF30bZhIDvZ9JnfYlSPOWldB9imU2tUdTm3ZFTnXSVV3lWst3uag6PwyZpNuZ58RoOkCTCJN+3TST83k4DkUrRdwvU5tqAwmYMO1kznVkz111qSD7AIiAqOM8BpmQdTkU63TwOEaDasa7DGOdZT2vi4bmzsEi6tqWifnEC4uC6ZrhWdYjPUxVb3smTrG022EbWkRVyDQbFeMHW7LWHQVYVC4noumfFlsmfFdNqbtwVrOwADEAQBF4ACiJcAGK/pklCMAgAAM7hQqggxnmeaxjUhkj4pRYSo3zCdFTT/22YN2cMLnBfl3XFWQVPVcerX8AN1CpEgKQ/nt8IjYsF3e2mYkWUIX3xMD51S2dcPA2pagOd5XneD5zPU8z/PNeEPX7iWbFkGr+vmmb9vXe7AADqdUwANUMsfeO7UTJzWHotNaq0xYbTHtgO+BcoQlzWF4culdUDV0Xg3SyxEKor1QH/bgADO4iD3iZGAo0kj4GINwfgZ48oOxkNcYw5JY5ozNkzcKg1UBZQUPfEA+dcGSLwSAW+oYxH5zroouuuDfzUnxPIpRSjX6EPcMRVejwICkkIHtBuei6DCB4QgMyq8W5tw7jvGhPdULoT4bLLWGdaZAxACImA8ipEqJvuPdBD9NEBLXksNAGjNF120e/Jeuj9EwEMcYj+ZiQDcJwFYmxYBW5UIcd3eASFe4uI9onIR3jCS+ILiXSCJcKphNkVUkJSiwlqMiQXaJMT8ELziaYxJySTEJPMZY+A1jm45LsVvahBSinONAKUjxBsKmiOqbU+p0jGlRMUa0iJWytHdLfqk/pRjBlpIybgMZIBbF5KAYUqiHkgA=",
            extraGrids: [
                {
                    offsetX: 0,
                    offsetY: 9,
                    load: "N4IgzglgXgpiBcAWANCA5gJwgEwQbT1AxjQgHsA7BAWgEYBfZIk8q+Ox50ymhpkYtzYcAuskICWPdny6tenSUIQAGRYPnw1YiRulr+etgbnTZSzQx2m25owjtThj5TPoixIAA4BDADYQFNgYZAC2cPASARQwYPh4IABKiADCtCCoySkATBlJAMwp+XmJhYggHu6oRmAArqHREVGBsfEFaSWFuZnZRSW95ZWejfigjXGRCaUdmV39fT0pg55ktQAujSkIIADE2QCiKQBCAGIneQDuOGsAFqoAdNkArKgAZiGhKZRgaxg+gWttoknAACADK9RBABkWiB3PQgA=",
                },
                {
                    offsetX: 5,
                    offsetY: 9,
                    load: "N4IgzglgXgpiBcAWANCA5gJwgEwQbT1AxjQgHsA7BAWgEYBfZIk8q+Ox50ymhpkYtzYcAuskICWPdny6tenSUIQAGRYPnw1YiRulr+etgbnTZSzQx2m25owjtThj5TPoixIADZkAxgGsyAFcAF3xQLwgKGDB8PBAAJUQAYVoQVCTkgCZ0xIBmZLzchILEEA93VAAjGBCAdxgYCkjo8O8omLj81OKCnIyswuLBsorPFrh4CQnYqfjMtIyU/u6ijNLyz2CQieSEEABiAEEjgCEAUXOAMVy6nBCAC1UAOizUCDAAGU/kyjAQjAAQyiYXgAKCMEqkl8IUBFDQXkmEl8MC8Xlm8xSaU8VUBYBge3ghyuJNJuW2u32BxUNJUJNyADNKCFCYdabTbvcnlpngBWXmoB4wCBoB6glR8gUgOEIyaIKUfb6/Cj/IEghDgyH8FFojHdUbVPEEqmksmoCkdVnU2n01BMigsqnsmmc7CPF78wXC0XiyWoGWIhDy95fH5/AHAh0ajAQxQ69H4RJY8qG/FW84AdnOADZbSALdErey8/bHUTrezXe6eZ6QEKRWKPVKA3KFaHlarI6DNXHUQmpvqUyBcWmqZmc3mC8by8WbnbmUXnVXuRLa/WfU3/fDA0g20rw2qo2CY5CRPQgA===",
                },
                {
                    offsetX: 9,
                    offsetY: 9,
                    load: "N4IgzglgXgpiBcAWANCA5gJwgEwQbT1AxjQgHsA7BAWgEYBfZYRok8q+ABhZGNMoTcAuskK82A+HR592CBkxb0RY2ZOmKm4/hwBMMiXuWjWOmgtNz4AZiWKhI8RQBGAQw5iANhAoww+PBAAJV0AYV0QVBDQ60jgsMQQB2MQAHcACwgwAAcYDH94Lx8/AODEcLig8tio8sTkxwBrCE9PPIBjVzQ4QtB2mFaCwKDrCqjRmuDR+tQAN1dPAFcekF1YlIxXABdyfD6BzyHg2jHjmKSefsH8M8Sok9ihFO9fPZAXksLhsIiosMnovVHGRFlsPqEECAAMQAMU4ADYAOxwuKpHBbdKCAB0KBAADMMGQALahShgLabHxbSFBGAudwgHgfIbDcq/MrnWqhIGoEFg4oQ+DQpFwpGo9GYrhY6yoAnE0kUcmUijUoUAdUyOTy/mU9CAA",
                },
                {
                    offsetX: 9,
                    offsetY: 0,
                    load: "N4IgzglgXgpiBcAWANCA5gJwgEwQbT1AxjQgHsA7BAWgEYBfZIk8q+Ox4T+gXWUJDFSlGgyaCWI9mK5Ne/ZsLYdxQ1qO5y+AtVJWL10zVx58QAFwAWMDAFsytmOZv5QAGwgUYYfHhAAlACYAYQBmEFQg4MQIgNpo2P948NN5EABHAFcAQ2wMTIAHNzh4AQBjGDc3H1KA0LDE+pjIxAaWhLMAN2y3TO98AFZkADZkAHZkAA4eXnogA===",
                },
                {
                    offsetX: 9,
                    offsetY: 4,
                    load: "N4IgzglgXgpiBcAWANCA5gJwgEwQbT1AxjQgHsA7BAWgEYBfZIk8q+Ox4T+gXWUJDFSlGgyaCWI9mK5Ne/ZsLYdxQ1qO5y+AtVJWL10zVx58QAQwwYyAd3ygANhAoww+PCABKtAMKIQqN4+AMwBXgBMIWGekf6mqADGMA4ObvAeQXHyIAAeAG72IEkpaRnBUYGIUWZ55g4ArnDwIABqIJxFyan4XuX+geWhNXWNCCAAGu3ixd3pXlWhlX4gww1NE+089EA==",
                },
            ],
        } as PuzzleImportOptions),
    noIndex: false,
    slug: "shuffled",
};
