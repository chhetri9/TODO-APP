import { useState, useEffect } from "react";
import { databases, databaseId, collectionId, ID } from './appwrite';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch todos from Appwrite
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await databases.listDocuments(databaseId, collectionId);
        setTodos(response.documents.map((doc: any) => ({
          id: doc.$id,
          text: doc.text,
          completed: doc.completed
        })));
      } catch (error) {
        console.error("Error fetching todos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, []);

  const addTodo = async () => {
    if (input.trim()) {
      try {
        const newTodo = {
          text: input,
          completed: false
        };

        const response = await databases.createDocument(
          databaseId,
          collectionId,
          ID.unique(),
          newTodo
        );

        setTodos([...todos, {
          id: response.$id,
          text: response.text,
          completed: response.completed
        }]);
        setInput("");
      } catch (error) {
        console.error("Error adding todo:", error);
      }
    }
  };

  const toggleComplete = async (id: string) => {
    try {
      const todoToUpdate = todos.find(t => t.id === id);
      if (!todoToUpdate) return;

      await databases.updateDocument(
        databaseId,
        collectionId,
        id,
        { completed: !todoToUpdate.completed }
      );

      setTodos(
        todos.map((t) =>
          t.id === id ? { ...t, completed: !t.completed } : t
        )
      );
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      await databases.deleteDocument(databaseId, collectionId, id);
      setTodos(todos.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const incomplete = todos.filter((todo) => !todo.completed);
  const completed = todos.filter((todo) => todo.completed);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-purple-500 to-purple-200">
        <div className="bg-white shadow-lg rounded-3xl p-10 w-full max-w-xl text-center">
          <p>Loading todos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-purple-500 to-purple-200">
      <div className="bg-white shadow-lg rounded-3xl p-10 w-full max-w-xl">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">TODO LIST✔️</h1>

        {/* Input Field */}
        <div className="mb-6 flex">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            type="text"
            placeholder="Add a new task"
            className="flex-grow px-3 py-2 border rounded-l-lg focus:outline-none focus:ring-1 focus:ring-green-300"
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          />
          <button
            onClick={addTodo}
            className="bg-green-400 text-black px-4 py-2 rounded-r-lg hover:bg-green-300"
          >
            Add
          </button>
        </div>

        {/* Incomplete Tasks */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Incomplete Tasks</h2>
          {incomplete.length === 0 ? (
            <p className="text-sm text-gray-500">🎉 No pending tasks!</p>
          ) : (
            <ul className="space-y-2">
              {incomplete.map((todo) => (
                <li
                  key={todo.id}
                  className="flex items-center p-3 rounded-lg bg-slate-100 border border-gray-200"
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleComplete(todo.id)}
                    className="mr-2 h-5 w-5 text-blue-600"
                  />
                  <span className="flex-grow text-gray-800">{todo.text}</span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="ml-2 p-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Completed Tasks */}
        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Completed Tasks</h2>
          {completed.length === 0 ? (
            <p className="text-sm text-gray-500">📝 No completed tasks yet</p>
          ) : (
            <ul className="space-y-2">
              {completed.map((todo) => (
                <li
                  key={todo.id}
                  className="flex items-center p-3 rounded-lg bg-green-100 border border-gray-200"
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleComplete(todo.id)}
                    className="mr-2 h-5 w-5 text-blue-600"
                  />
                  <span className="flex-grow line-through text-gray-500">{todo.text}</span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="ml-2 p-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export default App;