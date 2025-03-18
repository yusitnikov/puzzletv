export const headerHeight = 50;
export const headerPadding = headerHeight / 4;

export const globalPaddingCoeff = 0.25;
export const rulesMarginCoeff = globalPaddingCoeff / 2;
export const rulesHeaderPaddingCoeff = 1 / 8;
export const h1HeightCoeff = 1 / 3;
export const h2HeightCoeff = 1 / 4;
export const textHeightCoeff = 1 / 5;
export const aboveRulesTextHeightCoeff = h2HeightCoeff * 0.9;

// See https://discord.com/channels/709370620642852885/712987136101449758/1114514316763332618

export const blackColor = "#000";
export const lightGreyColor = "#cfcfcf";
export const lighterGreyColor = "#e8e8e8";
export const veryDarkGreyColor = "#5f5f5f";
export const darkGreyColor = "#afafaf";
export const darkBlueColor = "#006ddb";
export const blueColor = "#86c4ff";
export const lighterBlueColor = "#c0dfff";
export const mutedBlueColor = "#aabeef";
export const lighterMutedBlueColor = "#e7e6ff";
export const greenColor = "#20ea20";
export const darkGreenColor = "#00b600";
export const purpleColor = "#ac68f1";
export const darkPurpleColor = "#7647a5";
export const pinkColor = "#ff6db6";
export const redColor = "#b60000";
export const lightRedColor = "#db0000";
export const yellowColor = "#ffff6d";
export const orangeColor = "#db6d00";
export const lightOrangeColor = "#ffb600";
export const peachColor = "#ffac80";

export const textColor = blackColor;
export const errorColor = lightRedColor;
export const recentInfoColor = yellowColor;
export const currentPlayerColor = greenColor;
export const otherPlayerColor = purpleColor;

export const userDigitColor = darkBlueColor;

export const regionHighlightColor = "#fe4";

export const getRegionBorderWidth = (cellSize: number) => Math.min(5 / cellSize, 0.05);
