function Output(text) {
    console.log("IA - > ", text);
}

async function checkBlacklist(blacklist) {
    Output(blacklist)
    
    blacklist.forEach(inputstring => {
        // https://stackoverflow.com/questions/874709/converting-user-input-string-to-regular-expression
        var flags = inputstring.replace(/.*\/([gimy]*)$/, '$1');
        var pattern = inputstring.replace(new RegExp('^/(.*?)/'+flags+'$'), '$1');
        var regex = new RegExp(pattern, flags);

        if (regex.test(window.location.href)) {
            return true;
        } else {
            Output(`No match: ${regex}`)
        }
    })

    return false;
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
    const data = await new Promise((resolve) => {
        chrome.storage.sync.get(['enabled', 'blacklist'], resolve);
    });

    if (checkBlacklist(data.blacklist)) {
        Output("Blacklisted!");
        return;
    }

    if (!data.enabled) {
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
