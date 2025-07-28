import React, { useState, useEffect } from "react";
import "./App.css";
import "./design-tokens.css";
import "./todo-ui.css";

/**
 * Applies a CSS class to the body for Add/Edit screens, to ensure Figma-specific AppBar backgrounds.
 */
function usePageBodyClass(page) {
  useEffect(() => {
    if (page === "add" || page === "edit") {
      document.body.classList.add(page);
    } else {
      document.body.classList.remove("add");
      document.body.classList.remove("edit");
    }
    return () => {
      document.body.classList.remove("add");
      document.body.classList.remove("edit");
    };
  }, [page]);
}

// Reusable Icons as React components (using image URLs for demo)
const ICONS = {
  check: "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/e166d4cd-2f0c-48bc-b3f3-520dc596d481",
  trash: "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/48b1bbc8-e7e9-4534-a627-0ac64160ea18",
  pencil: "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/5ccdf188-bfa5-4702-b083-b003e53ef470",
  plus: "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/7ca9cf78-76ad-4523-a5ae-9e507bc2e15e",
  calendar: "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/40c83010-6203-4ae0-ab3c-786d068b8495",
  playlist: "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/b462f76a-40bf-47a9-94e9-294145bc2e6d",
  tick: "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/ec24d3cb-0a13-4c83-8e05-d3de40a7bf73"
};

/* PUBLIC_INTERFACE
 * Root App for TODO UI — includes all screen states, Figma-inspired, minimalistic, with localStorage state.
 */
function App() {
  // ==== APP STATE ====
  const [page, setPage] = useState("list"); // list | add | edit | completed
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState("all"); // all | completed
  const [selectedTodo, setSelectedTodo] = useState(null);

  // Add Figma-specific body class for AppBar background (edit/add)
  usePageBodyClass(page);

  // ==== EFFECT: Persist and load from localStorage ====
  useEffect(() => {
    const storedTodos = window.localStorage.getItem("todos-list");
    if (storedTodos) setTodos(JSON.parse(storedTodos));
  }, []);
  useEffect(() => {
    window.localStorage.setItem("todos-list", JSON.stringify(todos));
  }, [todos]);

  // ==== ACTIONS ====
  // PUBLIC_INTERFACE
  function addTodo(newTask) {
    setTodos([
      ...todos,
      {
        id: Date.now(),
        title: newTask.title,
        detail: newTask.detail,
        completed: false
      }
    ]);
    setPage("list");
    setSelectedTodo(null);
    setFilter("all");
  }
  // PUBLIC_INTERFACE
  function updateTodo(id, updatedFields) {
    setTodos(
      todos.map((t) => (t.id === id ? { ...t, ...updatedFields } : t))
    );
    setPage("list");
    setSelectedTodo(null);
    setFilter("all");
  }
  // PUBLIC_INTERFACE
  function deleteTodo(id) {
    setTodos(todos.filter((t) => t.id !== id));
    setPage("list");
    setSelectedTodo(null);
    setFilter("all");
  }
  // PUBLIC_INTERFACE
  function markCompleted(id) {
    setTodos(
      todos.map((t) =>
        t.id === id ? { ...t, completed: true } : t
      )
    );
  }

  // Routing
  function gotoList() {
    setPage("list");
    setSelectedTodo(null);
    setFilter("all");
  }
  function gotoCompleted() {
    setPage("completed");
    setSelectedTodo(null);
    setFilter("completed");
  }
  function gotoEdit(todo) {
    setSelectedTodo(todo);
    setPage("edit");
  }
  function gotoAdd() {
    setPage("add");
    setSelectedTodo(null);
  }

  // Filtering
  const visibleTodos =
    filter === "all"
      ? todos
      : todos.filter((t) => t.completed);

  // ==== COMPONENTS ====

  // PUBLIC_INTERFACE
  function AppBar({ title, onBack, rightIcon }) {
    return (
      <div className="app-bar">
        {onBack && <button className="app-bar-back" onClick={onBack} aria-label="Back" />}
        <span className="app-bar-title">{title}</span>
        <span style={{ flex: 1 }} />
        {rightIcon && (
          <span>
            <img src={rightIcon} alt="" width={32} height={32} />
          </span>
        )}
      </div>
    );
  }

  // PUBLIC_INTERFACE
  function TabsBar() {
    return (
      <div className="tabs-bar">
        <button
          className={`tab${filter === "all" ? " active" : ""}`}
          onClick={gotoList}
        >
          <img
            className="tab-icon"
            src={ICONS.playlist}
            alt="All"
            width={30}
            height={30}
          />
          All
        </button>
        <button
          className={`tab${filter === "completed" ? " active" : ""}`}
          onClick={gotoCompleted}
        >
          <img
            className="tab-icon"
            src={ICONS.tick}
            alt="Completed"
            width={30}
            height={30}
          />
          Completed
        </button>
      </div>
    );
  }

  // PUBLIC_INTERFACE
  function StatusBar() {
    // Purely presentational (height 44px)
    return <div className="status-bar" />;
  }

  // PUBLIC_INTERFACE
  function TodoCard({ todo, onEdit, onDelete, onComplete }) {
    return (
      <div className={`todo-card${todo.completed ? " completed" : ""}`}>
        <div className="card-titles">
          <div className="todo-card-title">{todo.title}</div>
          <div className="todo-card-subtitle">{todo.detail}</div>
        </div>
        <div className="todo-actions">
          {!todo.completed && (
            <button
              className="todo-action-btn"
              title="Mark as completed"
              onClick={() => onComplete(todo.id)}
              aria-label="Mark Completed"
            >
              <img src={ICONS.check} alt="Check" width={25} height={25} />
            </button>
          )}
          <button
            className="todo-action-btn"
            title="Delete"
            onClick={() => onDelete(todo.id)}
            aria-label="Delete Task"
          >
            <img src={ICONS.trash} alt="Trash" width={25} height={25} />
          </button>
          {!todo.completed && (
            <button
              className="todo-action-btn"
              title="Edit"
              onClick={() => onEdit(todo)}
              aria-label="Edit Task"
            >
              <img src={ICONS.pencil} alt="Edit" width={25} height={25} />
            </button>
          )}
        </div>
      </div>
    );
  }

  // PUBLIC_INTERFACE
  function TodosListScreen() {
    return (
      <div className="todo-app-frame">
        <StatusBar />
        <AppBar title="TODO APP" rightIcon={ICONS.calendar} />
        <TabsBar />
        <div className="todo-list-section">
          {todos.length === 0 ? (
            <div style={{textAlign: 'center', color: 'var(--color-8b8787)', marginTop: 40 }}>No tasks yet.</div>
          ) : (
            (filter === "all"
              ? todos
              : todos.filter((t) => t.completed)
            ).map((t) => (
              <TodoCard
                key={t.id}
                todo={t}
                onEdit={gotoEdit}
                onDelete={deleteTodo}
                onComplete={markCompleted}
              />
            ))
          )}
        </div>
        <button
          className="fab-add-todo"
          onClick={gotoAdd}
          aria-label="Add ToDo"
        >
          <img className="fab-icon" src={ICONS.plus} alt="Plus" />
        </button>
      </div>
    );
  }

  // PUBLIC_INTERFACE
  function CompletedTasksScreen() {
    return (
      <div className="todo-app-frame">
        <StatusBar />
        <AppBar title="Completed Task" onBack={gotoList} />
        <div className="todo-list-section">
          {todos.filter((t) => t.completed).length === 0 ? (
            <div style={{textAlign: 'center', color: 'var(--color-8b8787)', marginTop: 40 }}>No completed tasks.</div>
          ) : (
            todos
              .filter((t) => t.completed)
              .map((t) => (
                <TodoCard
                  key={t.id}
                  todo={t}
                  onEdit={() => {}}
                  onDelete={deleteTodo}
                  onComplete={() => {}}
                />
              ))
          )}
        </div>
      </div>
    );
  }

  // PUBLIC_INTERFACE
  function AddTodoScreen() {
    // Minimal, controlled inputs
    const [title, setTitle] = useState("");
    const [detail, setDetail] = useState("");
    function handleSubmit(e) {
      e.preventDefault();
      if (!title.trim() || !detail.trim()) return;
      addTodo({ title: title.trim(), detail: detail.trim() });
      setTitle("");
      setDetail("");
    }
    return (
      <div className="todo-app-frame">
        <StatusBar />
        <AppBar title="Add Task" onBack={gotoList} />
        <form id="add-todo-form" autoComplete="off" onSubmit={handleSubmit}>
          <div className="input-section">
            <label className="input-label" htmlFor="todo-title">
              Title
            </label>
            <input
              className="input-underline"
              id="todo-title"
              name="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter to-do title"
              autoFocus
            />
          </div>
          <div className="input-section">
            <label className="input-label" htmlFor="todo-detail">
              Detail
            </label>
            <input
              className="input-underline"
              id="todo-detail"
              name="detail"
              type="text"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              required
              placeholder="Enter to-do details"
            />
          </div>
          <button className="primary-action-btn" type="submit">
            ADD
          </button>
        </form>
      </div>
    );
  }

  // PUBLIC_INTERFACE
  function EditTodoScreen() {
    // Only editable if selectedTodo exists
    const [title, setTitle] = useState(selectedTodo?.title || "");
    const [detail, setDetail] = useState(selectedTodo?.detail || "");

    useEffect(() => {
      setTitle(selectedTodo?.title || "");
      setDetail(selectedTodo?.detail || "");
    }, [selectedTodo]);

    if (!selectedTodo) return null;
    function handleSubmit(e) {
      e.preventDefault();
      if (!title.trim() || !detail.trim()) return;
      updateTodo(selectedTodo.id, {
        title: title.trim(),
        detail: detail.trim()
      });
      setTitle("");
      setDetail("");
    }
    function handleCancel() {
      setPage("list");
      setSelectedTodo(null);
    }
    return (
      <div className="todo-app-frame">
        <StatusBar />
        {/* AppBar with Figma edit style - class 'edit' to .app-bar for background */}
        <div className="app-bar edit">
          <button className="app-bar-back" onClick={gotoList} aria-label="Back" />
          <span className="app-bar-title">Edit Task</span>
        </div>
        <form id="edit-todo-form" onSubmit={handleSubmit} autoComplete="off">
          <div className="input-section">
            <label className="input-label" htmlFor="edit-title">
              Title
            </label>
            <input
              className="input-underline"
              id="edit-title"
              name="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter to-do title"
              autoFocus
            />
          </div>
          <div className="input-section">
            <label className="input-label" htmlFor="edit-detail">
              Detail
            </label>
            <input
              className="input-underline"
              id="edit-detail"
              name="detail"
              type="text"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              required
              placeholder="Enter to-do details"
            />
          </div>
          <div className="actions-row">
            <button
              className="primary-action-btn"
              type="submit"
              /* Will get Figma correct size/style from core CSS */
            >
              Update
            </button>
            <button
              className="primary-action-btn alt"
              type="button"
              onClick={handleCancel}
              /* .alt class for Figma Cancel button palette (light background, gray text) */
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  // --- Render according to Figma states ---
  if (page === "add") return <AddTodoScreen />;
  if (page === "edit") return <EditTodoScreen />;
  if (page === "completed") return <CompletedTasksScreen />;
  // Default = List
  return <TodosListScreen />;
}

export default App;
