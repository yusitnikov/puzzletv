import { SudokuMaker } from "./Import";
import { ColorsImportMode, PuzzleImportOptions, PuzzleImportSource } from "../../types/puzzle/PuzzleImportOptions";
import { PuzzleDefinitionLoader } from "../../types/puzzle/PuzzleDefinition";
import { NumberPTM } from "../../types/puzzle/PuzzleTypeMap";

const emptyGrid = "N4IgzglgXgpiBcA2ANCA5gJwgEwQbT2AF9ljSSzKiBdZQih8p42+5xq1q99rj/8nx7cW1IkA";

export const CaterpillarPoc: PuzzleDefinitionLoader<NumberPTM> = {
    loadPuzzle: () =>
        SudokuMaker.loadPuzzle({
            title: "Meme's Caterdokupillar",
            author: "A lot of people, really",
            maxDigit: 6,
            load: "N4IgZg9gTgtghgFwGoFMoGcCWEB2IBcIAjAHQBMJADCADQgAOArgF7MA2KBoOcMnhAYURoAJowDWjepjZs4UWiDiMEAC2gEQalHHQBPNjEUBjCDD44EmgHLR4bAATpGIiJIdRGHdA7j16bHokDrawcI4AUn5wOCjoKA4AyowwPp7evv6BwQIQbNA%2BjPEiDpg4DmqYPkysHL5QCQDiDSg4NA4ASigi7QBCcsbi7QCaKLIQAO7BAGLQDgBGcQgecV4I6O0NMBAAbgnhjow46KpwIt0O8FDiZQDmDnoQjA6new6usQ64xgmmMAEoBDdEgAHRwYKi9BicQSyVSHi8cXwFVUCXQAEdGPI4l8VFhziiErcoJgSmURJhjMJCV8oOcoF8wDTPMdGQ5TJZMLdGE8fD9ZD41IhLkVlosnKdziVtOy8nMIEyZcY2IwUMEACqohw4FKLBllGkYrENUo4ClUoGCrXOGBspVjNg%2BA0ylka1EmmCihb7ZYcXTLXAJI4nM4XfmORYICYoVoI1kKw28X5yqDteYqFHCqraiDLBqYzANEqQBksnwJilgMBoVrLUz5DDBACCsgloZKZfqRMwexwJEUCD09H4IGcrkkiiwzH4ADY6OH0AQANqgHbhVUEIgAXxoq-X-AALPOU4v8ABmMg7vcq-gAVmPDdPAA4ryA1zeCGeHwUCC-d2-9wIOcQHrH9z0vf93w3fAIOvaCvxAk9P1ggCP3wYDQIwAgD0oABOGdXyg-gyG-LCYMIwD8HvRDHwIFCiM3UjTxw-CKLQo8aLAi82Og6jMNPbjIMokjOLI%2BjKI4-jkJ42cmOkoS0IQqTyIU6CiDk8CZKAjTxMUjS-zg-h1NE09dOgkTlLMw99K0qidNsiykM01SjI0liCJcz83LwjzDOw7zWM8uyTOwnzbIwpzBL8-AD1svjIqs7SQpisKguM5T3IcjSotQ%2BDssvABdY9jgQKA4DKdZl1AQdhwIShXxq1yQAaW5sGOZdKBoTrOvU3quv6nqaD6kiRpoL9xpoUaSImr8jzmmh70Wmh5qPJbbwKhqh2IyhKBEqEytSKqtC2zQGmMBAYluDhFAmUk1Dqkgn2o1EuVUKx8EoR7qMu66ProdBSrcFAAHU7tUB7dv%2BwHxBHABiAB2SgzifA8q0UMAZDYTQEaRkQUbRzbasIM6LpwK7ODoW6RHuj6vroF7bjeh6nroH7%2BE60doZBsGIZEgGoCB7GUEoJ7EbRugMdkIWRdvMWwBAQmRxJtmbp52mWZABmmfV76yd%2Bjn%2BaB0HqfB2nIc5gWYex6sq3h29xfATHrZQW37flxXTpQc6VcptXPo1rX3v93XybqqHLe5k3efDwXCFhnaE8oB3JaxuPE52gmitHPQYHmPJTyXJcAFpPsWkh1poYvS%2BW8uiqr8vJtryui4oe9W7rouDwb9vm%2Br0gK-r%2B9S471uuqbpdq5L8f%2B5oKeB67%2B857r28G6X3uG7PBuiBHjet47hexr35uZ9H7fm83tuj6XFfF576-V5ns%2BJ4fq%2Bi4vw%2B247mf37IL%2BG%2Br3%2BlcZ4t27jvMuA8QH3gXmAoar8D79zrqPIuj9EGrzvsA9%2BT8kGYNQYvA%2BgClzv2QVfIhd8iE4MrkQ-BdcD6QMmjQ1eFCly0JvnXYBrDj4NwPmeP%2B4Cxq8NgfeHh58t4b1wbPauwjCGr0kWwl%2BQiGGL2-oo2e3C5F4LEZXSe7cNr-kanRHae15C8ALtVE6hAgQAA8rB0Cse9EAt5GiTkwNOB6Z5gIqz%2BhbI2fsqB8y5tjdOSd5YSydmndOCs9HmK0CgaxA5Yn2JnE4-6Lj2YkHcazPW7MY4w2NjTT65tDZW3CYnZOYSQDxwiR7CxCT4lxMIDODozjXG0wyUoLJYdvG5N8YUgJJSE5lKlv0nakSzFExiXE2xtTCBnmGM0tJbTPEGy5nk02BT-ER0CenQZqcKlBNGcdcZdi6n2LPE0lJLTPqLI6V4opkd8l%2BJyXDIJOytmJwOfompkyJn2IPHMi5CyPE3OWRHVZ0cunPO2SEx2Qy9lVKiUc2pUz6kOPOaOVJbigWh1uSsnpGzY5wtKdClObyE4fOicc5F9iyBoqnICzJ2KQU%2BKjmbfFxTCUDOJeUyp7zqk-JOZoIglBknosuekrF%2BsnlgtZU80lGcuWwp5WSvllL%2BWECICKulmKGWSohdK9ZsrhnBPRty-ZKqkVqpAAeTVGLWkSuyXqvFhqOXypNYqs1CKRyquOeq3o8ztXtMZVKp1ELrZVnDa8uOEaI3ksRd8n1IB4a0ttVc%2B1nS7n6seaGo1kaXXUHNfG6ZIAnz-NFfSwNuqM0hruXK41oT3XwrGV6i1CayA2rFdcoNjqWUGuzXm3NSqRkFpsZap87by1LODT2rNNac0Kt2YO41w6BWEFwn6gFAbJ3doeb0zZUbo0DoPQTT1mhvVFqIMmjtaacWgurX0-t87a2xubYWlFt511ls3cCqdO62VwyPY%2B-dB7n2npbUW3C46v1dqrdO3dBLF0Do9U20Dr7TmQbtTqh1MHf3OoQ4BvNIGvkjoTbeUtWqMMVqw7i2Df7a2IcbYcl9xGi1JP9RRrd2G1kzvvXht1C6XnuxPURldIAZwfvI6mzD6bqM4b7bDADfGw3AeXVSwVZ5xMpvFVJm9zLZOzoqQp%2BtC6FMqctfDDTV7tNMu6TR3DhmYXGaPQrLO%2Bhc752XIPBa485413vE-Tuu9P4iKEZo4uo934HgEe-CBkiG4zn3t3bzP8G7wxgaPJ8AjR6RfXpfe8uEO59y3pQARj9-Ony3gQnzfcBF9ykXQvuxWtEyK3tl5%2BSjQFNdvlvAewDh5APkUNJ%2BwDwvqNnu-VLlckF93i5NgbRAJtLiQafRr0jF59wy5QgbC3SEkMYXFlRb8uEHdHvPObG3mHNb861m%2Bs8743eIfeGb981tb3y83E73msstYS357uK32FFfEYd%2B8C2kH4KflQ0LLDu4ENofAobq98F1cwd3OrM98GtYe15tu60NobS3EAA",
            colorsImportMode: ColorsImportMode.Solution,
            extraGrids: [
                {
                    source: PuzzleImportSource.FPuzzles,
                    load: "N4IgzglgXgpiBcA2ANCAhgVwC4AsD2ATgiACpoA25AxmliKgRuTGDHfCAHKEC2FABIgAeifmAwATPAGsM/RszD80ABxXkAngDp6IAOYEIEhAG0ToAG4UMceAFYAvskvXbiJy/I2EARg8grL1sAZn9A73gAJjDXBAAWBwBdZHMA2KiYoIRQ5zSs+ATc8NtHIvT3Mvy/ZNTi+MyI0s8IiubbP0qInLaEaJqe+G68iI6B6M7bQoGm4bcklIHR2d6GkNWEVuWC9ft52vKdqa2ZuoyJ3x3QxOSQAhgAOwAjNHvTUHIIe5ZTExAAJWCAGFIro/pFAcFQT5AXEQNd/B8vmAfv8gT5QXFAejUH87MC4YkEZ9vvAzP9MZCcUDYVTAXYCUSkSi/oh8TjWZT/njYfCbojbKl+cjSb8AWz/uDOX9oTybnhsPzAcQAMQAMQADIgAOwa3QAdyMuAQ6q0kTsqAAZgQ8DxAXh7mAsAQ0J92P8Hs9XoySWSxdjyVjQXiQddUPKsIqVRrtbrUAaJEb4CazZbrbb7Y7na7iH8PS8QN7hb6KaDqaW6QSwwriUqOGrNTr1frDThjabzSArTa7Q6nS77m7c0984XmayQeyIUGYZWQOHI3Xo43mwnW0n26nuxm+9mOEPPQWbmA8F4sBB7aZzSgfMhgshIsg4vfb4/kFfkDen++b3eH3ebw+X7INez53igQHgW+z4/oSQA==",
                    offsetX: 4,
                    offsetY: 4,
                },
                {
                    source: PuzzleImportSource.SudokuMaker,
                    load: "N4IgZg9gTgtghgFwGoFMoGcCWEB2IBcIAjAHQBMJADCADQgAOArgF7MA2KBoOcMnhAdQAWKFG3S0QcRgiHQCIAIJs4UTAGMABABU4AR0ybFJTQAoAwlEbo4AEzREA7AFYAlJPUQYfHAgUA5aHg2TQA2AA9QzXRGWwgAa0ZNKw50TTh6ejYATxIAHRxhUXF8TQARTABzTAQ0zBx0zUqoFGzNdUwodQ5NITgANxRNBAhNACMhrLh1FFtNeuGRaN4hjq7GFShNaHsthdkhyEYtmbZxRcR0luGIRnURObG2g-bO7pQTbSW197SYKqECF6AyGI3GQygEAQiFmN0Wq2gLXUQPoECwCGwDSemgAnJQAA00TREAAcBKJ0E0ZEcBJIkgQ2Xo-BAMTiiUkWGY-FCdFO4gIAG1QP04GxGPwACwAXxowtF4oIzhlcrF3OVIBFqoIZHVmoV%2BAAzLr5fwiMatfgzbKNSaCEbrXr%2BDqHbb8NKXRalR79aFzfqvSqfX7JcG7aHLeHnYGneGrdGw97%2BAGbRbfYmCO744bw5mU-q43m1en8FHC4rw2ms6XHeXiwWa27w0aALq83DoBBQOD1WqC0AMpkESjqgemugtartwWUGgzmdEGgLhdz2eLtcLsg0Tebg00Xe77dbvfH3cSmhns-OGhXq8X8-Xh-OZsjxlOyiUTcMVS8CT4IUgUcFDENhMHodBOHHcIhxIRxx2yaDYKkHBKg4Ic6DATAzgUABiMA8Pw98OU7BJmWw9QwHI8i8KIyF4hQARMFsWRoMoJVWxZbIYDGCB%2BT-AVSCvA0SCfGgBSEq8BNbAUJWE89hObZ9rUAkt30-ehvxgX9-2UgCUHCPw6AQPS-EICUOUwLloLIK8kJQ-gZxZYi6IYpihBYz8O1o0j8PwyQMKwwhsPfYLqBfQdCCM-T6WMhQyHMyz8EocgbLgZDUMSuhPJIlzmMSqgPKc7yfLAPzMLYHCQsIsLmUigzdKiwhQni%2BzkroVK7LQxyvJyty8o-TLCpw4qSvQsqKsqkBqoUWrooakBnGaqyUrS%2ByBu6xjcqS-qupIobitKgKQCCiapoimLDJiwgDUWvLrLalbOqy5yNt6raCq8vafIO8rAsq0L2PQTjuN4gV%2BL3eTRIE48iCkndZLIKTdyhg1EdkhcJSks8oZh0SLwh6TZLPBHn2fKUgA",
                    offsetX: 8,
                    offsetY: 8,
                },
                {
                    source: PuzzleImportSource.FPuzzles,
                    load: "N4IgzglgXgpiBcA2ANCAhgVwC4AsD2ATgiAIIDmMAdliKgRgDYxgw3wgByhAtmgwASIAHon5gMAEzwBrDP3pMw/NAAcVDAJ4A6ADqUAKjhj8JEMhCz8IlfrmMBjCAXtMrSmAEcMfW3ltGxDG5+PAAzf2NTcywlPBs7ZSwsNHsjCWUCAjwAdy1+ABEzCyU0AmM+BhyYdKw/MpUYNEs+OLIIjKzskqVKHgqNZQZK7Or+ACMBvDsCeUZmLVoQMgIICQQAbXXQADc+DDgkAF9kHb2DgEZj04Z9hAAmK5Bdm4OAVkfn2/gAZg+zhAALIcALrILZPf7wd4nCEvBC/GGfA5AxGQy6ouFHDFfB6g8FI+F/TGIIlfdHXHGk5FUhDvPEUg4PbHU5m0mk/dnk2FfEn07kshls1kc4Uk4VMwXwS58glS9kS/kIMWSlGS6GS37A0HoTI5DagBjWZgbdYgABKdwAwndFmbvpbvrb7QCQFrUPYYEMwBtzVabcDHobKMb4JtfZbzk6I7aAdG3SAPV6fRa44Gjd7Q6azbHHagza9ra7tYmGBmsznXWng2WswWXXnEA6i+7PaXk3XKzCgyGw9nLYhbQXXrbGy74yWy+bYwOA9qwHgblgIHENihzsg7shXshvsgAVud3vkOuUJvd2uN0ft5v99vdyer4fT8eX5uULedwGgA",
                    offsetX: 4,
                    offsetY: 12,
                },
                {
                    source: PuzzleImportSource.SudokuMaker,
                    load: "N4IgZg9gTgtghgFwGoFMoGcCWEB2IBcIAjAHQBMJADCADQgAOArgF7MA2KBoOcMnhAWRQJe0egAsI6HJnqc6cRgklQCIAArjMbWQAIAcigDu8PHQDGEGHxwI1%2B6PDa6AbAA8Xu9IwAmEANaMulCMHOi6fro4EAi6cPT0bACeAIQAOjhCcDi6Apgy%2BLoAKuIoXhBsStg5CBC6ypjhTKwcupa2cPnhWG4RjQj55rE%2BmADmmAjhYFBWukQAtACcJLrqbHDmZXB947H5uigb4m0obM7e5sfKiAdHwRBGNG0VjDA4T9k%2BuhBKOjgoXygKHGuGeHS6t0u3zA9VK6DKPR2E3CKDcGwQyW%2BOE2kPEJAyAlCA0SmHMiEwADcygBBKAzIyFAAiY2RcTYuFGcTpD3CMEY6Fi4jgVLiunoMx8jCGBwAjow4M5arCyrURM5xlScvtlGVLHSUOh6LgRjhOeZMFBzK1oGLtM4ABRAuBfDhgBDzWrzKBjcSxG21egeiDzABGMVqMAAlCRaCAEEk5GpzPyI7GjJgfMoCC46KUfXZ8DmQJszugCABtUAUhWMfhkAC%2BNCrNf4REbzcq-EW7ZA1c7BAArD2%2B7WCAAWYctggAZkn-fwQ6bvan%2BFnS5H-An65XDe387be9H%2BG7h83c6PJ47R7XV9b57r98Hj%2BPz8Xt4Iu-f%2BC3X5vy-3z4Hl%2BP7-keb6gfwf4bgQl4QR%2Bz5QTugHPrB0ELs%2BE4ALoWLgApQJ0thlvglZxgmdaUJQf7xom%2BBEHQQIgjgRHlpQNCsWQNAcWONDcax7GcTxgl8QJXGCXRdHTjQkkDjQMniVJCkyXJNASYpsmYT21H8JQmlkeOlAABx0CGoQhugADqEziLS9LMaAJlsCGADCpxsMxkljthIBwNyRjMeWkmLCp3FENOmEaUuDnOa57kDl5Pm2RWAUyWQQVkJJRAuOFPZRS5pYVmQKVZQovn%2BWQObTpJ06eRpXkCkkHBcCAUVNVgzDaSQRngHaagAMRgANg2xnhAT8KADTmP4-zoERlAkHRxYVNAfVwKta0gPWjbeb5TUTVNBqzfNOHsqohC9Wt625ocPgAMqYO1BBzdOQ6bRp9ZAA",
                    offsetX: 8,
                    offsetY: 16,
                    overrides: {
                        maxDigit: 9,
                        "product-arrow": true,
                    },
                },
                {
                    source: PuzzleImportSource.SudokuMaker,
                    // TODO: draw moons with custom constraint
                    load: "N4IgZg9gTgtghgFwGoFMoGcCWEB2IBcIAjAHQBMJADCADQgAOArgF7MA2KBoOcMnhAWQi4AtAGVGOAAQBhRGgAmEANaN6mNmzhRaIOIwQALaARADEhqQAUU6BBF0BjCDD44EpgHLR4bKQDYAD38pdEYlVSkoRg50KTh6ejYATxIAHRwAESg4AHd4qRxRACMcnEdDTBwAcxpC0SqENHQURwQq6qk2YXopI0QpADdMLAQ4lDgKqWKIQKkUQMmEFKlcRxQSKQB1TCMqgpnAuqMULp753cM0KXo4dBa4oygIRmrLOE0pGGEcOLgcBT1UKSdB1aDxT5hX7xAFA764dCbAAqVzOEF6jn%2BRQQNzuj0Mz1elhOoV4pwQyXopwgYCkjjYjFO%2BwQuQgdIRrQMmEGKBWjBagKgKGq2F%2BmwAggoAFaTFDuKQKTAisaraQk7rohWYMBga7FZLxHEcO44gDMJF0FKppjCEUYuiwzH4-jo6006AIAG1QIMPoyCP4AL40H1%2B-im4Ohhn8MiRkC%2B6MEACscYT-vwRFTYYIABYs4n8HmQ-Hs-gU8W0-xMxXS0GawWI-X07Gm-xy1Hm-n00WO%2BGu87%2BwRq72h4P8HWR-hG5OeyWCy3J%2B2553W7mxxPl1Wx0vKwRp5u92Phwey2OFyfZ7vx4GALquhEIHKND34b0gK38Shxj9DuhCkUIl6lA0MBwFEDQ4HgaBIEQbB4FkDQCEIaaNAoShSGIahWEoTmNC4bhSY0IRhH4XhRHkUmN7fpSMaUJQCEMNovAvm%2BP6ELybCYPQLS6FAgQEJQJC4SAUDJAJQl0P81QcAJdBgBobCmAAxAojiqXROoOo%2BKj8CASl0QZBlac8ygoDsChGAJt50OgyQwDMbAsZ6FCEYJlE0J65quSQ7meT5EE%2BXenqkIRIVBV5iGBR5LmRb5MVeUFbmoVFno5v5CUeUm-kueF-lZb5EVpXF-lFYleWBXeIA8HwpgSL8IDUda%2BBkHRDG3DkMAsaAbEgBxXE8X%2B-H4IJwmieJwlSTJw1yQpyk6vNYDGTpymGYZS2meZlnDdZIC2fZECOV6fkoSNQUUOhQlBVlF05kFaVoZd0UkDhj3HURr2kChpC3VRVGBkAA",
                    offsetX: 4,
                    offsetY: 20,
                },
                {
                    source: PuzzleImportSource.SudokuMaker,
                    load: "N4IgZg9gTgtghgFwGoFMoGcCWEB2IBcIAjAHQBMJADCADQgAOArgF7MA2KBoOcMnhAEQiMARhwAE0cQDkICABaYcAclog4jBdAIgA0ihw4UCZenEC4AEzUBjCDD44EO2bDhtxANgAen8ekZLCABrRnEoRg4zOHp6NgBPEgAdHAAhCG9xEWhLNDNLTAA3TFzxNiUUMyUECH8UAHNHBDMAd0wFcQKwMDQDBH9GGHQacRb5XskjAZhRzDYPERRO4TElhSW5cagSNQR4%2Bn4QAKDQtSxmfk86GxR59AIAbVBC90Z%2BAFYAXxpn1-4AZm%2BvzYbwIZCBIBeIP4RAhUNB%2BE8cL%2BBAALMjoWiMQikT9ISj8LC8fCPtiAWSwRT8ODiQSicCEejaZjEVSvsyEYCOZc2VSuQz%2BEyBZTuQR6fiWeKSSLhfh2bL%2BRLGVTcQqqUKlTzRdSqVKCV8ALrXXDoBBQODVe74J4gPYHAiUCF2mF0KANbA4K0PSg0H0%2Bog0AMBv2%2BwNhgNkGiRyP-Gix2PRqNx5Ox1E0NNp940LNZjPp7MF94Gp37fhkSgVujlIxem3eB0kLMgeJixsQ%2Bv4SgkADsTZbhLbeI7AebrflIGH5D7Y-bY7o-dI48n04HvdnA5XNNAy-nYKn68Xu%2Bpg%2B3rd7R4oS7BF5PE73ZE3t47l5vhpodbno-w-yfZ5XP6vakjwA9cKAfYDf2Pf9IIoc8vxAocCFjeDIJ-cCUMAgCILfD98FRRsj0Xdd8M8dCFxIUjAPwuDyLXRC8JIAAOGjW2YwDN3Xd4SCIMi9x49ipxvB9OJIf4WOPMSBMfKSbzo085QI%2BCROg4T6K46CBN479II04ie10%2BiSK0n9JL0lScPk-DjMg-DJIgyizIguS7wYlcNQ7fC3P3QzFP7TzPiNXDPKPdS9Lsr8uNMnytK41TLO4mKEqokL1x-Nij3wtjUv0jL9Oyyjcoc%2BisK-fzitE8SjMwwTSry8r%2BNyrLipS%2BiKHSiKktAnKOrilyKAKjqovkl8OsAihwv7SLnOfGrJu84akpCzrWpa%2BTSHavymOmv9cu2gcBs2oq1t8tE20ChaVy7MaTs7OqLsIrqV1IXqZqemDuvIzDCNQ2aZ3Kt7qrel6kJu8UOxK-suz2iGG2qrSrtSo8Edaj7YcepGzqNI49g4LhbUUGxghrK0u0oABOY02G0QgAGIiDARibk8bo1DYOB4jQHRcjADQ2GcT4AoFoA",
                    offsetX: 8,
                    offsetY: 24,
                },
                {
                    source: PuzzleImportSource.SudokuMaker,
                    load: "N4IgZg9gTgtghgFwGoFMoGcCWEB2IBcIAjAHQBMJADCADQgAOArgF7MA2KBoOcMnhAYURoAJhADWjepjZs4UAAQANALRCA5inS0QcRggAW0AiElQ4AIzh46AYwgw%2BOBCYBy0eGwUA2AB7eFdEYxSQUoRg50BTh6ejYATxIAHRxVIJgFWzhNdBoFAHcDNBQFQxKRTHVMBAVMHFKizLZGEswosuUVdIVIRQ6ECAQ4LyqANxQcPOsRBpKszQUYRnQaixKOrGYSiDAGxCaW5JwAEUrqqLEcAHIaqBR6FH266MzslBIFDS0FS5va5zQ6BQthq%2BWqBgUj1sEMGRSgHwAKo1bM0SsN8nB4lF1BBvnUBrNShB6CoOGAavYoDg0AodoT5u8dAh4g8TEEQowdJt%2BN47ChZNp8ABtUCjYYtAgAFgAvjRReKebL5aiCABmJUgMUq-BkDVaiX4Ih6hUEACsxu1RrlmpN%2BHN1v1-F1DttMpd2vV7oN3gtBudyoNVoD-DdwYIPq9-HtYfwnpj0ZtHt9isjBCDiYNoYzTuTatzOvz6cdZvzEZjWeL%2BDL2al%2BYTlbjNYLqcN0oAunZcCtzPjBSKQMzWfhKBrB-wiHQ7lUuwQhZQaPP5xPlwvV0uaCuyDQt1vVTQ93ud9v9ye95KaOfz6aaNfr5eLzfH6a26OWU7KJQJyAGX2YyAAHxENQfICrORAAJwvi2AFATotj8mwfaQfmIDeHBCF9mQqpQX%2BaEgYhs6qthKGAZK6GgcKRCSi%2BHYgCs8QcFwA4oL4Lj4KA9hsMYhAAMQfvx1Cyt%2BbxMZx3EgHxAmCdK7YyUAA",
                    offsetX: 12,
                    offsetY: 28,
                },
                {
                    source: PuzzleImportSource.FPuzzles,
                    load: emptyGrid,
                    offsetX: 16,
                    offsetY: 24,
                },
                {
                    source: PuzzleImportSource.FPuzzles,
                    load: emptyGrid,
                    offsetX: 20,
                    offsetY: 20,
                },
                {
                    source: PuzzleImportSource.FPuzzles,
                    load: emptyGrid,
                    offsetX: 16,
                    offsetY: 16,
                },
                {
                    source: PuzzleImportSource.FPuzzles,
                    load: emptyGrid,
                    offsetX: 20,
                    offsetY: 12,
                },
                {
                    source: PuzzleImportSource.FPuzzles,
                    load: emptyGrid,
                    offsetX: 16,
                    offsetY: 8,
                },
                {
                    source: PuzzleImportSource.FPuzzles,
                    load: emptyGrid,
                    offsetX: 20,
                    offsetY: 4,
                },
                {
                    source: PuzzleImportSource.FPuzzles,
                    load: emptyGrid,
                    offsetX: 24,
                    offsetY: 0,
                },
                {
                    source: PuzzleImportSource.FPuzzles,
                    load: emptyGrid,
                    offsetX: 28,
                    offsetY: 4,
                },
                {
                    source: PuzzleImportSource.FPuzzles,
                    load: emptyGrid,
                    offsetX: 32,
                    offsetY: 8,
                },
                {
                    source: PuzzleImportSource.FPuzzles,
                    load: emptyGrid,
                    offsetX: 28,
                    offsetY: 12,
                },
                {
                    source: PuzzleImportSource.FPuzzles,
                    load: emptyGrid,
                    offsetX: 32,
                    offsetY: 16,
                },
                {
                    source: PuzzleImportSource.FPuzzles,
                    load: emptyGrid,
                    offsetX: 28,
                    offsetY: 20,
                },
                {
                    source: PuzzleImportSource.FPuzzles,
                    load: emptyGrid,
                    offsetX: 32,
                    offsetY: 24,
                },

                {
                    source: PuzzleImportSource.FPuzzles,
                    load: "N4IgzglgXgpiBcA2ANCALhNAbO8QCcBDAOwBMB7AWwAIAHAVyih2oHNyYxqAjfPkVIXpoAFuXwIQtLIQCelQgGsY+RAEYA7ABYBBejjAw0kgHLiFWaogAeiagGV6FRfWr59naoVrTZAOgAdYgBpCCwcfGoAY0JWTnhqAHdMEQhiL2jYmGRqUghWTC4KYgByNDcYWhhCcpJSalEYWWoweho0cgaRGBaLS2I27hVqNK6ejtpqHAAzcvJprprMuL9dVnwIUgQAbW3QADdCLHpcNQBfZAOjk4QAZgur49wAVgeQQ6eELTePm6Qf664ABMZwAusg9u9AQgQZcoZ9/nDfrhvkjofB7miEa8sX9zuDIcivgCEedcbhECS/jjHn9YbTcPcCQyEDT4XSqYzOQgySz4Ki+ZTmeyKdz+WLeSKYWLMXzXsKiRixWzFfSpYi+ZLFd9QeCQIowhEYnEdqAojBwmAdiAAEq3ADCOlQNq09tuuhdjo9rueHueXr1ipAal9b3NlutNv9QL9bo9iDjgfRIA0IDDFqwVvg21tQPtvudDoLtodiBASYRwYADGm4eHM5H/cWo/ay86E76K38QABOWtmjNZnM2vPuwv2mPj91d3DBtRpvVgcjHDDkYg7NTIW7IZ7ILTIFBA5BHlD77e7zf7zcoXdH8/HrfIS8Hl9Xh/3+8np970FnIA===",
                    offsetX: 36,
                    offsetY: 28,
                },
                {
                    source: PuzzleImportSource.SudokuMaker,
                    load: "N4IgZg9gTgtghgFwGoFMoGcCWEB2IBcIAjAHQBMJADCADQgAOArgF7MA2KBoOcMnhAQSgBjBJmEACALIQEAC1og4jedAIgA0phw5M6XIuEQYfHAnUA5aPDYSAbAA87E9IwAmEANaMJURh3QJOHp6NgBPEgAdHAARTABzTARAmEZ0BAkcWQk3FGEoFDh0FCC2XHiXMoB3CXk0GGMUBDR0GhcEOCgxHAqwKGNauRKAI39hiRQcNxJFBDD6fhBXD29FLGZ%2BOzphFDY2dAIAbVAANzg2Rn4AZgBfGlPzy4IAVjuHi-4iN5Azj4I7b6-J74MiAx78AAsYL%2BIOhwKh9x%2B4P%2BcP4r0RQM%2BqIItwxyPwXzxMNx72B6NJkOx%2BABROBoNplIZKKZsJZJKRMPJHOBhIpzL5rIFCIFvO51ypXMxLypoql%2BHZcvpQqpAIAuttcOkoHBtMkjqA5gsCJRvobPnQColNUdKDRbbaiDRHY77Xane7HWQaF6vVcaH6-T7vf6Q36ITRw%2BHnjRo9HIxGY4nnqrTfNrpRbUtqgQEH4UHQ6rBGs0MEdDmQAOzeh1%2Bivqw5XQMADm9zvDAE5646W1d61dw2R296yPWyH6iHX1Us5hwuCAjGUoOoAMTCNfr2ZycSeHAodAHfCUEh%2BkCjNjDABKcDcmDSxpIUJuKZuQA",
                    offsetX: 40,
                    offsetY: 24,
                },
                {
                    source: PuzzleImportSource.FPuzzles,
                    load: "N4IgzglgXgpiBcA2ANCALhNAbO8SGuGQYYZB6hkAqGQIoYACQawZLB1BkDMGSweQZAYhkoAoBZAQwGsYlTJQAyAezF8AtAEEIAJwCUIVDwCuaABZj5CEDL48wmgOIAmAMwqQ8tTjAw0egHI6AtjyyVEAD0SUwNQATSTVKW3tKHgAHaKwATwA6AB0AOzSTGHkPVMoAdU0IMGissFEIVJgy5OTKGSCAKx4AYxhUtEogiABzTDKxXJ5KbvkYNsosCsE3NTAOroAzBazKACN4qI6cIw6LFPTUgGl5MWi+CEoAETE0atrLnr6AmGieeR40GCC1jaHVrBafE6N0omh4ADdBEMzPAAIzhD4QMTIKKpb5dXq3Z6vd6fb7rSgAd0Kn2BWLeUMaLTaaESlFcHU8XhC5NGlEqrTAYDeEASwwgkNS+zS4kksgUlAAEvFVvIIN8alKYD4eN0BpRmlg1FUos1GWUsBJpDwJZrtWA6QAVTSCBYVTzDOXfGZzNaCYw8IJfIS5QLNTRRIk8DZaD5CDrcjBgO060XSOTycJ2KqJawjeUIADamdA4M82oQAFYAL7IXP53CIUvlrW4AAs1ZAedrCDMjebBbh7YrCAsxYAusgc02e/A+2WRy34G2Jx3cLDu1Oq7PRw2V1OS4Ph3OEMua52F+vO+P97gS0fcDPTwgG1vr/A1/fz/er5OD4vjx/KwOhy+vzf/3gZ831wE8QN3QCFzvcCuwvXtAL3GDHxg4Cd2nAdBxARZllGVJWizUBWiwLAwCzEAACU6wAYTMaxyMLGiQH7RsiJIsjKKoqxUA4usmJYmBiNI+BMwoiwqN47izHEviJ1YoSRPIqTEDosTlOY2SBLY4SKNhaTuN0ws+Mw3EkQIkA5PYqTaO4sTaPUwjNPkijqNhOiGNc+zzMc9jEE4ujfLs/jBMsqjDJs0KjNQZpVVwYcLO08jdN4zCxA0SZKiovQAGIAAY8vy6wFgGNBMrwXL8rykAgq0hTdLU1BUuwKZSpAcqKsK4qWragrqqc+iqPqkBGvSmAuoqyrUCK9oxvGqqNOChLfMG4bmuy8aco66a1tm3qfKojyGrS1ayvWzaSu29rdoSlymMOpqMougrJs6x7KquhSxKsFKjoek7Zuera/suzCRrMkb5IU3yuIohiJJhiLuKWpjvvu0bssQAB2AAxHLMesQl5S0BAcsSWEAA4McLSaTjcKiBjmd4KicPBMmyHhcgKIoSnkUifxAYkudKMGpghiiobcvT4bCsWBuR1A0JAKw+bAMQtQwAYsyplA62QMxkFhZALEN3X9eQbXkC102japvWdZ1m2rbNk37eNlADYNo3zZt5igA==",
                    offsetX: 44,
                    offsetY: 20,
                },
                {
                    source: PuzzleImportSource.SudokuMaker,
                    load: "N4IgZg9gTgtghgFwGoFMoGcCWEB2IBcIAjAHQBMJADCADQgAOArgF7MA2KBoOcMnhAOQgIABAFkAniKRxGbBLRCyEAC2gEQAa0w4I6FJgAmuRQGMIMPjgWEAtCKGw4bEQDYAHq5HpGxzYxEoORR0ETh6ejYJEgAdHHsZOQR0fBEAEUwAc0xkkR0wkVM4TJQReCldUXD6FDgoPJwwnClTFDYXaFUITNxnKLDDACs4VusRBAhxlVKikpJ0rJzQsQBBAE1AlBrEEQB3HJV8uELilFj4kQBhNkYQsKhStggITVs4HENbdDgWm5CaPaHUwqMo-MIRfoGVRocaTaGFNpsUL5eGzUrQKYzRGhTpqHo8dpSOBDEYoMYTTEnOYiABiGJQ7l4kRQAOOpj%2BIggYBEAHIyAAWHllWo4UKqHbQh73UpQ6b1BkjBD9BC7SaC5GNVGnAEYlVqnk4qBdfF9Ikk0aiClauaKBASGoaHx%2BRiKLDMfiuOitdroAgAbVAADdnLcCEQAL40IMh-hkSPRv4EfnxkDBxP4ACsKbTofwrmzMYIAGYC%2Bn81HU4XM6XcyWKznYzX%2BMn61WI630y2E7Wm2He3n%2B3GO7ms8PG2OCOXu-xR9Pi-323P8F3K%2Bm60vF6vc0OlyuGwRZ1uPf3D-vl-2p0e%2BxP8Our-g4wBdL24dAIKBwHTJf2gO0O-CUCmf78EQdAPNkr7%2BpQNDQdBoHwTBiFwTQCFkDQaFoUWNBYVhGHodhBFYfyNDEcRGY0OR5GkSRFG0Rmj5Afa-BFpQoEgGivr4AG7HYv6RAABwoQAnOhxFkORLHYUQz73oBFbekiUEoTQnoAOwoWhRBFjJZ5yaACmcX6mE0IJIlEMRRD0XQukpgZ-pkShcHwZ6RCqTpVZ6TxPr%2BmQGG4YJZAiUWxFFlZsm2bxXFkNBZCgWQnpkOpRaYdp1keeGMlvhIHBcCACAMjY%2BkQE8UAaAAxJQlVVSAkbsacuXmCV5VVVVRZFjVtWGJg3wAEYcIYBDvrcjH-tFrFeqchlLiAZiRX6DlEE5DE3jNXpzQK6ESdBRbSf2IDibN3lcZZ6FxW5e0CodilcYJWkofyDGZXaOX4L%2BBUNcV6iEBVLXULVaIfU131wEJGZFigphgGAHV0DwfAaIk8i%2Bhl4bhkAA",
                    offsetX: 40,
                    offsetY: 16,
                },
                {
                    source: PuzzleImportSource.FPuzzles,
                    load: "N4IgzglgXgpiBcA2ANCALhNAbO8QHUYIAnAE2QAIAhAQ3IoGUAHAezTBFRoFc0ALFsQQhiLAMYBrYjTSxRnEdxxgYaYQDlBAWxpYKiAB6IKYbqRYTuFYkphgKNJkywBPAHQAdAHYBpUUwkICgAFGhIweAp1bi0AIxhiewgvCjEYLCx7MRYvLxgxNBhSCliXCgB3PkwYCnN2Ci1uMDQSmuyvFTFeCAA3GABuWogAc0wsnLyCopKy2KwaSVq2e0bm1opkhwoAJngARmsZCBZPLwAZTGwanwgMhMjouIT7Fl5IUhr+GuHiCGKaYg1C5oK4UG53YipLDcOyUL4UHq6GEvABmFSqYj4DSaLXitSK3DSxVKFHhYBYWD6xDcFGBoPBOEhYmhdhMMVJfBqpBGYwoKNeXmKOQ5NWS3LEMmm3JowxyuhpABVOSooci+RSsCxyiKTDQtDUpCwAkEbMo3Aofn8EABta2gREshAAZgAvsh7UjcABWN0ex1IX0gB0whB7QPB3AAFnDnoQ2xdAF1kHag7H9jH/fH3an/dHsxGED782nXcX/YhE8m/SH4Fnq1GMzXS/WEBWyzWiy300mUwX4J2czW212w+3cM3B7g65OENGe13hzP4BO+9O+3mR43vZXe2mN0vR12B6ut63T8vE0mQFhLjhAhDTFobaA0hlhAAlAAMAGEnQpX5kNogO+ezfpGCjvts35ehBTrfogIBXtygIFMcXjCAAIu+ICBgBH4/uBqAARw8DWsBoEwagkHwYhqDIfkGA5Jh2G4ekWAflBADs/5sSRZHvnBCFUZG0EQV6YEQYgv60SA9GoUxeAYWcOHZnheBfhJRG8UBIHSVRUHbLB357DJcmMehinKaxb7qZxekgMROlSYZVHiSZSEkAxaHCAAqlZqlsR+dl/lpGR8cBUmEcB4mUcBIkIR5KHmb5LEeSiKIJDAXhpM+DnaaR5GifpokJtZgEFdRIXAVB4GlQFYU6XBUXUbVlYiEcLC5Y5FWgUJhUwXVL75fxUGxdRCVleF40QVxiGTTpBEQT+f6lVe5LQslpFOsgXrICgezIJGyDbMgB0nUdu3bSg53IFdO2nfd+23cdh17c9N0HbtR2fS9KBOqVQA===",
                    offsetX: 44,
                    offsetY: 12,
                },
                {
                    source: PuzzleImportSource.SudokuMaker,
                    load: "N4IgZg9gTgtghgFwGoFMoGcCWEB2IBcIAjAHQBMJADCADQgAOArgF7MA2KBoOcMnhASSgYA7pgDGACwAEABQAyAQQDKtEHEYJJ0AiAAqklNIBCECAGtpAdQCesNeIgw%2BOBLoBy0eG2kA2AB6%2B0uiMACYWjNJQjBzo0nD09Gw2JAA6OOmy6DZSENLyZuYAtHA4oUXKcDbSANKYbBwY%2BNIAIpgA5pgIcZg40vS9luJw7Shx8NU4EAhRKPQoiCTSAKJwUtKhHV3SvfHSw6M7ZSj%2BY3viKA1H0lpG7VCYoUsGRhdXmHFsEMMIKKHXt2kACMIP5pGItDdDBstggAORxHCMGBAtA0AHQ9C8Iz0CBYBDYPoQyS7QEgsFwOKAt4%2BRyuOC9XrtKFGTadBBLRQw9nSCZHUInHbdaQQER9GnPaEHV5sRhGdDaGL-VGzOD-Sl7L4WEplIpY6riWVGLSIfYQRiuKnQpEotAisA3TB8OJwbnbBLzOAYa5wK6A3oC07-GnoNI4ISiCSSZqrdYEvgs6QcBC-KDSLkehYYdHbKBzPPoFCuPabMBgNBFmYAN19cpIagQNnmuhC4XMjDUWGY-F8dBDBAA2qAa0aCABWAC%2BNGHtZ7U5no-wRHnIBHcoIAGYV2v%2BGRt7OCAAWfeLvfT1cH-DH887zcn9f4Sc3y%2B%2Be-8ZfPxfXhcPrefh9nj%2B75vuOIH4K%2B-5zpBBAfkBoHQfggEXl%2BYF-nBS5gUht7gWB37Ib%2BYFPuhaH4fwRGkUeYEQehsEUYhE4ALp9rg6AIFADKWoOoCNs2%2BCUCuPHvnQeadCxg6UDQEkSUQNAyTJUmSbJSkyWQNCqapG40JpmnqWpWn6Zph40EZRljjQZlmSZxnmTZY4MQJTa7pQlAySA0roFxdEgIoigOJcbAefgA5kAA7FpG72Qh3m%2BX2-mBQORBmWQRCReh0V%2BQ08VEEZRAAJxqZQ9lMSArE2BwXAgL8-huPgoCOF8UC6AAxM5rXUFObkjPwdUQA1zUoCgZAAByhGQZYgBOk32ROQA",
                    offsetX: 40,
                    offsetY: 8,
                },
                {
                    source: PuzzleImportSource.SudokuMaker,
                    load: "N4IgZg9gTgtghgFwGoFMoGcCWEB2IBcIAjAHQBMJADCADQgAOArgF7MA2KBoOcMnhAOUZRMAazgAjFAAIAEgE8JIgCa0QcRggAW0AiACycTMxQBxRLroBjCDD44EegGwAPJ9IDKjZRFGNpUIwc6NJw9PRs8vjSAApscFYy2jLKmADmmAghYFC20kQAtE400riJ0igJWiWYDhAVAG5o8gEQAO4lNmyMMDglcDjK0hIQLiQAOjiTQiLiUtEeWnDKMui2MolsbCES3SglUCj0h%2BgoDrVp0m2IaCXojFZa0tqIoVtXN1DSmCE2ODgoKwIFDKEoSTTSAFNL5gIKRaQ2aEhODSMguMihQ5wEieJYrZ5aGQQZJfTbbaRpQ5nEptLSYR7SSCwCm5Rj0EIQMAI3AAoEghEoLa-OBbfk-eKDdATKY4ADCcDSGz2yMO33QEtBoUGFSqao13IcRhwIRQLgSCHhuA2CqVjBQOIAKoTpKkMghvjhQgibQL3rVUlYbiFktIsCZSlyQ%2BKBpqYwSZDgelIvrV488IPRpBwwO7OV7A4qKZgmsHnfcYBG3mxfeTcGno4NHWWIGxodIYIx0O6VsoHkky0t6ETI86G8opdIACLpTLC-7EgJHSrutqZOmesdStQIeRDvT3Hx%2BNRh-jFEBk9AEADaoAaIrtBAArABfGi3%2B-8ADMr-fewIABYfxAO8-3wIggJAh98DICCPwIJxYNA8C32AuDoMQqCEJQyD%2BEA7C0O-fDQJfIioMI39MIw-hkIo-gYNI-gSNogCqJYhin1Y9D2PwLDmLAzjyNQ0D6L4vC%2BKYoSyM43jJOo6TOJo2SCEEnCOO4sSlPQgBdaxcC7KAjSya9QB3Pd8EoIDTOouhDgyPTr0oGhHMcogaFc1znKctzvNcsgaD8vzPxoIKgoC-zgoioL-xoaLosfGh4vi2KYoS1LHy0yzdzoyhKFc88bUvfAb004gAE41AvByMu4kByusQVtmvIhKGqvjaoqhrCqvIgyFakqAHYOqFa8yBaziQCcIbGqKz90ufHSQC7eQOC4EBgRcRx8FALpdEIABiHLDuoV98sVVadqgPQDqO47n3mu6gA",
                    offsetX: 44,
                    offsetY: 4,
                },
                {
                    source: PuzzleImportSource.SudokuMaker,
                    load: "N4IgZg9gTgtghgFwGoFMoGcCWEB2IBcIAjAHQBMJADCADQgAOArgF7MA2KBoOcMnhAYURoA1pjYcotEHEYIAFtAIgAsnDZQIAc2kBjCDD44EygHLR4bAAQA2AB42r6RgBMIIxlaiMO6K3Hp6NgBPEgAdHABpcUkrABlMHBR0fCsAQTZcLSsUOF15KzZElBorF0wtTAQ-OCgUKy1NRnoUFytEpxRdBGwcdBIrAFE8gvQuntwrfWM4RL8UOzyEEKtcevRLa3LKhCm2RhL-HDaFeu2qvw6FRE7u3qt4YKscCF26lsRSuGOHxnRd5wwKwICDA%2BT1XT7eoAN3UBxI0gQwRaymcbg80iwzH4NjouhQEnQBAA2qBYVCCABWAC%2BNDJcP4RFp9Ip%2BAAzMyQOSDgQyJzufwACz8hkEGwi1niulc0X4YXSgW8iU8-A0hWypnq1kcrUq%2BUslV83X8NUG-g6s1i5WM60ETWW9m2-BSh36mWs03uw1Oo0Ol1eoVO%2B0BggWkOqp1hxUR412p3%2B6O%2B8PCgC6eNw-ygs2MRPwpJASJR%2BEonMLjLodUqGZJlBotdrRBojcb9brTfbjbINC7XbZND7fZ73f7I77gpo4-HlJo0%2Bnk4nM8XlJTpeR-DIlE3dCKSVzxPzdlDJGnIGCvOPnMPcuPdDP%2BAonqvgpvp7tF%2BlV7ZL7vlHfoCvD63gQv6Pm%2BJ53qQoH4JBQH3n%2BIBXjBr7svBAHfgQz5QV%2B4EYahuE4ShUGYbBD7UimaYgP8wQcFwBbyJgugiLuua-kQJ76JkUiEAAxC4m78TYNggLSIA8HwyjRBIaCFMURKrkWG6UI2IC6HAWjJCSDogAAnHoBJsHuRBsiusaEEJeL6XuZBkCZWl6YSJLabZ4YgGy9kGSSbHOdGOnuYZlDebKIAAOx%2BSSNlkXQVE0fgoAIAsJixSpECcco3H8fxwl4mp-CgBxSg8RlGXCSJYn8CAkmxJCBxySu1JAA",
                    offsetX: 48,
                    offsetY: 0,
                },
                {
                    source: PuzzleImportSource.FPuzzles,
                    load: emptyGrid,
                    offsetX: 52,
                    offsetY: 4,
                },
                {
                    source: PuzzleImportSource.FPuzzles,
                    load: emptyGrid,
                    offsetX: 56,
                    offsetY: 8,
                },
                {
                    source: PuzzleImportSource.FPuzzles,
                    load: emptyGrid,
                    offsetX: 52,
                    offsetY: 12,
                },
                {
                    source: PuzzleImportSource.FPuzzles,
                    load: emptyGrid,
                    offsetX: 56,
                    offsetY: 16,
                },
                {
                    source: PuzzleImportSource.FPuzzles,
                    load: emptyGrid,
                    offsetX: 52,
                    offsetY: 20,
                },
                {
                    source: PuzzleImportSource.FPuzzles,
                    load: emptyGrid,
                    offsetX: 56,
                    offsetY: 24,
                },
            ],
            caterpillar: true,
        } as PuzzleImportOptions),
    noIndex: true,
    slug: "caterdokupillar-poc",
};
