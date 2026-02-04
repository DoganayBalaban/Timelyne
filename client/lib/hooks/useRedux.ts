import type { AppDispatch, RootState } from "@/lib/store";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

// Typed hooks for Redux
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
