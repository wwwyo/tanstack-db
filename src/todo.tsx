import { createCollection, eq, useLiveQuery } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { QueryClient } from "@tanstack/query-core";

const queryClient = new QueryClient();

type Todo = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
};

const todoCollection = createCollection(
  queryCollectionOptions<Todo>({
    queryClient,
    queryKey: ["todos"],
    queryFn: async () => {
      const response = await fetch("http://localhost:3001/api/todos");
      return response.json();
    },
    getKey: (item) => item.id,
    // Handle all CRUD operations
    onInsert: async ({ transaction }) => {
      const { modified: newTodo } = transaction.mutations[0];
      await fetch("http://localhost:3001/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTodo),
      });
    },
    onUpdate: async ({ transaction }) => {
      const { original, modified } = transaction.mutations[0];
      await fetch(`http://localhost:3001/api/todos/${original.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(modified),
      });
    },
    onDelete: async ({ transaction }) => {
      const { original } = transaction.mutations[0];
      await fetch(`http://localhost:3001/api/todos/${original.id}`, {
        method: "DELETE",
      });
    },
  }),
);

export function TodoActions({ todo }: { todo: Todo }) {
  const addTodo = () => {
    todoCollection.insert({
      id: crypto.randomUUID(),
      title: "New todo",
      completed: false,
      createdAt: new Date(),
    });
  };

  const toggleComplete = () => {
    todoCollection.update(todo.id, (draft) => {
      draft.completed = !draft.completed;
    });
  };

  const updateText = (newText) => {
    todoCollection.update(todo.id, (draft) => {
      draft.title = newText;
    });
  };

  const deleteTodo = () => {
    todoCollection.delete(todo.id);
  };

  return (
    <div>
      <button onClick={addTodo}>Add Todo</button>
      <button onClick={toggleComplete}>Toggle</button>
      <button onClick={() => updateText("Updated!")}>Edit</button>
      <button onClick={deleteTodo}>Delete</button>
    </div>
  );
}

export function Todos() {
  // Live query that updates automatically when data changes
  const { data: todos } = useLiveQuery((q) =>
    q
      .from({ todo: todoCollection })
      .where(({ todo }) => eq(todo.completed, false))
      .orderBy(({ todo }) => todo.createdAt, "desc"),
  );

  const toggleTodo = (todo) => {
    // Instantly applies optimistic state, then syncs to server
    todoCollection.update(todo.id, (draft) => {
      draft.completed = !draft.completed;
    });
  };

  const addTodo = () => {
    todoCollection.insert({
      id: crypto.randomUUID(),
      title: "New todo",
      completed: false,
      createdAt: new Date(),
    });
  };

  return (
    <div>
      <button onClick={addTodo}>Add Todo</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id} onClick={() => toggleTodo(todo)}>
            {todo.title}
            <TodoActions todo={todo} />
          </li>
        ))}
      </ul>
    </div>
  );
}
