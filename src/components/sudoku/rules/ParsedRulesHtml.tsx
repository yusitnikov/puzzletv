import {FC, Fragment} from "react";
import parseHtml, {domToReact, Element, HTMLReactParserOptions} from "html-react-parser";
import {RulesParagraph} from "./RulesParagraph";
import {observer} from "mobx-react-lite";
import {profiler} from "../../../utils/profiler";

export const allowedRulesHtmlTags = [
    "div", "p", "br",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "ul", "ol", "li",
    "b", "strong", "i", "em", "u", "abbr",
    "pre", "code", "cite",
    "table", "thead", "tbody", "tr", "th", "td",
    "dl", "dt", "dd",
    "summary", "details",
    "a",
    "img",
];

interface ParsedRulesHtmlProps {
    children?: string;
}

export const ParsedRulesHtml = observer(function ParsedRulesHtml({children: ruleset}: ParsedRulesHtmlProps) {
    profiler.trace();

    if (!ruleset) {
        return null;
    }

    const options: HTMLReactParserOptions = {
        replace(node) {
            const {tagName, attribs = {}, children = []} = node as Element;
            if (!tagName) {
                return;
            }

            let Component: string | FC = tagName.toLowerCase();
            if (!allowedRulesHtmlTags.includes(Component)) {
                Component = Fragment;
            } else if (Component === "p") {
                Component = RulesParagraph;
            } else if (Component === "details") {
                Component = ({children}) => <RulesParagraph>
                    <details open={true}>{children}</details>
                </RulesParagraph>;
            } else if (Component === "a") {
                const {href} = attribs;
                return <a href={href} target={"_blank"}>{domToReact(children, options)}</a>;
            } else if (Component === "img") {
                const {src, width, height, title, alt} = attribs;
                return <img src={src} width={width} height={height} title={title} alt={alt}/>;
            } else if (!Object.keys(attribs).length) {
                return;
            }

            return <Component>{domToReact(children, options)}</Component>;
        },
    };

    return <>{parseHtml(ruleset, options)}</>;
});
