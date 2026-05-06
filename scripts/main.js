import localWeather from "./weather.js";
import { loadTasks, handleRemoteTasks } from "./tasks.js";
import initCharts from "./charts.js";
import renderCalendar, { handleRemoteCalendar } from "./calendar.js";
import initShare from "./share.js";
import { initP2P } from "./sync.js";
import initShortcuts from "./shortcuts.js";

// 1. Initialize sharing/room logic FIRST
initShare();

// 2. Initialize P2P Polling
initP2P(handleRemoteTasks, handleRemoteCalendar);

// 3. Initialize other modules
localWeather();
loadTasks();
initCharts();
renderCalendar();
initShortcuts();
