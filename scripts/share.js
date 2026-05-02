import { getCalendarData, importCalendarData } from './calendar.js';
import { getTasksData, importTasksData } from './tasks.js';

export default function initShare() {
    const urlParams = new URLSearchParams(window.location.search);
    const incomingData = urlParams.get('data');

    if (incomingData) {
        try {
            const decoded = JSON.parse(atob(incomingData));
            if (decoded.tasks) importTasksData(decoded.tasks);
            if (decoded.events) importCalendarData(decoded.events);

            window.history.replaceState({}, document.title, window.location.pathname);
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
    const data = {
        events: getCalendarData(),
        tasks: getTasksData()
    };

    const encoded = btoa(JSON.stringify(data));
    const shareUrl = `${window.location.origin}${window.location.pathname}?data=${encoded}`;

    const modal = document.createElement("div");
    modal.className = "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200";

    modal.innerHTML = `
        <div class="bg-slate-900 border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in duration-300">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h3 class="text-2xl font-bold text-white">Share Board</h3>
                    <p class="text-white/40 text-sm mt-1">Transfer your tasks and calendar</p>
                </div>
                <button id="close-share" class="text-white/40 hover:text-white transition"><i class="ri-close-line text-2xl"></i></button>
            </div>

            <div class="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 flex flex-col items-center">
                <div class="bg-white p-3 rounded-xl mb-4 shadow-lg">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shareUrl)}" alt="QR Code" class="w-32 h-32">
                </div>
                <p class="text-xs text-white/30 text-center">Scan this QR code with another device to mirror your dashboard</p>
              <div class="bg-yellow-50 text-sm text-yellow-800 rounded-lg mt-4  p-4 dark:bg-yellow-300/20 dark:text-yellow-100" role="alert" tabindex="-1" aria-labelledby="hs-with-description-label">
                <div class="mt-1 text-sm text-yellow-800 dark:text-yellow-100">
                    Graphs are not included in this share. You need to reupload the graphs files in the new device.
                </div>

</div>
                </div>

            <div class="space-y-3">
                <p class="text-xs font-medium text-white/50 uppercase tracking-wider ml-1">Or copy link</p>
                <div class="flex gap-2">
                    <input type="text" readonly value="${shareUrl}" class="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white/60 outline-none">
                    <button id="copy-link-btn" class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-xl transition flex items-center gap-2 font-medium">
                        <i class="ri-file-copy-line"></i>
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const closeModal = () => {
        modal.classList.add("animate-out", "fade-out");
        setTimeout(() => modal.remove(), 150);
    };

    modal.querySelector("#close-share").onclick = closeModal;
    modal.onclick = (e) => { if (e.target === modal) closeModal(); };

    modal.querySelector("#copy-link-btn").onclick = () => {
        navigator.clipboard.writeText(shareUrl);
        const btn = modal.querySelector("#copy-link-btn");
        const originalContent = btn.innerHTML;
        btn.innerHTML = '<i class="ri-check-line"></i>';
        btn.classList.replace('bg-blue-600', 'bg-green-600');

        setTimeout(() => {
            btn.innerHTML = originalContent;
            btn.classList.replace('bg-green-600', 'bg-blue-600');
        }, 2000);

        showToast("Link copied to clipboard!");
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