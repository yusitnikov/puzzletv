import {ComponentMeta, ComponentStory} from "@storybook/react";
import {App} from "../../components/app/App";
import {WithHashContext} from "../../hooks/useHash";

// noinspection JSUnusedGlobalSymbols
export default {
    title: "Pages/Puzzles/Imported",
    component: App,
    parameters: {layout: "fullscreen"},
} as ComponentMeta<typeof App>;

const AppStory = WithHashContext(App);

const Template: ComponentStory<typeof AppStory> = (args) => <AppStory {...args} />;

export const FourDimensionalMinesweeper = Template.bind({});
FourDimensionalMinesweeper.args = {
    _hash: "f-puzzles:tesseract:load=N4IgzglgXgpiBcBOANCALhNAbO8QBYARAAgAUAnCAWxjAHcYYAHGckVAQwFc0ALAezZ40tMKw5YIYdiHJccYtAhAA5QVQnEwXACb8A1l2JyFxDkyZYAnvGKWOAYxjE%2BzgHZcqAI1ZhiARgBaRGJ%2BNydiCDdiGEdeY346ZGIHfixPN2SONx1iAGYADzziL34CgDoAHTdqgGEwyB1WF15nbT1DYgBzSlyOPw58ouHikTAxckc0cuIAQWIdCC7MYkrwRjA1szd%2BV3JiOkx48loWBzQXfhbnMYmpyIAzSIuo66HCj%2BI3GCXeUvIBPxck43CITn0LnwOBcnFgsDMAJLRXatfZ0QQ6MDJCBPFYObLEKj8ABuNyuUIui2WL2iYH4NBS9K8UWhEDCoSerjECwgJ3ObLcYHg1QAVMQAPLfFIwOHEHAPC6CYy%2FGnPPyJaKlCqiiVS2FYYhcJihfZ6OjRV6YdXmkplKpuMUAFVajPIJzATDCizcXWlsst0VctoKoSlYBExvliv2lC6vGmOudzlSbtOXqivv1kUDLq1obaEcNxqVZrc9uqhCWVuzZhSHC6zj0X12xmYsQu2Vy2iolzeHm8zX4TyYlBofgAFAAmZJ5ZIAVmSAHYAJRaRiaqxvBy8hw4YEyg2vIP4hvY8Lpb2%2Bq0yh7ltwAUQKHCollowpqDuISbrDcZoI4UQZsY%2FgOP4WgCHQfhBv2Pj7EOdijrQa4wBaOZkpGMAKsQACOXAcLk8Fakh%2FjJNOxD4FkOTEHO9pOi6J7JmEaAAW4QHkJODjFGAEFQS6MGDsOiF%2BGIKElJuQaxvGLjogkkEcsGxGkckFHbLkNGJvR9aMf%2BgE%2BsYeQOAAbOBiS8e4niwfJI7UEhIkbm8pRoGg9LKnGFy4fhNZEX4JHEGRs7kfOlG5IZ9oyD0EA6AgADa0WgMspJuKQKHblgACyHDkPo0jwB4cIAL7IPFECJcl4QQOlmXZQgeVYIVxWlSlFUZVlOW1fVIAJShZWpS11W5fIdVFZ1JXdU1lWtTVg0dV1SXjX1bXTcNs09c1VWLQVy2jXN5UTf17VbY1u0LVNBUALrIHFI1Hb162nUNDVjcdd0DZtj07bdk2vQ911PZ9%2B1Le9q17RtP0rfNL0HUDENfVDv0fWtsOA%2FDwMnd9%2BUXVd4PPUjb0ozDAN49j%2F2gzN22o5DyPE4jhNg%2BTBOk4df004z0M47TZM3Sz90Y5dbMkzzTMIyDgv89z6NCxTuN01zIsS2Lctw9TitU%2FT7Os%2Fj6s85jCto0rasC%2FLmuG%2Frst66rZuU0TBvi6bzMq9blvS5z9vm%2BdfPG7bFuu1bMs%2B87ksM6LnsO37wtu2HUsc4HWtG8rEe81jNuhy74e%2B6nUca%2FH6cxyb3tpwHus50XhchwnOtl8Xlel9nNfJwnude47%2FvRyXrfV%2B3tccxXXdZ%2FXVe98Hg9x%2F3ddO53o8T%2BPffT9rF0gPoFU4OQDExaA%2Bo5dFIAAEr4LUc4yLvtSGYfc61Pgp%2F75fJ%2BoNvhnn4f98H7f98n2dHUbzFO%2F33kh%2BLrUv9b4AA5aiTkPiAwBO9EAAJAO%2FYan94Bb23v4GBt8UEXzQVfW%2Bk4H7YKvnA9eB5N47zyKgnee9IFHwvgQkACCkEoP8IfFBYC8GMNvqQxhNC6E7xwSwnhMCuFEK%2FtvUhz8SHH0PqQxckjahANgR%2FIRiCd7%2FxvjvEBb8FFwmIdvf%2B0jb7%2Fzke%2Fee24V44DXrQxRSCQFgPnl4foMBajKAAMQADE3HuJkPwHgkhviOLwE4gADEE4JMgHhMT8SAQJwSgkyEODoPgCAAnlEXAuEArQVSJOSXOTRWBtEMNgagOxYgImuPcW4zx3iogOOcdEmJqAwmghKbUgJsTIoJPgEklJqB0luUySknJeT8GFPsSUsp5TUBeOwFUpptTQnhJqbM1AcT2mdNST0%2BMfTsnwMsfw3%2BtiRnOLGS4ipUzfELOiXMxp5yQlLLabwTZ3Sfi9I6VkgZwjSFv2GcUw5YyTk%2BOqf45ply0AzIubc%2BJ9yXldLSU8jZUKtmEK0cIlRBSQBFIBZEo5fzpnXLqSABpILcUtPBSsrJjyMnwreUonRtRpH7O%2Bf4rFEzKlnMBYs%2FF8y2VgpAMsyFqzyXPNWVSpBZ8D70oxaUsp2LWWRKBfUzlsr2W8oeTCilQrtlIupXvahXyJVMpAJM%2F5oKbkcquVyk1yr4UCrhUK%2BeiwwAcC8HuLA%2FBlgOC%2FqkUEkxFj8gaKitAcgYD4hyJFaEtB%2BBMAwH6xB78gA",
};

export const RomanVariants = Template.bind({});
RomanVariants.args = {
    _hash: "f-puzzles:type=latin:product-arrow:load=N4IgzglgXgpiBcBOANCALhNAbO8QCUB7AWwEMA7AAgDVSAnCCtMEVUgVzQAtC6EQA6vQiEAMgHEACqxB12OMDDT8AYhCxZK3GJQDmDACaUA7pi5auOuiQqVy7YgCMYdMJQCSyD5+8/qXgA0vUS8AYS8AES8AWUoAWkowQgtSNEoIKhgANxcAT0prYy8AY0IsB3IvCiMAZgAPGspHQjqvGFJi83snF0pSAAd+9tdKGDqO7HzCcmKYADoAHXIlgEEsad0+ygAVSzpiQi9u5xHidjA0jOK6dsV0qizScp0AM2tiCx1HeUc5ygAKea6P7udzxAB8lACEMooRh0QAlItluRQjANG5FEM6KkYEZHPlSE0sB0ANaUAyENJnC5NHQZLYARng+AKqREXmMex0rIgbm0dgcJ0SPGMVAZAspaD+gLmwNhfXIRlipXkRgGQ3olGmW0cJOK5IA5IyAAyGilUpE7bl9G52ZLkGC6dk5SilcgXHEZZjI1aUfrqLBeG6kIxvEiUHAvNJoZIMXRcNBeGlpF68D5E6grUTuCIFGxUY4uGVAv6GuEJMGV9zmtP7NxEx5YCBGd62It0ExmT6UJvsHSEF6UU01ADcJi46h0hqrlFE5t4lENsUr8V85voOnIVN7TxbSKWSwAckKXA31uRNrZ6IVKCnKNEAKqibbuSSiACaWmSAo79x7N6EMYhqYjAeIAsUEB0MUODap2AYaFasrynmAC8CoAFQ0JQWGMgiMj6C2CAANrEcAAC+yAUVRlHUXRtEMTRAC6yBkYx9E0ZxHEUSxbFcexAn8bx3GCSJzGsWJkkCcJomyUJElyVJ4l8UpUkyfxGlqSx6B7AcxBKC4JGgM2josPApEEIyoQACwyPgABMNkgExTG0SAJkwGZFn4IgoSMnZAAcfnOa5VHuRknkkcRBAAOyhAFdkAGyhDFIVuR5XnRfgyWJXZACsKVpdpOIYIQRkgLMGIkQQvn+agPmhPZzmoH2uAgE1bmVVgXkEMlTX1cl/naa1/AdWFXU9fgBX9QQBVDS1Tz9qNICdei3XVfg1nBfVW1NcNi1tWNoATRtW01PloTnftzzLatVXmTVTn1b5eXNSAI14EdFVrZNyWvQNoS5ddS14K9d3rQ9U2hP9s2A29H0gKaK3aYBxjlRlUWPTN+BBdjQXnfVcUEwQQW2S5qAnZDtV2b5e3pRFXnaZTWW+bZz3QzTcOhcZDOY9loSIHZcWC+T333VlyUJQDIv06ZJFMz9G0FVLsMy2FGPmVlW2C/VNQC3Zjkiwr4sENrzmy5Fmuw7lO2Fbr8UhRTiuQwVMNQ0DFuZb1l0XcTm1PQQetu45NuWYVovM972PJVdnt83rfuOdjVlDcbENZQn5vq7zVv4HrbMEI5ft69jZ2O2L6eB05rnaWgYzKOZx3O1lBWh1Dr3A21SOoGm5BoKE/AAMQqCPo8yJAsAICacw1ORrlAA=",
};

export const SafeCracker = Template.bind({});
SafeCracker.args = {
    _hash: "f-puzzles:type=safe-cracker:safeCrackerCodeLength=6:load=N4IgzglgXgpiBcBOANCALhNAbO8QGUBDAMxgAIBhAJ0IGMBrGKkVQgVzQAsB7ZvAWRLEWIKmxxgYaBCAAq3NISxYAnmQB2vALZKyYEuVo0GTMmIllCAByuqAdAB11ASUtgwbLeRXc2ZepoA7mRcMFpkAEZqnDCEVGh2IgDmVBAAJggA2pmgtDIAxACCABwlJSK0hVQ0KlkgRaWNIAC6AL7IuQVlTaiV1YS18Jn13eVtHSB5eA3dFVU1dTNN453To8Vz/YPDS2PtqyON5b3zA4vrLfuTXUcbJ1vnt5cTU4ez9wtDb8tXr7t3k1O22+exeN3egIeX3+l2ayByVwAbko2LgAKyoJIQREwdQINBiGD7JEo3DFTHY3H4wkkrCohAAdgpOLx8AJqNp9PgAGZmVS2TSOpzcAAWPms9lEoVwnLXNZPD5naEXFZykEAvqfHYq37gnqQrXq54HGGK4Ew1V/C5mx6zS1644GpXap72+UQzXOo1uo025Wu3Xu/We806mWgZF03AANnF1I5Qomka5KBAWJZ8alwGJiezSdJCHJacpEsFEYL8AAjHGBRzw2rTU7QwGwUHHSHbT9W76m53QSbrb3/XbAz2O8OuwOFUOXSPu43x7PJw3B4vvaOF0C+xs2vXk7gAEw1yXChAY4sZ2tZkD7hDVi/8k+5m8VsUP0sJ8tRhCp9OPssvt+8Cxu+mY5l+XK8qBV6tPWVrTmuFobquW4Tv2K4IahS7ofBHpYeu84oVC2E7shmHEQRU54RRSGEeRhq0VRwb4Uh4bgYBXJvn+H5ZuB7G3vARbcWB0rwnm4l8bm/EVvewkwc0cLoDAAAe0hDLkMDKGAdQAErFBQIotKgAkECIxDcOoaAUAUAAMdn2SIkCwHevyaVg2lfDplYUAeRkcbgIAAHxmRZVm2fZdmOdAuCVq5Wm6d53J+SZAA8IWWdZ0wRZFqBOTFcXuQlFAMslFYgGlqDmRl4URVFzlVgVHnDF5FCIKVQFBelYVZdldX5S8blNSAOnchQlbtVynWVaFmX1NlNl9S5A3xZ5o1JYpqVdbN+TzYtDXLYVq0UGiE0BRVIBVd1c29bl0VLRpK3NaNJUbWVwXTdVPW1bd9WxQdQ06WiY2nTI70XTNNUOT9/UPYdzVA4Zr0dedl3bbt0P3ZMg26UDL3GW9W2Qzl4B3ftsMAwyFDrfjyOE19UMk79jW6ZTJ1I5NYOo0TC0Y2TWOPcNlPRiDeAoxD9PE3lmO0NjnmU3j/kyGLn3Xd9jP5W0QA===",
};

export const InfinityLoop = Template.bind({});
InfinityLoop.args = {
    _hash: "f-puzzles:type=infinite-rings:noSpecialRules:load=N4IgzglgXgpiBcBGADAGhAFwhgNneIAkgHYBmEx2AngAQAyA9gwA4joCGArhgBYMBOCEACUuAW2Y52xGIPT9OeMDAxCAtDRLlKGWoxYA6GgAUpAYxg1elgCYQA5tjA1EagGw0A7tj7ca/GGYYdgwwAwAdYg0AZQxpG3Z+GxoAaX4WAGsIE3YIfmcNYgYaGXsQiAA3SzMGYjAMflziDAM2EHt+CBsEAG0e4ABfVFAzIQBiAEEADmnptrMJ/kaqXpBJmY2QAF0hkfHZzfQFpfYV+B61g7md4ZBRgnWD+cXl1cfNm9AAx1qEACZdiBvhBfvAAMyA+6XDZzI4vU5vK5TbaQ/Yw5Fwk5nC7va6oh5I55YxHolHDAZbVD9O5op6Y17naFPT5AmA/YgIRCA4GgxBHWmHO7w7FMj7ctkgjlIfkE0n0hGM3HIlk8qUQ26q/7i9kINA02V0oXExWElUS0F6qFKokMnGm7WS3X40Wwo22l3KilUr7mqWWgWu47u61mnXS/Uem0Ku2k0OO+DIB0WmWR+UikO7TMa32clPWtMk5lJqVc7Nh/0GwVB6ORuO8vOEgsm2Ne6mahMNuVumsZsvxvkR/Pd9P2vvJweN4eFsVjkvFhDqn1hgGzp2r8NWyfVkct9cV1NT5tF9cDzdd7fTvGUts5+Arpfxxes5fz8Gvv555Bf79R9Pfn91mqn7/sgv5vCBoGAVq65Pu297Po+rYPqCsG3vB7aoS+MHAf+YGKhBZLIVKH6DgRTY4gRUFvuu6G3ph8YAteRG5hO57Cpenp7p2hoXkeM7MRuAYYoeMbHgJiY0a+9G8q++5Drxon8Qh9asTx7F8XiXGqVW6mKVe3rKSW3E6caemceJxmBrptavqWAmnkJeFmYRhkLu+smWcJCk2XutmeU5PkWdpVmmTZTGuYJlYhcGo7iR5wVedZvZBWeamhclEW0WG0lGQlAUZe2DlRYl6WxRFdkRXJW5Jfa4WFX5eXkYF5X+U1BW3kVB7ee12XuVpqUmTFu4pY5bVle2VVsaVw2VRSlIgHYpCkLIMDEBYvQjDAOA4GAqzCG4ADCiBtMIACsR0uRY227YywgoAdAAsJ33adl1bTte33W4z3IAdr0sldH23V9P0HQA7G9117edKAnQ9R2QZC703RcZ0HWCJ2HRjAPI3tYPo5jBM41Dt3ncJ+0HeZdy47d8Pk2TkNA6j8Ovegwjw99OzzY0WAMBt1Mk6jiB/c9j2MyjIgw3DF3E0zksHX80uK7LEvs2LbMsyiOxAA=",
};
export const InfinityLoopWithDigits = Template.bind({});
InfinityLoopWithDigits.args = {
    _hash: "f-puzzles:type=infinite-rings:noSpecialRules:load=N4IgzglgXgpiBcBGADAGhAFwhgNneIAkgHYBmEx2AniOgIYCuGAFgPYBOCIASowLYAHHHWIxO6dgzxgYGLgDkOfOjgAEFcpQwxVYBgBNWAawarJ01XQFCqAOgA6xQpbB6+OlnQyqqrU0eJWAHdVFhg+VQAjKlVmGDp2DFtaEABzdgh9BABtbNAANxUGfER0VIh8mGIEDEkYAF9UUABjLgBiZE6ulOaAQXZ2Ohp4bJAOrs6QAF1GlvaJyfQ+gaGcsYXkadmQVoJxiZ7+weHR/e6ZppBCnGKEAGYyiqqauu32GHLWavg0K6L8AAsj0q31qxTeHwgXwQv126wWhxWJ3hBwuoHen2+sPmCKWR1WIxR5whmJhSxxBzxSLWZ0maJAGKhWPQ11u8AATMDnvAwQ0pqg8jsKd0qccaRstpdWfhOWknqDXpc4bTNqKCacJfTlRK1ciVZKCv8EABWLkK8GXRnQn4so3wABsZpeFvRkOt2L2Op2+L1mpJTLJQs9uO91MJ+vpVuZfxuJSdPMVrtJNqDRMWobF4b9/MFUcD2pDy0zGoRkbd0YLlIz6rTmzLyd+0oQpTlIOdDUt5fzwvTRZrEf97ttsfu8d5g+jTfgQNb3PHnYb5ODVb7vtLE8DU9l5TbCZdDK7KcrIura9RG6PPdVp/F65zSYDl+XJ9Xt/PC8fHtriOL3/rn6Xb9dTfYkPyHGM2W3eV2wvRs7VNWdzQ7B9wKnR1EJgsDJztFsdznRMD0XVN9WArN1yw7tn17H0QLpWDAJIm8yPPe9CIAiDATHAi8xTNCuP3Hi4JHad+OQtjULtdC8KQ+jiK9V9mNAlCKyvH9+z9CjePg0TZKnB4ML3MTBOHNkEOkzDlM3O19PMwz6lY4yONHAz50srThLM6C7M0oS2RsrzXPE7CPJ0nyGPkmjFLosK5MLSKS3fNzfPwKSAu4w9koQGdbMCxy+Jc9KiKnbK0vBByMvCuKwwSpSgsooCmJq6Kksqld4r/XScNClqnIdbq6vc0z+ryu0oN3XKKtitrqo6mLj2omaBzm1TSKaut7IFHr5uvBS1oNAav0Y3bZp6rdhsm7a1LPWqRuEkrxsK9i9POojLtWk6DpMuMCoEi6Vsaj7HLegGB3K17/uOpbTq6n6jL+qidvaqHPqml8kY06HhNSh7fqK7TYdk4HIYxlGifR8jMcgl72LJxbs02lGzoJ5aEau2j1pZhriYp0mIfJxLGbte78Nxp7rOp8Dad/ZGgb5umedl1n3plyap1w0q+RmIA===",
};

export const JigsawNoShuffle = Template.bind({});
JigsawNoShuffle.args = {
    _hash: "f-puzzles:type=jigsaw:digitType=calculator:angleStep=90:load=N4IgzglgXgpiBcBOANCA5gJwgEwQbT1ADcBDAGwFc54BGVNCImAOwQBcMqBfZYHv3vyGCRfALrJC/EKUrUATPUYt2nGMIGaNQiVNEzyVBAGYlTVvA7dR2m7q37ZR+ABYzKy2tsPxknxoM5BABWdwsrdRs7P28Ap2oANjDVa397WKjiQ2oAdmTPVJ0YzIysoPgADnyIor1/EsdshBR0ZXCvMTEuIA",
};
export const JigsawShuffled = Template.bind({});
JigsawShuffled.args = {
    _hash: "f-puzzles:type=jigsaw:angleStep=90:shuffle:load=N4IgzglgXgpiBcBOANCA5gJwgEwQbT1ADcBDAGwFc54BGVNCImAOwQBcMrUBjBEAYgBiggIIAGcSB4iMGEgE98A4eMkBdAL7JQveMtESxUkNxlzF8PPtVHN2k3yEHJ02QqVObIOzscrDxqZuFlaeAT4OemEuJmbultbhWr5R/jFB5h5ptsmRielxIfk59rrFgYVZziUp5a6ZCdE5asiEuaSU1ABM9Iws7JwwycPaI8BjGi1to/YdVAgAzL1MrPAcVBMz41uTrbX8AEJiwkcVwR5HJzV5h8eCp/XxoZf312W3V2cNz3enEXPUAAsy36a0GPEcLwesXOjShb0hvyMjyKH1e3ly73hXyeAmxESxSJxqPxmMRnxRFyJBPJ6MpcOpu2m2xZ7XI83gAFYQat1kMdjspqyBSyQACEAA2HkDDYipn7AAcYiVgmRMO+AiVKoRUS1xzVGVx/D1qoxpUcJoNlUalrNiuV+uJHltNN1DtN9NCLrJbu1Tpt7uu4vgAHZpWCuDdbZ7NYG7VG4zHjXHXbG/UnvULNsKc2L2dQFeG+cMs3Ky6Lgyh0H1eYNJpogA",
};
export const JigsawWithRegionZero = Template.bind({});
JigsawWithRegionZero.args = {
    _hash: "f-puzzles:type=jigsaw:angleStep=90:stickyDigits:load=N4IgzglgXgpiBcBOANCA5gJwgEwQbT2AF9ljSSzQMY0IB7AOwQFoBGCka2xl90zmvSbw2HLkN5jBPEewC6yQhWXlVlFVWnDRCpWo0G1A7tvmL1+yxc0nJumxNmHrz4453m3M0VecH7XqZ+vvoB4t58LiHqYVqS/OFBCXFOybapDhHBxHJyREA===",
};
export const JigsawWithStickyRegion = Template.bind({});
JigsawWithStickyRegion.args = {
    _hash: "f-puzzles:type=jigsaw:digitsCount=9:stickyRegion[top]=0:stickyRegion[left]=0:stickyRegion[width]=9:stickyRegion[height]=9:splitUnconnectedRegions:load=N4IgzglgXgpiBcBOANCA5gJwgEwQbT1ADcBDAGwFc54BGVNCImAOwQBcMqBfZYHv3iAwwGAe1bwADPyEiI4hNMHCxEpaBXy1MzQqk65e6QF1khGaUrUATPUYt2nGPwOrFrre+WHt3t/r9PAI0fd1NzXgtyKgQAZjsmCQ5uQKMPNNTfEP91WRz07XDsoNzdLLySgsVUSxj4ABYEh3hk50yvYozO8rKOirSi/p7Q4KG+3tGJyRro6gBWJqSnKsmR0rWVkzNu8Y321fz99ZyZqwQANkXHFJ2DyqOuQanNl4e32+OS07qAdiuW5bvMb6J57D6vcFA55QtbfagADn+rReoMOkPRwM+XUxEJxRzhCBQ6HsS24xmMXCAA==:extraGrids[0][load]=N4IgzglgXgpiBcBOANCA5gJwgEwQbT2AF9lQMY0IB7AOwQFoBGEsi6u+Jlkcy2h5qR5t+8AAzde7AZJEcuQqaIWs+HCQF1khWWpmld0zoNVGJiuftOjz1+SeF7xRLYUdGV75ScPff9/ysvdUDjUK5XOwRbYKClAIsnT3jo8IcUsMSPdMtnSNjnLL8ikJK43JiM5Iq00M1tKMzG6qdK3Jbs2rLC5pyk5nyMtv6u3rrRgo7ixvq3IYn57qnSse7hzrWXBsm+jZnQ3dFDjmPUpdOwjQ0iIA:extraGrids[0][offsetX]=10:extraGrids[0][offsetY]=0",
};

export const SimpleJss = Template.bind({});
SimpleJss.args = {
    _hash: "f-puzzles:type=regular:digitsCount=9:jss:load=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",
};

export const JigsawJss = Template.bind({});
JigsawJss.args = {
    _hash: "f-puzzles:type=jigsaw:digitsCount=9:jss:angleStep=90:stickyDigits:load=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=",
};

export const MultiGrid = Template.bind({});
MultiGrid.args = {
    _hash: "f-puzzles:type=regular:digitsCount=9:load=N4IgzglgXgpiBcBOANCALhNAbO8QHEAnCAEwAIBGEVAQwFc0ALAe0IRAGFGaBbGHZgDtqIQnRxgYadgDlWPGljJg6JZgGs6ZMRLI0ADvqwBPAHQiA5sRIIA2rdAA3RXVwVUFiI5jD4aMTAAvsjAwaEhYZER0aEAusgOYSDOWK4IAEweXj4I/q5R4YUFkfGJMckuuADMWd6+eUExxU2lRU3tbXEJnc09Ea29gy3dIADG7ADEAGJTAIIADAsio7OEhDTGdiDTc4vzILFDnRWpuADstTl+AcUDIWOTAGzzACLzz8ur65vwttvPbw+hw6vROaXgAA5LvUbv1ugUHngJhD5iipvtUCs1hstsjUfN0QcjgiUuCUCBPHVcjdYvEQDQ1swAO52UBYCCCGBgOx/ABKFA4ZxE/I4EOF6Q4iGFVUlBzpo34WG5vxAIqFh0OQA==:extraGrids[0][load]=N4IgzglgXgpiBcBOANCA5gJwgEwQbT2AF9ljSSzKLrSQA3AQwBsBXOeAFlTQjpgDsEAFwxsiAXWSEaVcnMr1mbBAFZuvAcNExqk6fJkzFrdgDZ1fQfBFiDe2Q8N2pj2gGMEIAMQAxHwEEABiCQVDd/DAwGAE98bz8gkPEKEA94eIDgwNDUiKjY+DwMxOzk909fTJCwvJi4ypKQMsd7J1A0jIBRQNNsmsi6wq6e0pSOyu7enPCBgqKJkaaxir9JvtzZ+tXF5sNWgwPXYn2jtt0XM8O9yRAooQgAe3x2mCYmMDiAJRUAYQBGHLfH4AJiW7le7y+vwAzIDfqDkskgA=:extraGrids[0][offsetX]=10:extraGrids[0][offsetY]=0:extraGrids[1][load]=N4IgzglgXgpiBcA2ANCA5gJwgEwQbT2AF9ljSSzKiBdZQih80kDGNCAewDsEBmB2vSaUWbTj3gBGRsUFVhMmnXkqByxQvLVaIAC4ALGBgC2HYzF1H8oADYQuMMPjwgASrwDCkkKlcAWLx83AFYPACYg10QPXkjovxBtJRAARwBXAENsDDSABxs4eEIQAGMYGxsnIrdPYMjPREiAut8Axp0ANwybNMd8SWQw5F5kP2oaIiA==:extraGrids[1][offsetX]=3:extraGrids[1][offsetY]=10",
};

export const RushHour = Template.bind({});
RushHour.args = {
    _hash: "f-puzzles:type=rush-hour:splitUnconnectedRegions:load=N4IgzglgXgpiBcA2ANCALhNAbO8QCUBXMACwAISB7QgJzLEIBNKBrQkVAQ0LSpoRABhEpwC2MHJQB2HEDUI4wMNAIBylGqM5Z6TVoTLzFZTgAdTWAJ7wyFzgGMYZRhADmmMGQCMAWkRkIKTRKMhgANxgaS0NKAHdkMntKLEJRKRMpRjIAZgAPACYyACNKXITpR1CHEgA6AB0pABUSSKdOGid7ds9pMl4nVxoIRgTOTL6W6K6aKLJ3CPSXdzQwGrJmzu7E6iwsoqdRSgisgDMNWPassb2HFguaLMCJmAg6Fw77DGkEop5nqbGUkoaGcQwiExo1Fc5DGwJadGmZA0EKh5H6cyGew0jEiZAAFP0AVIgSCYGAuqYnCdIaJnhjhgBKNYbOYQBbONweJHpdHTTyMMFOYKuZTwsixTBolqJdr1KTqNAwGzEIXSw7g35oYLpM50dWBVx0vnc5xkljBUxIt40TiG3ntcWSsiFE4GyI9dKHIoQHA1WSDYYIADaQeAAF9kKAwtpCLgvKh5jAZPA0PIYKh7AIAMQAEQADPmAGKF2T2ACCM04lmDIFzBbzxZAAF0I1GY3GE2ykwhU7GM9ni2W80PSxWbdX4EHa4Ph3nm62F5Gw03kKHWyBM3g60WSxmx1Wa9uGyWW5GNwPC0OR3vKxOp1mZyPT+Gz9GUrgACydhY9tP9rfFgAonmiBzje46HkBIFzs+54AYWwGgaOt6QQh0HziuoYgG+sYIPGICJsmvbpnBtYAELHhRyEQZO5GUTB644bg+Tft2KZ/qRWYUcWVHgQetFcfR86vu2CAsQRXZERxm7Tpes7Ufx96PgxS5njJD6FgAHMeCl3rJ2mNrBTF4axUl9px+Y7rph6WTpLaYW274IF+Ek/ux5nqcWPFgRu+56Rp3nCY5uFIKZv4eRegV8f5XmFlRRmifA2Rhe5JGeV5vG+ShAmxfFi7BbgyWuWxxH/vpOnRahBknoxiUAKwpaVFn1o2lUCbZhnLquBUICgxVmWl2Zlppw3DdZAmjSNmlBfls0OdhiUuYR4WDVuk1jW197rdNz6zSJTnwPhy2pZtdGBQlB1FcdTXltl97cXFDFNi2QA",
};
