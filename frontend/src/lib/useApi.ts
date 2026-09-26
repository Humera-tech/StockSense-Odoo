import { useCallback, useEffect, useState } from "react";

import { api, errorMessage } from "../services/api";

interface Result<T> {
  path: string | null;
  version: number;
  data?: T;
  error?: string;
}

/** GET a path and re-fetch whenever it changes; pass null to skip. */
export function useApi<T>(path: string | null) {
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState<Result<T>>({ path: null, version: -1 });

  useEffect(() => {
    if (path === null) return;
    let active = true;
    api<T>(path).then(
      (data) => {
        if (active) setResult({ path, version, data });
      },
      (error) => {
        if (active) setResult((prev) => ({ path, version, data: prev.data, error: errorMessage(error) }));
      },
    );
    return () => {
      active = false;
    };
  }, [path, version]);

  const current = result.path === path && result.version === version;
  const reload = useCallback(() => setVersion((v) => v + 1), []);

  return {
    data: result.data,
    error: current ? result.error : undefined,
    loading: path !== null && !current,
    reload,
  };
}
