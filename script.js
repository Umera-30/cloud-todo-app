const API_BASE_URL = "https://i1ynvvc6x3.execute-api.ap-south-1.amazonaws.com/prod";

let filter = "all";

// ✅ Set filter (All / Active / Completed)
function setFilter(f) {
  filter = f;

  document.querySelectorAll(".filter-btn").forEach(btn => 
    btn.classList.remove("active")
  );

  document.querySelector(`button[onclick="setFilter('${f}')"]`)
    .classList.add("active");

  fetchTodos();
}

// ✅ Fetch all todos from backend
async function fetchTodos() {
  try {
    const res = await fetch(`${API_BASE_URL}/todos`);
    const json = await res.json();

    const todos = Array.isArray(json) ? json : [];
    renderTodos(todos);
  } catch (e) {
    console.error("fetchTodos error:", e);
  }
}

// ✅ Render todos in UI
function renderTodos(allTodos) {
  const visible = allTodos.filter(todo => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const list = document.getElementById("todoList");
  list.innerHTML = "";

  visible.forEach(todo => {
    const li = document.createElement("li");
    li.className =
      "flex items-center justify-between bg-gray-50 p-4 rounded-xl shadow-sm";

    // ✅ Left side (checkbox + text)
    const left = document.createElement("div");
    left.className = "flex items-center gap-3 flex-grow";

    // ✅ Checkbox toggle
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = !!todo.completed;
    cb.className = "h-5 w-5";
    cb.onchange = () => toggleComplete(todo.id, cb.checked);

    // ✅ Editable text
    const input = document.createElement("input");
    input.value = todo.text;
    input.id = `edit-${todo.id}`;
    input.className =
      "flex-grow bg-transparent border-none focus:outline-none text-lg " +
      (todo.completed ? "line-through text-gray-400" : "");
    input.onblur = () => saveEdit(todo.id);

    left.appendChild(cb);
    left.appendChild(input);

    // ✅ Delete button
    const del = document.createElement("button");
    del.textContent = "Delete";
    del.className =
      "bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600";
    del.onclick = () => deleteTodo(todo.id);

    li.appendChild(left);
    li.appendChild(del);

    list.appendChild(li);
  });
}

// ✅ Add a new todo
async function addTodo() {
  const textEl = document.getElementById("todoInput");
  const text = textEl.value.trim();

  if (!text) return;

  await fetch(`${API_BASE_URL}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });

  textEl.value = "";
  fetchTodos();
}

// ✅ Toggle completed checkbox
async function toggleComplete(id, completed) {
  try {
    await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed })
    });

    fetchTodos();
  } catch (e) {
    console.error("toggleComplete error:", e);
  }
}

// ✅ Save edited text
async function saveEdit(id) {
  const newText = document.getElementById(`edit-${id}`).value.trim();

  await fetch(`${API_BASE_URL}/todos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: newText })
  });

  fetchTodos();
}

// ✅ Delete todo
async function deleteTodo(id) {
  await fetch(`${API_BASE_URL}/todos/${id}`, {
    method: "DELETE"
  });

  fetchTodos();
}

// ✅ Initial load
fetchTodos();
