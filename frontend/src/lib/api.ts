const configuredApiBase = import.meta.env.VITE_API_URL?.trim();

export const getApiBaseUrl = () => {
    if (configuredApiBase) {
        return configuredApiBase.replace(/\/$/, '');
    }

    return import.meta.env.DEV ? 'http://localhost:5000' : '';
};

export const apiUrl = (path: string) => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const base = getApiBaseUrl();

    return base ? `${base}${normalizedPath}` : normalizedPath;
};

export const fetchJson = async (input: string | URL | Request, init?: RequestInit) => {
    const response = await fetch(input, init);
    const rawText = await response.text();

    if (!response.ok) {
        let message = 'Request failed';

        try {
            const parsed = rawText ? JSON.parse(rawText) : null;
            message = parsed?.message || parsed?.error || parsed?.detail || message;
        } catch {
            // Ignore invalid JSON and keep the default message.
        }

        throw new Error(message);
    }

    if (!rawText) {
        return null;
    }

    try {
        return JSON.parse(rawText);
    } catch {
        if (rawText.trim().startsWith('<')) {
            throw new Error('The server returned HTML instead of JSON. Set VITE_API_URL to your backend URL in Vercel.');
        }

        throw new Error('Unexpected response format from server.');
    }
};
