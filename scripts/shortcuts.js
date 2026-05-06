let shortcuts = JSON.parse(localStorage.getItem("shortcuts")) || [
    { id: '1', name: 'Google', url: 'https://google.com', icon: 'ri-google-fill' },
    { id: '2', name: 'GitHub', url: 'https://github.com', icon: 'ri-github-fill' }
];

const availableIcons = [
    { name: 'Link', class: 'ri-link' },
    { name: 'External', class: 'ri-external-link-line' },
    { name: 'Google', class: 'ri-google-fill' },
    { name: 'GitHub', class: 'ri-github-fill' },
    { name: 'YouTube', class: 'ri-youtube-fill' },
    { name: 'Twitter / X', class: 'ri-twitter-x-fill' },
    { name: 'Discord', class: 'ri-discord-fill' },
    { name: 'Twitch', class: 'ri-twitch-fill' },
    { name: 'Reddit', class: 'ri-reddit-line' },
    { name: 'Instagram', class: 'ri-instagram-line' },
    { name: 'Facebook', class: 'ri-facebook-box-fill' },
    { name: 'Spotify', class: 'ri-spotify-line' },
    { name: 'Mail', class: 'ri-mail-line' },
    { name: 'Chat', class: 'ri-chat-3-line' },
    { name: 'Code', class: 'ri-code-s-slash-line' },
    { name: 'Terminal', class: 'ri-terminal-box-line' },
    { name: 'News', class: 'ri-newspaper-line' },
    { name: 'Home', class: 'ri-home-4-line' },
    { name: 'Settings', class: 'ri-settings-4-line' },
    { name: 'Search', class: 'ri-search-line' },
    { name: 'User', class: 'ri-user-line' },
    { name: 'Star', class: 'ri-star-line' },
    { name: 'Global', class: 'ri-global-line' }
];

export default function initShortcuts() {
    renderShortcuts();
    setupMobileToggle();
}

function setupMobileToggle() {
    const toggleBtn = document.getElementById("toggleShortcuts");
    const sidebar = document.getElementById("shortcuts");

    if (toggleBtn && sidebar) {
        toggleBtn.onclick = (e) => {
            e.stopPropagation();
            sidebar.classList.toggle("-translate-x-full");

            const icon = toggleBtn.querySelector("i");
            if (sidebar.classList.contains("-translate-x-full")) {
                icon.className = "ri-menu-2-line";
            } else {
                icon.className = "ri-close-line";
            }
        };
        document.addEventListener("click", (e) => {
            if (window.innerWidth < 768 &&
                !sidebar.contains(e.target) &&
                !toggleBtn.contains(e.target) &&
                !sidebar.classList.contains("-translate-x-full")) {
                sidebar.classList.add("-translate-x-full");
                toggleBtn.querySelector("i").className = "ri-menu-2-line";
            }
        });
    }
}

function openAddModal() {
    const modal = document.createElement("div");
    modal.className = "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200";

    const iconOptions = availableIcons.map(icon =>
        `<option value="${icon.class}">${icon.name}</option>`
    ).join('');

    modal.innerHTML = `
        <div class="bg-slate-900 border border-white/10 p-8 rounded-3xl w-full max-w-sm shadow-2xl animate-in zoom-in duration-300">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-bold text-white">Add Shortcut</h3>
                <button id="close-modal" class="text-white/40 hover:text-white transition"><i class="ri-close-line text-xl"></i></button>
            </div>

            <div class="space-y-4">
                <div>
                    <label class="text-[10px] uppercase text-white/40 font-bold mb-1 block">Shortcut Name</label>
                    <input id="short-name" type="text" placeholder="e.g. My Site" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50 transition">
                </div>
                <div>
                    <label class="text-[10px] uppercase text-white/40 font-bold mb-1 block">URL</label>
                    <input id="short-url" type="text" placeholder="https://..." class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50 transition">
                </div>
                <div>
                    <label class="text-[10px] uppercase text-white/40 font-bold mb-1 block">Select Icon</label>
                    <div class="flex gap-2">
                        <div class="relative flex-1">
                            <select id="short-icon" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50 transition appearance-none cursor-pointer pr-10">
                                ${iconOptions}
                            </select>
                            <i class="ri-arrow-down-s-line absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"></i>
                        </div>
                        <div class="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center shrink-0">
                            <i id="icon-preview" class="ri-link text-xl text-white/70"></i>
                        </div>
                    </div>
                </div>
                
                <button id="save-shortcut" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition mt-2 shadow-lg shadow-blue-600/20">
                    SAVE SHORTCUT
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector("#close-modal");
    const saveBtn = modal.querySelector("#save-shortcut");
    const iconSelect = modal.querySelector("#short-icon");
    const iconPreview = modal.querySelector("#icon-preview");

    iconPreview.className = `${iconSelect.value} text-xl text-white/70`;

    iconSelect.onchange = (e) => {
        iconPreview.className = `${e.target.value} text-xl text-white/70`;
    };

    const closeModal = () => {
        modal.classList.add("animate-out", "fade-out");
        setTimeout(() => modal.remove(), 150);
    };

    closeBtn.onclick = closeModal;
    modal.onclick = (e) => { if (e.target === modal) closeModal(); };

    saveBtn.onclick = () => {
        const name = modal.querySelector("#short-name").value.trim();
        const url = modal.querySelector("#short-url").value.trim();
        const icon = iconSelect.value;

        if (name && url) {
            addShortcut(name, url, icon);
            closeModal();
        } else {
            if (!name) modal.querySelector("#short-name").classList.add("border-red-500/50");
            if (!url) modal.querySelector("#short-url").classList.add("border-red-500/50");
        }
    };
}

function renderShortcuts() {
    const list = document.getElementById("shortcuts-list");
    if (!list) return;

    list.innerHTML = `
        <div class="flex justify-center mb-6">
            <button id="openNav" class="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 shadow-lg shadow-black/20">
                <i class="ri-add-line text-2xl"></i>
            </button>
        </div>
    `;

    shortcuts.forEach(shortcut => {
        const div = document.createElement("div");
        div.className = "group relative flex justify-center mb-4 px-2";
        div.innerHTML = `
            <a href="${shortcut.url}" target="_blank" title="${shortcut.name}" 
               class="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 hover:bg-blue-500/20 hover:border-blue-500/40 transition-all duration-300 shadow-lg shadow-black/20">
                <i class="${shortcut.icon || 'ri-link'} text-2xl text-white/70 group-hover:text-blue-400 transition-colors"></i>
            </a>
            <button class="delete-shortcut absolute top-0 right-1 -mt-1 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg z-10">
                <i class="ri-close-line"></i>
            </button>
        `;

        div.querySelector(".delete-shortcut").onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            removeShortcut(shortcut.id);
        };

        list.appendChild(div);
    });

    const openBtn = document.getElementById("openNav");
    if (openBtn) {
        openBtn.onclick = openAddModal;
    }
}

function addShortcut(name, url, icon) {
    shortcuts.push({
        id: Date.now().toString(),
        name,
        url: url.startsWith('http') ? url : `https://${url}`,
        icon
    });
    saveShortcuts();
}

function removeShortcut(id) {
    shortcuts = shortcuts.filter(s => s.id !== id);
    saveShortcuts();
}

function saveShortcuts() {
    localStorage.setItem("shortcuts", JSON.stringify(shortcuts));
    renderShortcuts();
}
