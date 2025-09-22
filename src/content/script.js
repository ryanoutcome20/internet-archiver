function Output(text) {
    console.log("IA - > ", text);
}

async function getBody() {
    const data = await new Promise((resolve) => {
        chrome.storage.sync.get(['capture'], resolve);
    });

    return {
        url: window.location.href,
        capture_outlinks: data.capture?.includes('outlinks') ? "1" : "",
        capture_all: data.capture?.includes('all') ? "on" : "",
        capture_screenshot: data.capture?.includes('screenshot') ? "on" : "",
        disable_adblocker: data.capture?.includes('adblocker') ? "on" : "",
        "wm-save-mywebarchive": data.capture?.includes('mywarc') ? "on" : "",
        email_result: data.capture?.includes('email_results') ? "on" : "",
        wacz: data.capture?.includes('email_archive') ? "on" : ""
    };
}

async function getHeaders() {
    const data = await new Promise((resolve) => {
        chrome.storage.sync.get(['auth', 'key', 'secret'], resolve);
    });

    const headers = {
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "InternetArchiverExtension/1.0 (ryanoutcome20@gmail.com)"
    };

    if (data.auth) {
        headers["Authorization"] = `LOW ${data.key}:${data.secret}`;
    }

    return headers;
}

Output("Loaded");


(async () => {
    const enabled = await new Promise((resolve) => {
        chrome.storage.sync.get('enabled', resolve);
    });

    if (!enabled.enabled) {
        Output("Disabled!");
        return;
    }

    Output("Enabled!");

    (async () => {
        const headers = await getHeaders();
        const body = await getBody();

        chrome.runtime.sendMessage({
            action: "Archive",
            headers: headers,
            body: body
        }, () => {
            Output("Got worker response!");
        });
    })();
})();
