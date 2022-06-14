let blockedHosts = ["example.com", "example.org"];

browser.runtime.onInstalled.addListener(details => {
    browser.storage.local.set({
        blockedHosts: blockedHosts
    });
});

browser.storage.local.get(data => {
    if (data.blockedHosts) {
        blockedHosts = data.blockedHosts;
    }
});

browser.storage.onChanged.addListener(changeData => {
    blockedHosts = changeData.blockedHosts.newValue;
});

browser.proxy.onRequest.addListener(handleProxyRequest, { urls: ["<all_urls>"] });

// Function that takes a value to check whether the value is in the blockedHosts Array
function inBlockedHosts(value) {
    // The indexOf() method returns -1 if the value is not found
    // If the indexOf() method did not returns -1, the value is found in the inBlockedHosts Array
    // Reference: https://www.w3schools.com/jsref/jsref_indexof.asp
    if (blockedHosts.indexOf(value) != -1) {
        return true; 
    }
}

function handleProxyRequest(requestInfo) {
    const url = new URL(requestInfo.url);

    // split() method to split the url into an array of substrings
    // split to smaller pieces, separated by "."
    let splitUrl = url.hostname.split(".");
    // smaller pieces as value into the inBlockedHosts function using some() method
    // some() method checks if splitUrl array elements pass the inBlockedHosts function
    let checkSplitUrl = splitUrl.some(inBlockedHosts);

    // if the smaller pieces is also in blockedHosts Array, proxy
    if (blockedHosts.indexOf(url.hostname) != -1 || checkSplitUrl === true) {
        console.log(`Proxying: ${url.hostname}`);
        return { type: "http", host: "127.0.0.1", port: 65535 };
    }
    
    return { type: "direct" };
}

browser.proxy.onError.addListener(error => {
    console.error(`Proxy error: ${error.message}`);
});

