import {ComponentMeta, ComponentStory} from "@storybook/react";
import {App} from "../../app/App";
import {WithHashContext} from "../../../hooks/useHash";

// noinspection JSUnusedGlobalSymbols
export default {
    title: "Pages/Puzzles",
    component: App,
    parameters: {layout: "fullscreen"},
} as ComponentMeta<typeof App>;

const AppStory = WithHashContext(App);

const Template: ComponentStory<typeof AppStory> = (args) => <AppStory {...args} />;

// region Empty
export const EmptyRegular = Template.bind({});
EmptyRegular.args = {_hash: "empty-regular"};
export const EmptyChaosConstruction = Template.bind({});
EmptyChaosConstruction.args = {_hash: "empty-chaos-construction"};
export const EmptyChaosConstructionLoop = Template.bind({});
EmptyChaosConstructionLoop.args = {_hash: "empty-chaos-construction-loop"};
export const EmptyRotatable = Template.bind({});
EmptyRotatable.args = {_hash: "empty-rotatable"};
export const EmptyChess = Template.bind({});
EmptyChess.args = {_hash: "empty-chess"};
export const EmptyCube = Template.bind({});
EmptyCube.args = {_hash: "empty-cube"};
export const EmptyCubedoku = Template.bind({});
EmptyCubedoku.args = {_hash: "empty-cubedoku"};
export const EmptyMonumentValley = Template.bind({});
EmptyMonumentValley.args = {_hash: "empty-monument-valley"};
export const EmptyMonumentValleyMini = Template.bind({});
EmptyMonumentValleyMini.args = {_hash: "empty-monument-valley-mini"};
export const EmptyToroidal = Template.bind({});
EmptyToroidal.args = {_hash: "empty-toroidal"};
export const EmptyLatin = Template.bind({});
EmptyLatin.args = {_hash: "empty-latin"};
// endregion

export const Embark = Template.bind({});
Embark.args = {_hash: "embark"};

export const TheAngelIslington = Template.bind({});
TheAngelIslington.args = {_hash: "the-angel-islington"};

export const MonumentValley = Template.bind({});
MonumentValley.args = {_hash: "monument-valley-sudoku"};
export const MonumentValleyMini = Template.bind({});
MonumentValleyMini.args = {_hash: "monument-valley-mini"};

export const AbstractKillerDots = Template.bind({});
AbstractKillerDots.args = {_hash: "abstract-killer-dots"};
export const MoodyLines = Template.bind({});
MoodyLines.args = {_hash: "moody-lines"};
export const DollHouse = Template.bind({});
DollHouse.args = {_hash: "doll-house"};
export const LegoHouse = Template.bind({});
LegoHouse.args = {_hash: "lego-house"};

export const HeptapagonLikeLoop = Template.bind({});
HeptapagonLikeLoop.args = {_hash: "heptapagon-like-loop"};
export const HeptapagonLikeLoopMini = Template.bind({});
HeptapagonLikeLoopMini.args = {_hash: "heptapagon-like-loop-mini"};

export const SonataSemplice = Template.bind({});
SonataSemplice.args = {_hash: "rockratzero-sonata-semplice"};

export const HiddenSetup = Template.bind({});
HiddenSetup.args = {_hash: "hidden-setup"};

export const MultiColorMadness = Template.bind({});
MultiColorMadness.args = {_hash: "multi-color-madness"};


export const Miraculous = Template.bind({});
Miraculous.args = {_hash: "miraculous"};


export const MeteorShower = Template.bind({});
MeteorShower.args = {_hash: "meteor-shower"};
export const MeteorShowerNoColors = Template.bind({});
MeteorShowerNoColors.args = {_hash: "meteor-shower-no-colors"};

export const IntroToCubedoku = Template.bind({});
IntroToCubedoku.args = {_hash: "intro-to-cubedoku"};
export const CubeIt = Template.bind({});
CubeIt.args = {_hash: "chilly-cbit"};

export const ToroidalRenbanmometers = Template.bind({});
ToroidalRenbanmometers.args = {_hash: "toroidal-renbanmometers"};

export const ToroidalYinYang = Template.bind({});
ToroidalYinYang.args = {_hash: "toroidal-yin-yang"};

export const LumosMaxima = Template.bind({});
LumosMaxima.args = {_hash: "lumos-maxima"};

export const TheOnlyThingThatMatters = Template.bind({});
TheOnlyThingThatMatters.args = {_hash: "the-only-thing-that-matters"};
export const TheOnlyThingThatMattersNoGivens = Template.bind({});
TheOnlyThingThatMattersNoGivens.args = {_hash: "the-only-thing-that-matters-v3"};

export const HeartsCube = Template.bind({});
HeartsCube.args = {_hash: "rational-cube"};
export const HeartsCubeShowRatio = Template.bind({});
HeartsCubeShowRatio.args = {_hash: "rational-cube-show-ratio"};

export const NorthOrSouth = Template.bind({});
NorthOrSouth.args = {_hash: "north-or-south"};
export const NorthOrSouth2 = Template.bind({});
NorthOrSouth2.args = {_hash: "north-or-south2"};

export const RealChessPuzzle = Template.bind({});
RealChessPuzzle.args = {_hash: "real-chess-sudoku"};

export const RealChessPuzzleV2 = Template.bind({});
RealChessPuzzleV2.args = {_hash: "real-chess-sudoku-v2"};

export const Africa = Template.bind({});
Africa.args = {_hash: "africa"};

export const ReservedParking = Template.bind({});
ReservedParking.args = {_hash: "reserved-parking"};

export const WheelsOnTheBus = Template.bind({});
WheelsOnTheBus.args = {_hash: "wheels-on-the-bus"};
