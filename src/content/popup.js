function loadSettings() {
    chrome.storage.sync.get(['enabled', 'auth', 'key', 'secret', 'capture'], (data) => {
        if (chrome.runtime.lastError) {
            console.error("Storage error:", chrome.runtime.lastError);
            return;
        }

        document.getElementById('enabled').checked = !!data.enabled;
        document.getElementById('auth').checked = !!data.auth;
        document.getElementById('key').value = data.key || '';
        document.getElementById('secret').value = data.secret || '';

        document.querySelectorAll('input[name="capture"]').forEach(cb => cb.checked = false);

        if (data.capture && Array.isArray(data.capture)) {
            data.capture.forEach(val => {
                const cb = document.querySelector(`input[name="capture"][value="${val}"]`);
                if (cb) cb.checked = true;
            });
        }
    });
}

function saveSettings() {
    const enabled = document.getElementById('enabled').checked;
    const auth = document.getElementById('auth').checked;
    const key = document.getElementById('key').value;
    const secret = document.getElementById('secret').value;

    const capture = Array.from(document.querySelectorAll('input[name="capture"]:checked'))
                        .map(cb => cb.value);

    chrome.storage.sync.set({ enabled, auth, key, secret, capture }, () => {
        if (chrome.runtime.lastError) {
            console.error("Storage save error:", chrome.runtime.lastError);
            return;
        }
        document.getElementById('status').textContent = 'Settings saved.';
        setTimeout(() => { document.getElementById('status').textContent = ''; }, 2000);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    document.getElementById('saveBtn').addEventListener('click', saveSettings);
});