import { ConstraintProps } from "../../../types/puzzle/Constraint";
import { JigsawPTM } from "../types/JigsawPTM";
import { Jss, JssProps } from "../../jss/constraints/Jss";
import { JigsawJssCluesVisibility } from "../types/JigsawGameState";
import { observer } from "mobx-react-lite";
import { useComputedValue } from "../../../hooks/useComputed";
import { profiler } from "../../../utils/profiler";

export const JigsawJss = observer(function JigsawJssFc(props: ConstraintProps<JigsawPTM, JssProps>) {
    profiler.trace();

    const { context, region } = props;

    const jssCluesVisibility = useComputedValue(() => context.stateExtension.jssCluesVisibility, {
        name: "JigsawJss:jssCluesVisibility",
    });

    switch (jssCluesVisibility) {
        case JigsawJssCluesVisibility.None:
            return null;
        case JigsawJssCluesVisibility.ForActiveRegion:
            if (!region?.highlighted) {
                return null;
            }
            break;
    }

    return <Jss {...props} />;
});
