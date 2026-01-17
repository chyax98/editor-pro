/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */

import { EditorProSettings, DEFAULT_SETTINGS } from "../../config";

/**
 * Extract a subset of settings based on the specified type.
 * CRITICAL: This function must enforce recursion protection by excluding 'userTemplates'.
 */
export function extractSettings(
    settings: EditorProSettings,
    type: "full" | "homepage" | "guardian"
): Partial<EditorProSettings> {
    // Deep copy first
    const current: any = JSON.parse(JSON.stringify(settings));

    // PROTECTION 1: Anti-Recursion
    // Always remove userTemplates from any snapshot
    if (current && typeof current === 'object' && 'userTemplates' in current) {
        delete current.userTemplates;
    }

    if (type === "full") {
        return current as Partial<EditorProSettings>;
    }

    const subset: Partial<EditorProSettings> = {};
    const keys = Object.keys(current) as (keyof EditorProSettings)[];

    for (const key of keys) {
        // PROTECTION 2: Scope Isolation
        if (type === "homepage") {
            if (key.startsWith("homepage") || key === "enableHomepage") {
                (subset as any)[key] = current[key];
            }
        } else if (type === "guardian") {
            if (key.startsWith("vaultGuardian") || key === "enableVaultGuardian") {
                (subset as any)[key] = current[key];
            }
        }
    }
    return subset;
}

/**
 * Sanitize input data before applying it to settings.
 * Enforces a strict whitelist based on DEFAULT_SETTINGS.
 */
export function sanitizeSettings(inputData: any): Partial<EditorProSettings> {
    const cleanData: any = {};
    const validKeys = Object.keys(DEFAULT_SETTINGS);

    if (!inputData || typeof inputData !== 'object') {
        return {};
    }

    for (const key in inputData) {
        //RULE 1: Recursive Block
        if (key === 'userTemplates') continue;

        //RULE 2: Whitelist Check
        if (validKeys.includes(key)) {
            cleanData[key] = inputData[key];
        }
    }

    return cleanData as Partial<EditorProSettings>;
}
