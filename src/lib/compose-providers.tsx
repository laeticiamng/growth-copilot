/**
 * Composite Provider Pattern
 * Flattens nested provider hierarchy for better readability and performance
 * 
 * Usage:
 * const AppProviders = composeProviders([
 *   [QueryClientProvider, { client: queryClient }],
 *   AuthProvider,
 *   WorkspaceProvider,
 * ]);
 * 
 * // Then in App:
 * <AppProviders>
 *   <App />
 * </AppProviders>
 */

import React, { ReactNode, ComponentType } from 'react';

type ProviderWithProps = [ComponentType<{ children: ReactNode } & Record<string, unknown>>, Record<string, unknown>];
type ProviderWithoutProps = ComponentType<{ children: ReactNode }>;
type ProviderConfig = ProviderWithoutProps | ProviderWithProps;

/**
 * Composes multiple providers into a single component
 * Supports both simple providers and providers with props
 */
export function composeProviders(
  providers: ProviderConfig[]
): ComponentType<{ children: ReactNode }> {
  return function ComposedProviders({ children }: { children: ReactNode }) {
    return providers.reduceRight<ReactNode>((acc, current) => {
      if (Array.isArray(current)) {
        const [Provider, props] = current;
        return React.createElement(Provider, { ...props, children: acc });
      } else {
        const Provider = current;
        return React.createElement(Provider, { children: acc });
      }
    }, children);
  };
}

/**
 * Creates a provider group that can be lazily initialized
 * Useful for splitting providers into logical groups
 */
export function createProviderGroup(
  name: string,
  providers: ProviderConfig[]
): ComponentType<{ children: ReactNode }> {
  const ComposedGroup = composeProviders(providers);
  ComposedGroup.displayName = `ProviderGroup(${name})`;
  return ComposedGroup;
}

/**
 * Pre-defined provider groups for Growth OS
 */
export const ProviderGroups = {
  /**
   * Core providers that must be at the root level
   * Auth, Workspace, Sites, Permissions
   */
  Core: 'CoreProviders',
  
  /**
   * Feature-specific data providers
   * Ads, CRO, Social, Content, etc.
   */
  Features: 'FeatureProviders',
  
  /**
   * AI and automation providers
   * Meta, Creatives, Automations
   */
  AI: 'AIProviders',
  
  /**
   * Utility providers
   * Policies, AuditLog, OpsMetrics
   */
  Utils: 'UtilityProviders',
} as const;
