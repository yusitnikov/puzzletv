/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../utils/profiler";
import { GridPreview } from "../../puzzle/grid/GridPreview";
import { ArrowRight } from "@emotion-icons/fluentui-system-filled";
import { loadPuzzle, PuzzleDefinition, PuzzleDefinitionLoader } from "../../../types/puzzle/PuzzleDefinition";
import { useMemo } from "react";
import { headerPadding } from "../globals";

const mappingIllustrationPreviewSize = 300;
const mappingIllustrationArrowSize = 50;
const mappingIllustrationArrowClassName = "MappingIllustration-arrow";
const mappingIllustrationBreakpoint = mappingIllustrationPreviewSize * 2 + mappingIllustrationArrowSize + 100;

export interface MappingIllustrationProps {
    puzzle: (plain: boolean) => Omit<PuzzleDefinition<any>, "slug"> | PuzzleDefinitionLoader<any>;
}

export const MappingIllustration = observer(function MappingIllustration({ puzzle }: MappingIllustrationProps) {
    profiler.trace();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const puzzle1 = useMemo(() => loadPuzzle({ ...puzzle(true), slug: "" }, undefined, true), []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const puzzle2 = useMemo(() => loadPuzzle({ ...puzzle(false), slug: "" }, undefined, true), []);

    return (
        <MappingIllustrationContainer>
            <GridPreview puzzle={puzzle1} width={mappingIllustrationPreviewSize} />
            <ArrowRight className={mappingIllustrationArrowClassName} size={mappingIllustrationArrowSize} />
            <GridPreview puzzle={puzzle2} width={mappingIllustrationPreviewSize} />
        </MappingIllustrationContainer>
    );
});

const MappingIllustrationContainer = styled("div")({
    display: "flex",
    gap: headerPadding,
    alignItems: "center",
    flexDirection: "row",
    [`@media (max-width: ${mappingIllustrationBreakpoint}px)`]: {
        flexDirection: "column",
        width: mappingIllustrationPreviewSize,
        ["." + mappingIllustrationArrowClassName]: {
            transform: "rotate(90deg)",
        },
    },
});
