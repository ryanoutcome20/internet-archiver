function Output(text) {
    console.log("IA - > ", text);
}

async function Archive(headers, body) {
    Output(headers);
    Output(body);

    try {
        const response = await fetch("https://web.archive.org/save/", {
            method: "POST",
            headers: headers,
            body: new URLSearchParams(body)
        });

        if (!response.ok) {
            throw new Error(`IA - > Response status: ${response.status}`);
        }

        const data = await response.json();
        Output(data);
        return data;
    } catch (err) {
        console.error(err);
        return { error: err.message };
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "Archive") {
        Archive(message.headers, message.body)
            .then(data => sendResponse(data))
            .catch(err => sendResponse({ error: err.message }));
        return true; // keep message channel open for async response
    }
});