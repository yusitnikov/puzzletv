import {LanguageCode} from "../types/translations/LanguageCode";

export const buildLink = (slug: string, language: LanguageCode, params: any = {}, fullUrl = false) => {
    params.lang = language === LanguageCode.en ? undefined : language;

    let href = `${fullUrl ? window.location.origin + window.location.pathname : ""}#${slug}`;

    const addValue = (key: string, value: unknown) => {
        if (["string", "number"].includes(typeof value)) {
            href += `:${key}=${value}`;
            return;
        }

        if (value === true) {
            href += `:${key}`;
            return;
        }

        if (Array.isArray(value)) {
            for (const [index, item] of value.entries()) {
                addValue(`${key}[${index}]`, item);
            }
            return;
        }

        if (typeof value === "object" && value) {
            for (const [subKey, item] of Object.entries(value)) {
                addValue(`${key}[${subKey}]`, item);
            }
        }
    }

    for (const [key, value] of Object.entries(params)) {
        addValue(key, value);
    }

    return href;
};

const parseQueryParamKeyParts = (value: string) => {
    const parts: string[] = [];

    while (value.endsWith("]")) {
        const index = value.lastIndexOf("[");
        if (index > 0) {
            parts.unshift(value.substring(index + 1, value.length - 1));
            value = value.substring(0, index);
        } else {
            break;
        }
    }

    parts.unshift(value);

    return parts;
}

export const parseLink = (hash: string) => {
    let [slug, ...encodedParams] = hash.split(":");

    const params: Record<string, any> = {};

    for (const encodedParam of encodedParams) {
        const [key, ...valueParts] = encodedParam.split("=");
        const keyParts = parseQueryParamKeyParts(key);
        const value = valueParts.join("=");

        let container = params;
        for (const [keyPartIndex, keyPart] of keyParts.entries()) {
            if (keyPartIndex === keyParts.length - 1) {
                container[keyPart] = valueParts.length ? value : true;
            } else {
                container = container[keyPart] = container[keyPart] ?? {};
            }
        }
    }

    for (const languageOption in LanguageCode) {
        const suffix = `-${languageOption}`;

        if (slug.endsWith(suffix)) {
            params.lang = languageOption;
            slug = slug.substring(0, slug.length - suffix.length);
            break;
        }
    }

    if (slug.endsWith("-lmd")) {
        params.lmd = true;
        slug = slug.substring(0, slug.length - 4);
    }

    params.lang = params.lang || LanguageCode.en;

    return {slug, params};
};
