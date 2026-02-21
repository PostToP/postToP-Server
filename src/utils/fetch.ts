import { logger } from "./logger";

export type Response<T> = {
    ok: true;
    data: T;
} | {
    ok: false;
    error: Error;
};

type RequestOptions = {
    method?: string;
    params?: Record<string, string>;
    body?: any;
    headers?: Record<string, string>;
};

export async function fetchJson<T>(url: string, { method = "GET", params, body, headers }: RequestOptions = {}): Promise<Response<T>> {
    const fullUrl = params ? `${url}?${new URLSearchParams(params).toString()}` : url;
    const init: RequestInit = {
        method,
        headers: body ? { "Content-Type": "application/json", ...headers } : headers,
        body: body ? JSON.stringify(body) : undefined,
    };

    try {
        const response = await fetch(fullUrl, init);
        if (!response.ok) {
            return { ok: false, error: new Error(`HTTP error! status: ${response.status}`) };
        }

        const data = (await response.json()) as T;
        return { ok: true, data };
    } catch (error) {
        return { ok: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
}

export async function fetchJsonWithRetry<T>(url: string, options: RequestOptions = {}, retries = 3, delay = 100): Promise<Response<T>> {
    for (let attempt = 0; attempt < retries; attempt++) {
        const result = await fetchJson<T>(url, options);
        if (result.ok) {
            return result;
        }
        if (attempt === retries - 1) {
            return result;
        }
        const method = options.method ?? "GET";
        logger.warn(`fetchJson failed (attempt ${attempt + 1}/${retries}) [${method}] ${url}: ${result.error.message}. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    const method = options.method ?? "GET";
    logger.error(`fetchJson failed after ${retries} attempts [${method}] ${url} with payload ${JSON.stringify(options.params ?? options.body ?? {})}`);
    return { ok: false, error: new Error(`Failed to fetch after ${retries} attempts`) };
}