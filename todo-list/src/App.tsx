import { useState, useEffect } from "react";
import { Client, Databases, ID } from "appwrite";

// Define Todo interface
interface Todo {
  $id?: string; // Appwrite document ID
  text: string;
  completed: boolean;
}

// Appwrite Setup
const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1") // ✅ Correct FRA endpoint
  .setProject("688871ed0006d8cf4667"); // ✅ Correct project ID

const databases = new Databases(client);
const databaseId = "68890a9a0023850de13a"; // ✅ Your Database ID
const collectionId = "68890aac0036253921de"; // ✅ Your Collection ID

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState<string>("");

  // ✅ Fetch Todos from Appwrite
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const res = await databases.listDocuments(databaseId, collectionId);
        const mappedTodos: Todo[] = res.documents.map((doc) => ({
          $id: doc.$id,
          text: doc.text as string,
          completed: doc.completed as boolean,
        }));
        setTodos(mappedTodos);
      } catch (err) {
        console.error("Error fetching todos:", err);
      }
    };
    fetchTodos();
  }, []);

  // ✅ Add a new Todo
  const addTodo = async () => {
    if (input.trim()) {
      try {
        const newDoc = await databases.createDocument(databaseId, collectionId, ID.unique(), {
          text: input,
          completed: false,
        });

        const newTodo: Todo = {
          $id: newDoc.$id,
          text: newDoc.text as string,
          completed: newDoc.completed as boolean,
        };

        setTodos((prev) => [...prev, newTodo]);
        setInput("");
      } catch (err) {
        console.error("Error adding todo:", err);
      }
    }
  };

  // ✅ Toggle completion
  const toggleComplete = async (id: string, current: boolean) => {
    try {
      const updatedDoc = await databases.updateDocument(databaseId, collectionId, id, {
        completed: !current,
      });

      setTodos((prev) =>
        prev.map((t) =>
          t.$id === id ? { ...t, completed: updatedDoc.completed as boolean } : t
        )
      );
    } catch (err) {
      console.error("Error updating todo:", err);
    }
  };

  // ✅ Delete Todo
  const deleteTodo = async (id: string) => {
    try {
      await databases.deleteDocument(databaseId, collectionId, id);
      setTodos((prev) => prev.filter((t) => t.$id !== id));
    } catch (err) {
      console.error("Error deleting todo:", err);
    }
  };

  const incomplete = todos.filter((todo) => !todo.completed);
  const completed = todos.filter((todo) => todo.completed);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-purple-500 to-purple-200">
      <div className="bg-white shadow-lg rounded-3xl p-10 w-full max-w-xl">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">TODO LIST ✔️</h1>

        {/* Input Field */}
        <div className="mb-6 flex">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            type="text"
            placeholder="Add a new task"
            className="flex-grow px-3 py-2 border rounded-l-lg focus:outline-none focus:ring-1 focus:ring-green-300"
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
                <li key={todo.$id} className="flex items-center p-3 rounded-lg bg-slate-100 border border-gray-200">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleComplete(todo.$id!, todo.completed)}
                    className="mr-2 h-5 w-5 text-blue-600"
                  />
                  <span className="flex-grow text-gray-800">{todo.text}</span>
                  <button
                    onClick={() => deleteTodo(todo.$id!)}
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
                <li key={todo.$id} className="flex items-center p-3 rounded-lg bg-green-100 border border-gray-200">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleComplete(todo.$id!, todo.completed)}
                    className="mr-2 h-5 w-5 text-blue-600"
                  />
                  <span className="flex-grow line-through text-gray-500">{todo.text}</span>
                  <button
                    onClick={() => deleteTodo(todo.$id!)}
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
