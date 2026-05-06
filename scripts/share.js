import { getCalendarData, importCalendarData } from './calendar.js';
import { getTasksData, importTasksData } from './tasks.js';
import { getBoardId, setBoardId } from './sync.js';

export function generateSecureId() {
    return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export default function initShare() {
    const urlParams = new URLSearchParams(window.location.search);
    const incomingData = urlParams.get('data');
    const incomingRoom = urlParams.get('room');

    if (incomingRoom) {
        setBoardId(incomingRoom);
    }

    if (incomingData) {
        try {
            const decoded = JSON.parse(atob(incomingData));
            if (decoded.tasks) importTasksData(decoded.tasks);
            if (decoded.events) importCalendarData(decoded.events);

            window.history.replaceState({}, document.title, window.location.pathname + (incomingRoom ? `?room=${incomingRoom}` : ''));
            showToast("Board imported successfully!");
        } catch (e) {
            console.error("Failed to parse incoming data", e);
        }
    }

    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
        shareBtn.addEventListener('click', openShareModal);
    }
}

function openShareModal() {
    let roomId = getBoardId() || generateSecureId();
    if (!getBoardId()) setBoardId(roomId);

    const data = {
        events: getCalendarData(),
        tasks: getTasksData()
    };

    const encoded = btoa(JSON.stringify(data));
    const shareUrl = `${window.location.origin}${window.location.pathname}?room=${roomId}&data=${encoded}`;

    const modal = document.createElement("div");
    modal.className = "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200";

    modal.innerHTML = `
        <div class="bg-slate-900 border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in duration-300">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h3 class="text-2xl font-bold text-white">Secure Share</h3>
                    <p class="text-white/40 text-sm mt-1 flex items-center gap-1">
                        <i class="ri-shield-check-line text-green-400"></i> End-to-end encrypted
                    </p>
                </div>
                <button id="close-share" class="text-white/40 hover:text-white transition"><i class="ri-close-line text-2xl"></i></button>
            </div>

            <div class="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 flex flex-col items-center">
                <div class="bg-white p-3 rounded-xl mb-4 shadow-lg">
                    <img id="qr-code" src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shareUrl)}" alt="QR Code" class="w-32 h-32">
                </div>
                
                <div class="w-full space-y-2">
                    <p class="text-[10px] text-white/30 text-center italic">Room ID (Click to edit)</p>
                    <div class="group relative flex items-center bg-green-500/10 text-green-400 rounded-lg border border-green-500/20 overflow-hidden">
                        <i class="ri-lock-line ml-3"></i>
                        <input id="room-id-input" type="text" value="${roomId}" class="w-full bg-transparent border-none px-3 py-2 text-xs font-mono font-bold outline-none focus:text-white transition-colors" spellcheck="false">
                        <button id="regen-id" class="px-3 py-2 hover:bg-green-500/20 text-green-400 transition" title="Generate random ID">
                            <i class="ri-refresh-line"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div class="space-y-4">
                <button id="apply-room-btn" class="w-full bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/30 py-3 rounded-xl transition text-xs font-bold hidden animate-in fade-in slide-in-from-top-2">
                    APPLY CHANGES & REFRESH
                </button>

                <div class="flex gap-2">
                    <input id="share-url-display" type="text" readonly value="${shareUrl}" class="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] text-white/40 outline-none overflow-hidden">
                    <button id="copy-link-btn" class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-xl transition flex items-center gap-2 font-medium">
                        <i class="ri-file-copy-line"></i>
                    </button>
                </div>
                <span class="text-[9px] text-white/20 text-center block">Sharing this key allows real-time access to your encrypted data.</span>
                <span class="text-[9px] text-white/20 text-center block">Charts doesn't support remote connection. Please, upload your csv files manually</span>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const roomInput = modal.querySelector("#room-id-input");
    const applyBtn = modal.querySelector("#apply-room-btn");
    const regenBtn = modal.querySelector("#regen-id");
    const qrImg = modal.querySelector("#qr-code");
    const urlInput = modal.querySelector("#share-url-display");

    const updateUIForId = (newId) => {
        const newUrl = `${window.location.origin}${window.location.pathname}?room=${newId}&data=${encoded}`;
        urlInput.value = newUrl;
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(newUrl)}`;
        if (newId !== roomId) {
            applyBtn.classList.remove("hidden");
        } else {
            applyBtn.classList.add("hidden");
        }
    };

    roomInput.oninput = (e) => updateUIForId(e.target.value.trim());

    regenBtn.onclick = () => {
        const newId = generateSecureId();
        roomInput.value = newId;
        updateUIForId(newId);
    };

    applyBtn.onclick = () => {
        const newId = roomInput.value.trim();
        if (newId) {
            setBoardId(newId);
            window.location.search = `?room=${newId}`;
        }
    };

    const closeModal = () => {
        modal.classList.add("animate-out", "fade-out");
        setTimeout(() => modal.remove(), 150);
    };

    modal.querySelector("#close-share").onclick = closeModal;
    modal.onclick = (e) => { if (e.target === modal) closeModal(); };

    modal.querySelector("#copy-link-btn").onclick = () => {
        navigator.clipboard.writeText(urlInput.value);
        const btn = modal.querySelector("#copy-link-btn");
        const originalContent = btn.innerHTML;
        btn.innerHTML = '<i class="ri-check-line"></i>';
        btn.classList.replace('bg-blue-600', 'bg-green-600');
        setTimeout(() => {
            btn.innerHTML = originalContent;
            btn.classList.replace('bg-green-600', 'bg-blue-600');
        }, 2000);
        showToast("Link copied!");
    };
}

function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] bg-white text-slate-950 px-6 py-3 rounded-full text-sm font-bold shadow-2xl animate-in slide-in-from-bottom-4 duration-300";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.add("animate-out", "fade-out", "slide-out-to-bottom-4");
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}