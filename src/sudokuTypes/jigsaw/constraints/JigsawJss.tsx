import {ConstraintProps} from "../../../types/sudoku/Constraint";
import {JigsawPTM} from "../types/JigsawPTM";
import {Jss, JssProps} from "../../jss/constraints/Jss";
import {JigsawJssCluesVisibility} from "../types/JigsawGameState";

export const JigsawJss = (props: ConstraintProps<JigsawPTM, JssProps>) => {
    switch (props.context.state.extension.jssCluesVisibility) {
        case JigsawJssCluesVisibility.None:
            return null;
        case JigsawJssCluesVisibility.ForActiveRegion:
            if (!props.region?.highlighted) {
                return null;
            }
            break;
    }

    return <Jss {...props}/>
};
