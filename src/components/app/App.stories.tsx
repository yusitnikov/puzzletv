import {ComponentMeta, ComponentStory} from "@storybook/react";
import {App} from "./App";
import {WithHashContext} from "../../hooks/useHash";
import {Deferred} from "../../utils/deferred";

// noinspection JSUnusedGlobalSymbols
export default {
    title: "Pages/Basic",
    component: App,
    parameters: {layout: "fullscreen"},
} as ComponentMeta<typeof App>;

const AppStory = WithHashContext(App);

const Template: ComponentStory<typeof AppStory> = (args) => <AppStory {...args} />;

export const Home = Template.bind({});
Home.args = {};
export const HomeSlug2 = Template.bind({});
HomeSlug2.args = {_hash: "home"};

let loaded: Deferred;
export const Puzzles = Template.bind({});
Puzzles.args = {
    _hash: "puzzles",
    onPageLoaded() {
        loaded.resolve();
    },
};
Puzzles.play = async () => {
    loaded = new Deferred();
    await loaded.promise;
};
export const PuzzlesSlug2 = Template.bind({});
PuzzlesSlug2.args = {...Puzzles.args, _hash: "list"};
PuzzlesSlug2.play = Puzzles.play;

export const Games = Template.bind({});
Games.args = {_hash: "games"};

export const Contacts = Template.bind({});
Contacts.args = {_hash: "contacts"};

export const ForSetters = Template.bind({});
ForSetters.args = {_hash: "for-setters"};

export const HowToImport = Template.bind({});
HowToImport.args = {_hash: "how-to-import-puzzle"};

export const NotFound = Template.bind({});
NotFound.args = {_hash: "nx"};
