import { IProviderAdapter } from './types';

/**
 * Registry for provider adapters
 */
export class ProviderRegistry {
  private static adapters: Map<string, IProviderAdapter> = new Map();

  /**
   * Register a new provider adapter
   */
  static register(adapter: IProviderAdapter): void {
    if (this.adapters.has(adapter.name)) {
      throw new Error(`Provider adapter with name "${adapter.name}" already registered`);
    }
    this.adapters.set(adapter.name, adapter);
  }

  /**
   * Get all registered adapters
   */
  static getAll(): IProviderAdapter[] {
    return Array.from(this.adapters.values());
  }

  /**
   * Get a specific adapter by name
   */
  static get(name: string): IProviderAdapter | undefined {
    return this.adapters.get(name);
  }

  /**
   * Get all adapter names
   */
  static getNames(): string[] {
    return Array.from(this.adapters.keys());
  }

  /**
   * Clear all adapters (useful for testing)
   */
  static clear(): void {
    this.adapters.clear();
  }
}