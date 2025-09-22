function loadSettings() {
    chrome.storage.sync.get(['enabled', 'auth', 'key', 'secret', 'capture', 'blacklist'], (data) => {
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

        const table = document.getElementById("blacklistTable").getElementsByTagName('tbody')[0];
        table.innerHTML = '';
        if (data.blacklist && Array.isArray(data.blacklist)) {
            data.blacklist.forEach(regex => {
                const newRow = table.insertRow();
                
                const cell1 = newRow.insertCell(0);

                cell1.textContent = regex;
                cell1.contentEditable = "true";

                const cell2 = newRow.insertCell(1);

                const delBtn = document.createElement("button");
                delBtn.textContent = "X";
                delBtn.className = "deleteBtn";
                delBtn.addEventListener("click", () => {
                    newRow.remove();
                });
                
                cell2.appendChild(delBtn);
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

    const blacklist = Array.from(document.querySelectorAll('#blacklistTable tbody tr td:first-child'))
                        .map(td => td.textContent.trim())
                        .filter(text => text); // skip empty

    chrome.storage.sync.set({ enabled, auth, key, secret, capture, blacklist }, () => {
        if (chrome.runtime.lastError) {
            console.error("Storage save error:", chrome.runtime.lastError);
            return;
        }
    });
}

function addRow() {
    var table = document.getElementById("blacklistTable").getElementsByTagName('tbody')[0];
    var regex = document.getElementById("regexInput").value.trim();

    if(regex) {
        var newRow = table.insertRow();
        var cell1 = newRow.insertCell(0);
        cell1.textContent = regex;
        cell1.contentEditable = "true";

        var cell2 = newRow.insertCell(1);
        var delBtn = document.createElement("button");
        delBtn.textContent = "X";
        delBtn.className = "deleteBtn";
        delBtn.onclick = function() { newRow.remove(); };
        cell2.appendChild(delBtn);

        document.getElementById("regexInput").value = "";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    document.getElementById('saveBtn').addEventListener('click', saveSettings);
    document.getElementById('blacklistBtn').addEventListener('click', addRow);

    document.querySelectorAll("#blacklistTable tbody tr").forEach(row => {
        var cell = row.insertCell(1);
        var delBtn = document.createElement("button");
        delBtn.textContent = "X";
        delBtn.className = "deleteBtn";
        delBtn.onclick = function() {
            row.remove();
        };
        cell.appendChild(delBtn);
    });
});