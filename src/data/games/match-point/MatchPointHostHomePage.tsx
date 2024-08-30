import {observer} from "mobx-react-lite";
import {MatchPointGameControllerProps} from "./types";
import {LargeButton} from "./styled";
import {MatchPointExplanation} from "./MatchPointExplanation";

export const MatchPointHostHomePage = observer(function MatchPointHostHomePage({controller}: MatchPointGameControllerProps) {
    return <div>
        <MatchPointExplanation/>

        <LargeButton onClick={() => controller.createNew()} autoFocus={true} style={{marginTop: "2em"}}>
            Create new game
        </LargeButton>
    </div>;
});

