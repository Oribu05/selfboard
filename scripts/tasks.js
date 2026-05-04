import { syncTasks } from './sync.js';

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

export function loadTasks() {
    tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    renderTasks();
}

export function handleRemoteTasks(remoteTasks) {
    if (JSON.stringify(remoteTasks) !== JSON.stringify(tasks)) {
        tasks = remoteTasks;
        localStorage.setItem("tasks", JSON.stringify(tasks));
        renderTasks();
    }
}

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    syncTasks(tasks);
    renderTasks();
}

function renderTasks() {
    const list = document.getElementById("todolist");
    if (!list) return;
    if (tasks.length === 0) {
        list.innerHTML = `<p class="text-white/40 text-sm text-center">No tasks yet</p>`;
        return;
    }
    list.innerHTML = "";
    tasks.forEach(task => {
        const div = document.createElement("div");
        div.className = "flex items-center justify-between bg-white/5 backdrop-blur border border-white/10 hover:bg-white/10 transition p-3 rounded-xl";
        div.innerHTML = `
            <div class="flex items-center gap-3">
                <input type="checkbox" ${task.done ? "checked" : ""} class="accent-blue-500 w-4 h-4 cursor-pointer"/>
                <span class="text-white/80 transition ${task.done ? "line-through opacity-40" : ""}">${task.text}</span>
            </div>
            <button class="text-red-400/80 hover:text-red-300 text-sm transition"><i class="ri-delete-bin-line"></i></button>
        `;
        div.querySelector("input").onchange = () => toggleTask(task.id);
        div.querySelector("button").onclick = () => removeTask(task.id);
        list.appendChild(div);
    });
}

export function addTask(text) {
    tasks.push({ id: Date.now().toString(), text, done: false });
    saveTasks();
}

export function removeTask(id) {
    tasks = tasks.filter(t => t.id != id);
    saveTasks();
}

export function toggleTask(id) {
    tasks = tasks.map(t => t.id == id ? { ...t, done: !t.done } : t);
    saveTasks();
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById("task-form");
    if (form) {
        form.onsubmit = (e) => {
            e.preventDefault();
            const input = document.getElementById("task-input");
            const value = input.value.trim();
            if (value) { addTask(value); input.value = ""; }
        };
    }
});

export function getTasksData() { return tasks; }
export function importTasksData(data) { if (Array.isArray(data)) { tasks = data; saveTasks(); } }