/**
 * Backward-compatibility shim.
 * All new code should import directly from `./clients`.
 * This file exists so existing imports of `api` from `./axios` continue to work.
 */
export { faqApi as api } from "./clients";
