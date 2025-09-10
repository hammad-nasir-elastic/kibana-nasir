import { EuiButton, EuiFieldText, EuiFlexGrid, EuiFlexItem, EuiInlineEditText } from '@elastic/eui';
import { IntlProvider, FormattedMessage } from 'react-intl';
import { KibanaPageTemplate } from '@kbn/shared-ux-page-kibana-template';
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

export const renderApp = (coreStart: any, depsStart: any, { element }: any) => {
    ReactDOM.render(
        <ToDoApp coreStart={coreStart} />,
        element
    );

    return () => ReactDOM.unmountComponentAtNode(element);
};

const messages = {
    'todoList.pageTitle': 'Todo List Plugin',
    'todoList.addPlaceholder': 'Add new todo',
    'todoList.addButton': 'Add',
    'todoList.updatePlaceholder': 'Update todo',
    'todoList.updateButton': 'Update',
    'todoList.completeButton': 'Complete',
    'todoList.deleteButton': 'Delete',
};

const ToDoApp = ({ coreStart }: { coreStart: any }) => {
    const [todoList, setTodoList] = React.useState<any[]>([]);
    const [newTodo, setNewTodo] = React.useState<string>("");

    useEffect(() => {
        async function fetchData() {
            const response: any = await coreStart.http.get('/api/todos');
            const items = response.map((todo: any) => ({
                id: todo.id,
                item: todo.attributes.item,
                completed: todo.attributes.completed
            }));
            console.log('items', items);
            setTodoList(items);
        }
        fetchData();
    }, [coreStart.http]);

    const addTodoItem = ((item: string) => {
        async function addItem(item: string) {
            const response = await coreStart.http.post('/api/todos', {
                body: JSON.stringify({ item }),
            });
            const newItem = { id: response.id, item: response.attributes.item, completed: response.attributes.completed };
            setTodoList([...todoList, newItem]);
        }
        addItem(item);
    });

    const updateTodoItem = ((id: string, item: string) => {
        async function updateItem(id: string, item: string) {
            const response = await coreStart.http.put(`/api/todos/${id}`, {
                body: JSON.stringify({ item }),
            });
            const updatedItem = { id: response.id, item: response.attributes.item };
            const updatedList = todoList.map(todo => todo.id === id ? updatedItem : todo);
            setTodoList(updatedList);

        }
        updateItem(id, item);
    });

    const completeTodoItem = ((id: string, item: string) => {
        async function completeItem(id: string) {
            const response = await coreStart.http.put(`/api/todos/${id}`, {
                body: JSON.stringify({ item, completed: true }),
            });
            const completedItem = { id: response.id, item: response.attributes.item, completed: response.attributes.completed };
            const updatedList = todoList.map(todo => todo.id === id ? completedItem : todo);
            setTodoList(updatedList);
        }
        completeItem(id);
    });

    const deleteTodoItem = ((id: string) => {
        async function deleteItem(id: string) {
            await coreStart.http.delete(`/api/todos/${id}`);
            const updatedList = todoList.filter(todo => todo.id !== id);
            setTodoList(updatedList);
        }
        deleteItem(id);
    });

    return (
        <IntlProvider locale="en" messages={messages}>
            <KibanaPageTemplate>
                <KibanaPageTemplate.Header
                    pageTitle={<FormattedMessage id="todoList.pageTitle" defaultMessage={messages['todoList.pageTitle']} />}
                />
                <KibanaPageTemplate.Section>
                    <EuiFlexGrid columns={3} gutterSize='s'>
                        {todoList.map((todo: { id: string, item: string, completed: boolean }) => (
                            <>
                                <EuiFlexItem>
                                    <EuiInlineEditText
                                        isReadOnly={todo.completed}
                                        size='m'
                                        defaultValue={todo.item}
                                        inputAriaLabel={`Edit todo item: ${todo.item}`}
                                        onSave={(value) => updateTodoItem(todo.id, value)}
                                    />
                                </EuiFlexItem>
                                <EuiFlexItem>
                                    <EuiButton
                                        disabled={todo.completed}
                                        onClick={() => {
                                            completeTodoItem(todo.id, todo.item);
                                        }}
                                    >
                                        {todo.completed ? (
                                            <FormattedMessage id="todoList.completedButton" defaultMessage="Completed" />
                                        ) : (
                                            <FormattedMessage id="todoList.completeButton" defaultMessage={messages['todoList.completeButton']} />
                                        )}
                                    </EuiButton>
                                </EuiFlexItem>
                                <EuiFlexItem>
                                    <EuiButton
                                        onClick={() => {
                                            deleteTodoItem(todo.id);
                                        }}
                                    >
                                        <FormattedMessage id="todoList.deleteButton" defaultMessage={messages['todoList.deleteButton']} />
                                    </EuiButton>
                                </EuiFlexItem>
                            </>
                        ))}
                    </EuiFlexGrid>
                    <EuiFlexGrid columns={2} gutterSize='none' style={{ marginTop: '20px' }}>
                        <EuiFlexItem>
                            <FormattedMessage id="todoList.addPlaceholder" defaultMessage={messages['todoList.addPlaceholder']}>
                                {msg => (
                                    <EuiFieldText
                                        placeholder={String(msg)}
                                        value={newTodo}
                                        onChange={e => setNewTodo(e.target.value)}
                                        aria-label="Use aria labels when no actual label is in use"
                                    />
                                )}
                            </FormattedMessage>
                        </EuiFlexItem>
                        <EuiFlexItem>
                            <EuiButton
                                onClick={() => {
                                    if (newTodo.trim()) {
                                        addTodoItem(newTodo.trim());
                                        setNewTodo("");
                                    }
                                }}
                            >
                                <FormattedMessage id="todoList.addButton" defaultMessage={messages['todoList.addButton']} />
                            </EuiButton>
                        </EuiFlexItem>
                    </EuiFlexGrid>
                </KibanaPageTemplate.Section>
            </KibanaPageTemplate>
        </IntlProvider>
    )
}