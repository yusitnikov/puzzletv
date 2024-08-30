import {observer} from "mobx-react-lite";
import {MatchPointGameControllerProps} from "./types";
import {LargeButton} from "./styled";

export const MatchPointHostHomePage = observer(function MatchPointHostHomePage({controller}: MatchPointGameControllerProps) {
    return <div>
        <LargeButton onClick={() => controller.createNew()} autoFocus={true}>
            Create new game
        </LargeButton>
    </div>;
});
