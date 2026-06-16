import { useDispatch, useSelector } from 'react-redux';

import type { AppDispatch, RootState } from './index';

/** Pre-typed Redux hooks so components never re-annotate state/dispatch. */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
