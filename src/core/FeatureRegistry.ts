import { Plugin } from 'obsidian';

/**
 * Feature interface for modular feature registration
 */
export interface Feature {
    readonly id: string;
    readonly name: string;

    /**
     * Called when the plugin loads
     * Use this to register commands, event handlers, etc.
     */
    onload(plugin: EditorProPlugin): void | Promise<void>;

    /**
     * Called when the plugin unloads
     * Use this to clean up resources
     */
    onUnload?(plugin: EditorProPlugin): void | Promise<void>;
}

/**
 * Conditional feature that only loads when a setting is enabled
 */
export interface ConditionalFeature extends Feature {
    /**
     * Check if this feature should be enabled based on settings
     */
    isEnabled(settings: unknown): boolean;
}

/**
 * Feature registry for managing modular feature loading
 */
export class FeatureRegistry {
    private features: Map<string, Feature> = new Map();
    private loadedFeatures: Set<string> = new Set();

    /**
     * Register a feature
     */
    register(feature: Feature): void {
        if (this.features.has(feature.id)) {
            console.warn(`Feature ${feature.id} is already registered`);
            return;
        }
        this.features.set(feature.id, feature);
    }

    /**
     * Load all registered features
     */
    async loadAll(plugin: EditorProPlugin): Promise<void> {
        for (const [id, feature] of this.features) {
            // Skip conditional features that aren't enabled
            if ('isEnabled' in feature) {
                const conditionalFeature = feature as ConditionalFeature;
                if (!conditionalFeature.isEnabled(plugin.settings)) {
                    continue;
                }
            }

            try {
                await feature.onload(plugin);
                this.loadedFeatures.add(id);
            } catch (error) {
                console.error(`Failed to load feature ${id}:`, error);
            }
        }
    }

    /**
     * Unload all loaded features
     */
    async unloadAll(plugin: EditorProPlugin): Promise<void> {
        for (const id of this.loadedFeatures) {
            const feature = this.features.get(id);
            if (feature?.onUnload) {
                try {
                    await feature.onUnload(plugin);
                } catch (error) {
                    console.error(`Failed to unload feature ${id}:`, error);
                }
            }
        }
        this.loadedFeatures.clear();
    }

    /**
     * Get a registered feature by ID
     */
    get(id: string): Feature | undefined {
        return this.features.get(id);
    }

    /**
     * Check if a feature is loaded
     */
    isLoaded(id: string): boolean {
        return this.loadedFeatures.has(id);
    }
}

/**
 * Base class for command-based features
 */
export abstract class CommandFeature implements Feature {
    abstract readonly id: string;
    abstract readonly name: string;

    /**
     * Register commands for this feature
     */
    protected abstract registerCommands(plugin: EditorProPlugin): void;

    async onload(plugin: EditorProPlugin): Promise<void> {
        this.registerCommands(plugin);
    }
}

/**
 * Base class for event-based features
 */
export abstract class EventFeature implements Feature {
    abstract readonly id: string;
    abstract readonly name: string;

    /**
     * Register event handlers for this feature
     */
    protected abstract registerEvents(plugin: EditorProPlugin): void;

    async onload(plugin: EditorProPlugin): Promise<void> {
        this.registerEvents(plugin);
    }
}

/**
 * Type alias for the main plugin class
 * This avoids circular imports
 */
export type EditorProPlugin = Plugin & {
    settings: Record<string, unknown>;
    [key: string]: unknown;
};
