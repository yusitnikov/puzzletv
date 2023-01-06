const apiToken = "cAW3rmtIpqd4I3tTwcsxaAz4yCTUf1BzCRnpUtnlpwJymh2ETp6LN1at61Fo";

const cache: Record<string, string> = {};

export const shortenUrl = async (url: string) => {
    if (cache[url]) {
        return cache[url];
    }

    try {
        const response = await fetch(`https://api.tinyurl.com/create?api_token=${apiToken}`, {
            method: "post",
            body: JSON.stringify({url}),
            headers: {"Content-Type": "application/json"},
        });
        const json = await response.json();
        if (json.errors?.length) {
            console.error("Failed to shorten URL", json.errors);
            return url;
        }
        return cache[url] = json.data?.tiny_url ?? url;
    } catch (e) {
        console.error("Failed to shorten URL", e);
        return url;
    }
};
