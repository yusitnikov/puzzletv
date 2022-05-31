import {LanguageCode} from "../types/translations/LanguageCode";

export const buildLink = (slug: string, language: LanguageCode, params: any = {}) => {
    params.lang = language === LanguageCode.en ? undefined : language;

    let href = `#${slug}`;

    for (const [key, value] of Object.entries(params)) {
        if (["string", "number"].includes(typeof value)) {
            href += `:${key}=${value}`;
        }

        if (value === true) {
            href += `:${key}`;
        }
    }

    return href;
};

export const parseLink = (hash: string) => {
    let [slug, ...encodedParams] = hash.split(":");

    const params: Record<string, any> = {};

    for (const encodedParam of encodedParams) {
        const [key, ...valueParts] = encodedParam.split("=");
        const value = valueParts.join();
        params[key] = valueParts.length ? value : true;
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
}