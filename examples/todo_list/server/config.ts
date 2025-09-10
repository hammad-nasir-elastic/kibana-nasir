import { schema, TypeOf } from '@kbn/config-schema';

export const configSchema = schema.object({
  hideCompleted: schema.boolean({ defaultValue: false })
});

export type ConfigSchema = TypeOf<typeof configSchema>;