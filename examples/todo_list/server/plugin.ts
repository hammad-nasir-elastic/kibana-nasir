import { schema } from '@kbn/config-schema';
import type { Plugin, PluginInitializerContext, CoreSetup, CoreStart } from '@kbn/core/server';
export class DemoPlugin implements Plugin {
    constructor(initializerContext: PluginInitializerContext) { }
    public setup(core: CoreSetup) {
        const router = core.http.createRouter();

        // Register a simple SO type to store todo items
        core.savedObjects.registerType({
            name: 'todo',
            hidden: false,
            namespaceType: 'single',
            mappings: {
                properties: {
                    item: { type: 'text' },
                    completed: { type: 'boolean' }
                },
            }
        });

        core.uiSettings.register({
            ['hide_completed_items']: {
                name: 'Hide completed items',
                description:
                    'completed items will not be sent in the GET /api/todos response',
                requiresPageReload: true,
                schema: schema.boolean(),
                value: false,
            },
        });

        router.get({
            path: '/api/todos',
            validate: false,
            security: {
                authz: {
                    enabled: false,
                    reason: 'testing'
                }
            },
            options: { access: 'public' }
        }, async (context, req, res) => {
            const core = await context.core;
            const hideCompleted = await core.uiSettings.client.get('hide_completed_items');
            let todos = (await core.savedObjects.client.find({ type: 'todo' })).saved_objects;

            if (hideCompleted) {
                todos = todos.filter((todo: any) => todo.attributes.completed === false);
            }
            
            return res.ok({ body: todos });
        });

        router.get({
            path: '/api/todos/{id}',
            validate: {
                params: schema.object({
                    id: schema.string()
                }),
            },
            security: {
                authz: {
                    enabled: false,
                    reason: 'testing'
                }
            },
            options: { access: 'public' }
        }, async (context, req, res) => {
            const { id } = req.params as { id: string };
            const core = await context.core;
            const todo = await core.savedObjects.client.get('todo', id);
            return res.ok({ body: todo });
        });

        router.post({
            path: '/api/todos',
            validate: {
                body: schema.object({
                    item: schema.string()
                }),
            },
            security: {
                authz: {
                    enabled: false,
                    reason: 'testing'
                }
            },
            options: { access: 'public' }
        }, async (context, req, res) => {
            const { item } = req.body as { item: string };
            const core = await context.core;
            const todo = await core.savedObjects.client.create('todo', { item, completed: false });
            return res.ok({ body: todo });
        });

        router.put({
            path: '/api/todos/{id}',
            validate: {
                body: schema.object({
                    item: schema.string(),
                    completed: schema.maybe(schema.boolean())
                }),
                params: schema.object({
                    id: schema.string()
                }),
            },
            security: {
                authz: {
                    enabled: false,
                    reason: 'testing'
                }
            },
            options: { access: 'public' }
        }, async (context, req, res) => {
            const { id } = req.params as { id: string };
            const { item, completed } = req.body as { item: string, completed?: boolean };
            const core = await context.core;
            let todo;

            if (completed) {
                todo = await core.savedObjects.client.update('todo', id, { item, completed });
            } else {
                todo = await core.savedObjects.client.update('todo', id, { item });
            }

            return res.ok({ body: todo });
        });

        router.delete({
            path: '/api/todos/{id}',
            validate: {
                params: schema.object({
                    id: schema.string()
                }),
            },
            security: {
                authz: {
                    enabled: false,
                    reason: 'testing'
                }
            },
            options: { access: 'public' }
        }, async (context, req, res) => {
            const { id } = req.params as { id: string };
            const core = await context.core;
            const deleted = await core.savedObjects.client.delete('todo', id);
            return res.ok({ body: { success: true, deleted } });
        });
    }
    public start(core: CoreStart) {
        // called after all plugins are set up
    }
    public stop() {
        // called when plugin is torn down during Kibana's shutdown sequence
    }
}