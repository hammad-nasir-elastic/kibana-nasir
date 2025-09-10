import { AppMountParameters, CoreSetup, CoreStart, Plugin } from '@kbn/core/public';
import { DeveloperExamplesSetup } from '@kbn/developer-examples-plugin/public';
interface SetupDeps {
  developerExamples: DeveloperExamplesSetup;
}
export class TodoListPlugin implements Plugin<void, void, SetupDeps> {
  public setup(core: CoreSetup, deps: SetupDeps) {
    // Register an application into the side navigation menu
    core.application.register({
      id: 'todoList',
      title: 'Todo List',
      async mount(params: AppMountParameters) {
        const { renderApp } = await import('./app');
        const [coreStart, depsStart] = await core.getStartServices();
        return renderApp(coreStart, depsStart as {}, params);
      }
    });
    // This section is only needed to get this example plugin to show up in our Developer Examples.
    deps.developerExamples.register({
      appId: 'todoList',
      title: 'Todo List Application',
      description: `Build a plugin that registers an application as a todo list`,
    });
  }
  public async start(core: CoreStart) {
    return {}
  };
  
  public stop() {}
}