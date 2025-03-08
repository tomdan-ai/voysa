import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractErrorMessage(data: unknown): string {
  if (typeof data === "string") {
    return data;
  }

  if (typeof data === "object" && data !== null) {
    if ("message" in data && typeof data.message === "string") {
      return data.message;
    }
    if ("error" in data && typeof data.error === "string") {
      return data.error;
    }

    for (const key of Object.keys(data)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nestedError = extractErrorMessage((data as any)[key]);
      if (nestedError) return nestedError;
    }
  }

  return "Unknown error occurred.";
}
