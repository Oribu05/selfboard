function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const list = document.getElementById("todolist");

    if (!list) return;

    if (tasks.length === 0) {
        list.innerHTML = `
            <p class="text-white/40 text-sm text-center">
                No tasks yet
            </p>`;
        return;
    }

    list.innerHTML = "";

    tasks.forEach(task => {
        const div = document.createElement("div");

        div.className = `
    flex items-center justify-between
    bg-white/5
    backdrop-blur
    border border-white/10
    hover:bg-white/10
    transition p-3 rounded-xl
`;

        div.innerHTML = `
    <div class="flex items-center gap-3">

        <input type="checkbox"
            ${task.done ? "checked" : ""}
            class="accent-blue-500 w-4 h-4"
        />

        <span class="text-white/80 transition
            ${task.done ? "line-through opacity-40" : ""}">
            ${task.text}
        </span>
    </div>

    <button class="text-red-400/80 hover:text-red-300 text-sm transition">
        Delete
    </button>
`;

        // checkbox toggle
        const checkbox = div.querySelector("input");
        checkbox.addEventListener("change", () => toggleTask(task.id));

        // delete
        const btn = div.querySelector("button");
        btn.addEventListener("click", () => removeTask(task.id));

        list.appendChild(div);
    });
}
function addTask(text) {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    tasks.push({
        id: Date.now(),
        text,
        done: false
    });

    localStorage.setItem("tasks", JSON.stringify(tasks));
    loadTasks();
}
function removeTask(id) {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    const updated = tasks.filter(t => t.id !== id);

    localStorage.setItem("tasks", JSON.stringify(updated));
    loadTasks();
}
function toggleTask(id) {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    const updated = tasks.map(t => {
        if (t.id === id) {
            return { ...t, done: !t.done };
        }
        return t;
    });

    localStorage.setItem("tasks", JSON.stringify(updated));
    loadTasks();
}
document.getElementById("task-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const input = document.getElementById("task-input");
    const value = input.value.trim();

    if (!value) return;

    addTask(value);
    input.value = "";
});

export {
    loadTasks,
    addTask,
    removeTask,
    toggleTask
};