let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function getStoredEvents() {
    return JSON.parse(localStorage.getItem("calendar")) || {};
}

function saveEvents(events) {
    localStorage.setItem("calendar", JSON.stringify(events));
}

function formatDate(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function renderCalendar() {
    const calendarEl = document.getElementById("calendar");
    if (!calendarEl) return;

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const now = new Date();

    const events = getStoredEvents();

    calendarEl.innerHTML = "";

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const header = document.createElement("div");
    header.className = "col-span-7 flex justify-between items-center mb-3";
    header.innerHTML = `
        <div class="flex gap-2 items-center">
            <button id="prevMonth" class="text-white/40 hover:text-white transition"><i class="ri-arrow-left-s-line text-lg"></i></button>
            <button id="nextMonth" class="text-white/40 hover:text-white transition"><i class="ri-arrow-right-s-line text-lg"></i></button>
        </div>
        <span class="text-xs font-bold text-white/80">${monthNames[currentMonth]} ${currentYear}</span>
        <button id="todayBtn" class="text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded-md hover:bg-white/10 transition text-white/60">Today</button>
    `;
    calendarEl.appendChild(header);

    calendarEl.className = "grid grid-cols-7 gap-1 h-full content-start";

    // Nav Listeners
    header.querySelector("#prevMonth").onclick = () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    };
    header.querySelector("#nextMonth").onclick = () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    };
    header.querySelector("#todayBtn").onclick = () => {
        currentMonth = now.getMonth();
        currentYear = now.getFullYear();
        renderCalendar();
    };

    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    dayNames.forEach(name => {
        const dayHeader = document.createElement("div");
        dayHeader.className = "text-[10px] text-white/30 text-center font-bold mb-1";
        dayHeader.textContent = name;
        calendarEl.appendChild(dayHeader);
    });

    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement("div");
        calendarEl.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = formatDate(currentYear, currentMonth, day);
        const dayEvents = events[dateKey] || [];
        const isToday = now.getDate() === day && now.getMonth() === currentMonth && now.getFullYear() === currentYear;

        const div = document.createElement("div");

        div.className = `
            p-1 rounded-md bg-white/5 backdrop-blur
            border ${isToday ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/5'}
            hover:bg-white/10 cursor-pointer
            text-[10px] flex flex-col gap-0.5 min-h-[35px]
            transition-colors overflow-hidden
        `;

        const eventsHtml = dayEvents.length > 0
            ? `<div class="mt-auto">
                <div class="w-1 h-1 rounded-full ${isToday ? 'bg-blue-400' : 'bg-white/20'} mx-auto mb-0.5"></div>
               </div>`
            : "";

        div.innerHTML = `
            <div class="text-center ${isToday ? 'font-bold text-blue-400' : 'text-white/60'}">${day}</div>
            ${eventsHtml}
        `;

        div.addEventListener("click", () => openModal(dateKey, day));

        calendarEl.appendChild(div);
    }
}
export function getCalendarData() {
    return getStoredEvents();
}

export function importCalendarData(data) {
    if (data && typeof data === 'object') {
        saveEvents(data);
        renderCalendar();
    }
}

function openModal(dateKey, dayNumber) {
    const events = getStoredEvents();
    const dayEvents = events[dateKey] || [];

    const modal = document.createElement("div");
    modal.className = "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm";

    modal.innerHTML = `
        <div class="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl animate-in zoom-in duration-200">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-bold">Day ${dayNumber}</h3>
                <button id="close-modal" class="text-white/40 hover:text-white transition"><i class="ri-close-line text-2xl"></i></button>
            </div>

            <div id="modal-events-list" class="space-y-2 mb-6 max-h-[200px] overflow-y-auto pr-2">
                ${dayEvents.length > 0
            ? dayEvents.map((e, i) => `
                        <div class="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5 group">
                            <span class="text-white/80 text-sm">${e}</span>
                            <button class="delete-event text-red-400/0 group-hover:text-red-400/80 transition" data-index="${i}"><i class="ri-delete-bin-line"></i></button>
                        </div>
                    `).join("")
            : '<p class="text-white/30 text-sm text-center py-4">No events</p>'
        }
            </div>

            <div class="flex gap-2">
                <input id="new-event-input" type="text" placeholder="New event..." class="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500/50 transition">
                <button id="add-event-btn" class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition font-medium">Add</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const input = modal.querySelector("#new-event-input");
    input.focus();

    const closeModal = () => {
        modal.classList.add("animate-out", "zoom-out");
        setTimeout(() => modal.remove(), 150);
    };

    modal.querySelector("#close-modal").onclick = closeModal;
    modal.onclick = (e) => { if (e.target === modal) closeModal(); };

    modal.querySelector("#add-event-btn").onclick = () => {
        const text = input.value.trim();
        if (text) {
            if (!events[dateKey]) events[dateKey] = [];
            events[dateKey].push(text);
            saveEvents(events);
            renderCalendar();
            closeModal();
            openModal(dateKey, dayNumber);
        }
    };

    modal.querySelectorAll(".delete-event").forEach(btn => {
        btn.onclick = () => {
            const index = btn.dataset.index;
            events[dateKey].splice(index, 1);
            if (events[dateKey].length === 0) delete events[dateKey];
            saveEvents(events);
            renderCalendar();
            closeModal();
            openModal(dateKey, dayNumber);
        };
    });
}

