const mqtt = window.mqtt;
const CryptoJS = window.CryptoJS;

let client = null;
const BROKER_URL = 'wss://broker.emqx.io:8084/mqtt';

// ENCRYPT
function encrypt(text, key) {
    return CryptoJS.AES.encrypt(text, key).toString();
}

// DECRYPT
function decrypt(ciphertext, key) {
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, key);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
        console.error("Decryption failed. Wrong key?");
        return null;
    }
}

// SYNC PRIVADA POR P2P MQTT
export function initP2P(onTasksUpdate, onCalendarUpdate) {
    const roomId = getBoardId();
    if (!roomId || !mqtt) return;

    const topic = `selfboard/sync/${roomId}`;

    client = mqtt.connect(BROKER_URL, {
        keepalive: 60,
        reconnectPeriod: 1000,
        connectTimeout: 30 * 1000
    });

    client.on('connect', () => {
        console.log(`MQTT: Private sync active for room ${roomId}`);
        client.subscribe(topic);
        client.subscribe(`${topic}/request`);
        client.publish(`${topic}/request`, 'sync');
    });

    client.on('message', (receivedTopic, message) => {
        const payload = message.toString();
        const roomId = getBoardId();

        if (receivedTopic === topic) {
            try {
                // DECRYPT DATOS PRIVADOS
                const decrypted = decrypt(payload, roomId);
                if (!decrypted) return;

                const data = JSON.parse(decrypted);
                if (data.tasks) onTasksUpdate(data.tasks);
                if (data.calendar) onCalendarUpdate(data.calendar);
            } catch (e) {
                console.error("MQTT: Error processing private data", e);
            }
        }

        if (receivedTopic === `${topic}/request`) {
            const state = {
                tasks: JSON.parse(localStorage.getItem('tasks')) || [],
                calendar: JSON.parse(localStorage.getItem('calendar')) || {}
            };
            // ENCRYPT DATOS SALIENTES
            const encryptedState = encrypt(JSON.stringify(state), roomId);
            client.publish(topic, encryptedState);
        }
    });

    client.on('error', (err) => {
        console.warn("MQTT Error, retrying...", err);
    });
}

export function syncTasks(tasks) {
    const roomId = getBoardId();
    if (client && client.connected) {
        const data = JSON.stringify({ tasks });
        const encrypted = encrypt(data, roomId);
        client.publish(`selfboard/sync/${roomId}`, encrypted);
    }
}

export function syncCalendar(calendar) {
    const roomId = getBoardId();
    if (client && client.connected) {
        const data = JSON.stringify({ calendar });
        const encrypted = encrypt(data, roomId);
        client.publish(`selfboard/sync/${roomId}`, encrypted);
    }
}

export function getBoardId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('room') || localStorage.getItem('selfboard_room');
}

export function setBoardId(id) {
    if (id) localStorage.setItem('selfboard_room', id);
}
