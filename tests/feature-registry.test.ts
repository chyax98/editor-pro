import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { FeatureRegistry, Feature, ConditionalFeature, CommandFeature, EventFeature, EditorProPlugin } from '../src/core/FeatureRegistry';

describe('FeatureRegistry', () => {
    let registry: FeatureRegistry;
    let mockPlugin: EditorProPlugin;

    beforeEach(() => {
        registry = new FeatureRegistry();
        mockPlugin = {
            settings: { enableTestFeature: true },
        } as unknown as EditorProPlugin;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {
        test('registers a feature', () => {
            const feature: Feature = {
                id: 'test-feature',
                name: 'Test Feature',
                onload: jest.fn(),
            };
            registry.register(feature);
            expect(registry.get('test-feature')).toBe(feature);
        });

        test('warns when registering duplicate feature', () => {
            const feature: Feature = {
                id: 'test-feature',
                name: 'Test Feature',
                onload: jest.fn(),
            };
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

            registry.register(feature);
            registry.register(feature);

            expect(consoleWarnSpy).toHaveBeenCalledWith('Feature test-feature is already registered');
            consoleWarnSpy.mockRestore();
        });
    });

    describe('loadAll', () => {
        test('loads all enabled features', async () => {
            const feature1: Feature = {
                id: 'feature-1',
                name: 'Feature 1',
                onload: jest.fn(),
            };
            const feature2: Feature = {
                id: 'feature-2',
                name: 'Feature 2',
                onload: jest.fn(),
            };

            registry.register(feature1);
            registry.register(feature2);

            await registry.loadAll(mockPlugin);

            expect(feature1.onload).toHaveBeenCalledWith(mockPlugin);
            expect(feature2.onload).toHaveBeenCalledWith(mockPlugin);
            expect(registry.isLoaded('feature-1')).toBe(true);
            expect(registry.isLoaded('feature-2')).toBe(true);
        });

        test('skips disabled conditional features', async () => {
            const enabledFeature: ConditionalFeature = {
                id: 'enabled-feature',
                name: 'Enabled Feature',
                isEnabled: (settings) => (settings as { enableTestFeature: boolean }).enableTestFeature,
                onload: jest.fn(),
            };
            const disabledFeature: ConditionalFeature = {
                id: 'disabled-feature',
                name: 'Disabled Feature',
                isEnabled: () => false,
                onload: jest.fn(),
            };

            registry.register(enabledFeature);
            registry.register(disabledFeature);

            await registry.loadAll(mockPlugin);

            expect(enabledFeature.onload).toHaveBeenCalledWith(mockPlugin);
            expect(disabledFeature.onload).not.toHaveBeenCalled();
            expect(registry.isLoaded('enabled-feature')).toBe(true);
            expect(registry.isLoaded('disabled-feature')).toBe(false);
        });

        test('handles feature load errors gracefully', async () => {
            const failingFeature: Feature = {
                id: 'failing-feature',
                name: 'Failing Feature',
                onload: jest.fn().mockRejectedValue(new Error('Load failed')),
            };
            const successfulFeature: Feature = {
                id: 'successful-feature',
                name: 'Successful Feature',
                onload: jest.fn(),
            };

            registry.register(failingFeature);
            registry.register(successfulFeature);

            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            await registry.loadAll(mockPlugin);

            expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load feature failing-feature:', expect.any(Error));
            expect(successfulFeature.onload).toHaveBeenCalled();
            expect(registry.isLoaded('failing-feature')).toBe(false);
            expect(registry.isLoaded('successful-feature')).toBe(true);

            consoleErrorSpy.mockRestore();
        });

        test('supports async onload', async () => {
            let asyncCallCount = 0;
            const asyncFeature: Feature = {
                id: 'async-feature',
                name: 'Async Feature',
                onload: async () => {
                    await new Promise(resolve => setTimeout(resolve, 10));
                    asyncCallCount++;
                },
            };

            registry.register(asyncFeature);
            await registry.loadAll(mockPlugin);

            expect(asyncCallCount).toBe(1);
            expect(registry.isLoaded('async-feature')).toBe(true);
        });
    });

    describe('unloadAll', () => {
        test('unloads all loaded features', async () => {
            const feature1: Feature = {
                id: 'feature-1',
                name: 'Feature 1',
                onload: jest.fn(),
                onUnload: jest.fn(),
            };
            const feature2: Feature = {
                id: 'feature-2',
                name: 'Feature 2',
                onload: jest.fn(),
                onUnload: jest.fn(),
            };

            registry.register(feature1);
            registry.register(feature2);
            await registry.loadAll(mockPlugin);

            await registry.unloadAll(mockPlugin);

            expect(feature1.onUnload).toHaveBeenCalledWith(mockPlugin);
            expect(feature2.onUnload).toHaveBeenCalledWith(mockPlugin);
            expect(registry.isLoaded('feature-1')).toBe(false);
            expect(registry.isLoaded('feature-2')).toBe(false);
        });

        test('handles features without onUnload', async () => {
            const feature: Feature = {
                id: 'feature',
                name: 'Feature',
                onload: jest.fn(),
            };

            registry.register(feature);
            await registry.loadAll(mockPlugin);
            await registry.unloadAll(mockPlugin);

            expect(registry.isLoaded('feature')).toBe(false);
        });

        test('handles feature unload errors gracefully', async () => {
            const failingFeature: Feature = {
                id: 'failing-feature',
                name: 'Failing Feature',
                onload: jest.fn(),
                onUnload: jest.fn().mockRejectedValue(new Error('Unload failed')),
            };
            const successfulFeature: Feature = {
                id: 'successful-feature',
                name: 'Successful Feature',
                onload: jest.fn(),
                onUnload: jest.fn(),
            };

            registry.register(failingFeature);
            registry.register(successfulFeature);
            await registry.loadAll(mockPlugin);

            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            await registry.unloadAll(mockPlugin);

            expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to unload feature failing-feature:', expect.any(Error));
            expect(successfulFeature.onUnload).toHaveBeenCalled();

            consoleErrorSpy.mockRestore();
        });
    });

    describe('get', () => {
        test('returns registered feature by ID', () => {
            const feature: Feature = {
                id: 'test-feature',
                name: 'Test Feature',
                onload: jest.fn(),
            };
            registry.register(feature);
            expect(registry.get('test-feature')).toBe(feature);
        });

        test('returns undefined for unregistered feature', () => {
            expect(registry.get('non-existent')).toBeUndefined();
        });
    });

    describe('isLoaded', () => {
        test('returns true for loaded features', async () => {
            const feature: Feature = {
                id: 'test-feature',
                name: 'Test Feature',
                onload: jest.fn(),
            };
            registry.register(feature);
            await registry.loadAll(mockPlugin);
            expect(registry.isLoaded('test-feature')).toBe(true);
        });

        test('returns false for unloaded features', () => {
            const feature: Feature = {
                id: 'test-feature',
                name: 'Test Feature',
                onload: jest.fn(),
            };
            registry.register(feature);
            expect(registry.isLoaded('test-feature')).toBe(false);
        });

        test('returns false after unload', async () => {
            const feature: Feature = {
                id: 'test-feature',
                name: 'Test Feature',
                onload: jest.fn(),
                onUnload: jest.fn(),
            };
            registry.register(feature);
            await registry.loadAll(mockPlugin);
            await registry.unloadAll(mockPlugin);
            expect(registry.isLoaded('test-feature')).toBe(false);
        });
    });
});

describe('CommandFeature', () => {
    test('provides base implementation for command features', async () => {
        let commandsRegistered = false;

        class TestCommandFeature extends CommandFeature {
            readonly id = 'test-command';
            readonly name = 'Test Command';

            protected registerCommands(_: EditorProPlugin): void {
                commandsRegistered = true;
            }
        }

        const feature = new TestCommandFeature();
        const mockPlugin = {} as EditorProPlugin;

        await feature.onload(mockPlugin);

        expect(commandsRegistered).toBe(true);
    });

    test('has required Feature interface properties', () => {
        class TestCommandFeature extends CommandFeature {
            readonly id = 'test-command';
            readonly name = 'Test Command';

            protected registerCommands(): void {
                // No-op
            }
        }

        const feature = new TestCommandFeature();

        expect(feature.id).toBe('test-command');
        expect(feature.name).toBe('Test Command');
        expect(feature.onload).toBeInstanceOf(Function);
    });
});

describe('EventFeature', () => {
    test('provides base implementation for event features', async () => {
        let eventsRegistered = false;

        class TestEventFeature extends EventFeature {
            readonly id = 'test-event';
            readonly name = 'Test Event';

            protected registerEvents(_: EditorProPlugin): void {
                eventsRegistered = true;
            }
        }

        const feature = new TestEventFeature();
        const mockPlugin = {} as EditorProPlugin;

        await feature.onload(mockPlugin);

        expect(eventsRegistered).toBe(true);
    });

    test('has required Feature interface properties', () => {
        class TestEventFeature extends EventFeature {
            readonly id = 'test-event';
            readonly name = 'Test Event';

            protected registerEvents(): void {
                // No-op
            }
        }

        const feature = new TestEventFeature();

        expect(feature.id).toBe('test-event');
        expect(feature.name).toBe('Test Event');
        expect(feature.onload).toBeInstanceOf(Function);
    });
});

describe('ConditionalFeature', () => {
    test('allows conditional loading based on settings', async () => {
        const conditionalFeature: ConditionalFeature = {
            id: 'conditional-feature',
            name: 'Conditional Feature',
            isEnabled: (settings) => (settings as { enabled: boolean }).enabled === true,
            onload: jest.fn(),
        };

        const registry = new FeatureRegistry();
        registry.register(conditionalFeature);

        // Test with enabled settings
        const enabledPlugin = { settings: { enabled: true } } as unknown as EditorProPlugin;
        await registry.loadAll(enabledPlugin);
        expect(conditionalFeature.onload).toHaveBeenCalled();
        expect(registry.isLoaded('conditional-feature')).toBe(true);

        // Reset and test with disabled settings
        await registry.unloadAll(enabledPlugin);
        const disabledPlugin = { settings: { enabled: false } } as unknown as EditorProPlugin;
        (conditionalFeature.onload as jest.Mock).mockClear();

        await registry.loadAll(disabledPlugin);
        expect(conditionalFeature.onload).not.toHaveBeenCalled();
        expect(registry.isLoaded('conditional-feature')).toBe(false);
    });
});
