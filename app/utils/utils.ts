import { useMatches } from "@remix-run/react";
import { useMemo } from "react";

const DEFAULT_REDIRECT = "/";

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = DEFAULT_REDIRECT
) {
  if (!to || typeof to !== "string") {
    return defaultRedirect;
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return defaultRedirect;
  }

  return to;
}

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(
  id: string
): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches();
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id]
  );
  return route?.data;
}

/**
 * Truncates a string to a given max length and suffixes it.
 * @param text - Text to truncate
 * @param maxLength - Max length of truncated text
 * @param truncateSuffix - Suffix to follow the truncated text. Defaults to '...'
 */
export function truncateText(
  text: string,
  maxLength: number,
  truncateSuffix: string = "..."
) {
  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength) + truncateSuffix;
}

export function envMust(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`No environment variable defined for key ${key}`);
  return value;
}

export function envOrDefault(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}
