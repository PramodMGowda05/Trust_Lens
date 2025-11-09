'use client';

// A wrapper for fetch that automatically adds the JWT token
// to the Authorization header.

import { getCookie } from 'cookies-next';

const getApiUrl = () => {
    // In a real app, you'd use environment variables
    // For this demo, we assume the Python service is on localhost:5001
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
}

type FetchOptions = RequestInit & {
    includeAuth?: boolean;
};

export async function apiFetch(endpoint: string, options: FetchOptions = {}): Promise<any> {
    const { includeAuth = true, ...fetchOptions } = options;
    const headers = new Headers(fetchOptions.headers || {});
    
    if (includeAuth) {
        const token = getCookie('auth_token');
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
    }

    if (!headers.has('Content-Type') && !(fetchOptions.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${getApiUrl()}${endpoint}`, {
        ...fetchOptions,
        headers,
    });

    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            // Not a JSON response
            errorData = { detail: `HTTP error! status: ${response.status}` };
        }
        // FastAPI validation errors are often in `detail`
        const message = errorData.detail || `HTTP error! status: ${response.status}`;
        throw new Error(message);
    }

    // Handle cases with no content
    if (response.status === 204) {
        return null;
    }

    return response.json();
}
