export async function apiFetch(input: RequestInfo, init?: RequestInit) {
  try {
    const res = await fetch(input, {
      ...init,
      credentials: "include",
      cache: "no-store",
    });

    if (res.status === 401) {
      return { unauthorized: true, data: null };
    }

    if (!res.ok) {
      const text = await res.text();
      return { unauthorized: false, data: null, error: text };
    }

    const data = await res.json();
    return { unauthorized: false, data };
  } catch {
    return { unauthorized: false, data: null };
  }
}
