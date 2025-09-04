import type { PluginInitializerContext } from '@kbn/core/server';
import { PluginConfigDescriptor } from '@kbn/core/server';
import { ConfigSchema, configSchema } from './config';

export async function plugin(initializerContext: PluginInitializerContext) {
  const { DemoPlugin } = await import('./plugin');
  return new DemoPlugin(initializerContext);
}

export const config: PluginConfigDescriptor<ConfigSchema> = {
  schema: configSchema
};