import { useState } from 'react';
import {
  useLocation,
  useNavigationType,
  useSearchParams,
  NavigationType,
  createSearchParams,
  type URLSearchParamsInit,
} from 'react-router-dom';

type ParamsUpdate = URLSearchParamsInit | ((previous: URLSearchParams) => URLSearchParams);

export function useStableSearchParams(): [URLSearchParams, (update: ParamsUpdate) => void] {
  const location = useLocation();
  const navigationType = useNavigationType();
  const [, navigate] = useSearchParams();
  const [draft, setDraft] = useState(() => ({
    key: location.key,
    params: new URLSearchParams(location.search),
  }));
  const localNavigation = (location.state as { stableFilters?: boolean } | null)?.stableFilters;
  if (draft.key !== location.key) {
    const params =
      navigationType === NavigationType.Pop || !localNavigation
        ? new URLSearchParams(location.search)
        : draft.params;
    setDraft({ key: location.key, params });
  }
  const update = (next: ParamsUpdate) => {
    const params = createSearchParams(
      typeof next === 'function' ? next(new URLSearchParams(draft.params)) : next,
    );
    setDraft({ key: location.key, params });
    navigate(params, { state: { stableFilters: true } });
  };
  return [draft.params, update];
}
