
import { extractSettings, sanitizeSettings } from "../src/features/templates/template-utils";
import { DEFAULT_SETTINGS, EditorProSettings } from "../src/config";

// Mocking required interfaces if they aren't fully available in test env
// But assuming jest handles imports correctly based on previous context.

describe("Template Utils Security & Logic", () => {
    // Create a mock settings object full of data
    const mockSettings: EditorProSettings = {
        ...DEFAULT_SETTINGS,
        enableHomepage: true,
        homepageTrackedFolders: "Test:Folder",
        enableVaultGuardian: true,
        vaultGuardianAllowedRoots: "Root",
        // This simulates a recursive data issue where templates contain templates
        userTemplates: [{
            id: "recursion",
            name: "Bad",
            description: "",
            type: "full",
            data: {},
            created: 123
        }]
    };

    describe("extractSettings (Backup Logic)", () => {
        test("Full extract MUST exclude userTemplates (Recursion Protection)", () => {
            const result = extractSettings(mockSettings, "full");

            // Should verify data integrity
            expect(result.enableHomepage).toBe(true);
            expect(result.enableVaultGuardian).toBe(true);

            // Security verification
            expect(result).not.toHaveProperty("userTemplates");
        });

        test("Homepage extract should ONLY include homepage keys", () => {
            const result = extractSettings(mockSettings, "homepage");

            expect(result.enableHomepage).toBe(true);
            expect(result.homepageTrackedFolders).toBe("Test:Folder");

            // Should NOT have other module data
            expect(result).not.toHaveProperty("enableVaultGuardian");
            expect(result).not.toHaveProperty("userTemplates");
        });

        test("Guardian extract should ONLY include guardian keys", () => {
            const result = extractSettings(mockSettings, "guardian");

            expect(result.enableVaultGuardian).toBe(true);
            expect(result.vaultGuardianAllowedRoots).toBe("Root");

            // Should NOT have other module data
            expect(result).not.toHaveProperty("enableHomepage");
        });
    });

    describe("sanitizeSettings (Restore Logic)", () => {
        test("Should remove keys not present in DEFAULT_SETTINGS (Whitelist)", () => {
            const dirtyInput = {
                enableHomepage: true,
                "maliciousKey": "inject code",
                "randomProp": 123
            };

            const clean = sanitizeSettings(dirtyInput);

            expect(clean.enableHomepage).toBe(true);
            expect(clean).not.toHaveProperty("maliciousKey");
            expect(clean).not.toHaveProperty("randomProp");
        });

        test("Should STRICTLY remove userTemplates to prevent db overwrite", () => {
            const dirtyInput = {
                enableHomepage: true,
                userTemplates: [{ id: "hacker", data: {} }]
            };

            const clean = sanitizeSettings(dirtyInput);

            expect(clean.enableHomepage).toBe(true);
            expect(clean).not.toHaveProperty("userTemplates");
        });

        test("Should handle null/undefined gracefully", () => {
            expect(sanitizeSettings(null)).toEqual({});
            expect(sanitizeSettings(undefined)).toEqual({});
        });
    });
});
