var instances = {};
function getInstance(url) {
    if(!instances.hasOwnProperty(url.host) ) {
        instances[url.host] = {
            "routes": {},
            "index": new Index(),
            "state": STATE_UNINITIALIZED,
            "url": url
        };
    }
    instances[url.host].url = url;
    return instances[url.host];
}

var activeInstance;
function setInstance(url) {
    activeInstance = getInstance(url);
    if(activeInstance.state === STATE_UNINITIALIZED) {
        loadTurbo(url);
    }

    browser.omnibox.setDefaultSuggestion({
        description: "type to search in "+Object.keys(activeInstance.routes).length+" documents"
    });
}

function loadIndex(navimap) {
    if(typeof navimap === "object" && navimap.hasOwnProperty("route") && typeof navimap.route === "object") {
        let routenames = Object.keys(navimap.route)
        activeInstance.routes = navimap.route
        for(let i in routenames) {
            let name = routenames[i]
            if(
                navimap.route[name].length === 3
                && typeof navimap.route[name][ROUTE_DESCRIPTION] === "string"
                && navimap.route[name][ROUTE_TAGS].constructor === Array
                && typeof navimap.route[name][ROUTE_TARGET] === "string"
            ) {
                activeInstance.index.add(name, navimap.route[name][ROUTE_DESCRIPTION])
                let tags = navimap.route[name][ROUTE_TAGS]
                for(let t in tags) {
                    let tag = tags[t]
                    if(typeof tag === "string") activeInstance.index.add(name , tag)
                }
            }
        }
        activeInstance.state = STATE_LOADED
    }
    else {
        activeInstance.state = STATE_EMPTY
    }
}

function loadTurbo(url) {

    let headers = new Headers({"Accept": "application/json"});
    let init = {method: 'GET', headers};
    let request = new Request(url.protocol+"//"+url.host+"/navmap.json", init);

    fetch(request)
    .then(function(response){
        return response.json()
    })
    .then(loadIndex);
}

browser.tabs.onUpdated.addListener(function(tabId, changeInfo, tabInfo) {
    let url = new URL(tabInfo.url)
    if(["http:","https:"].includes(url.protocol)) {
        setInstance(url);
    }
} , {properties:["attention"]});

browser.webNavigation.onCompleted.addListener(evt => {
    // Filter out any sub-frame related navigation event
    if (evt.frameId !== 0) {
      return;
    }
    setInstance(new URL(evt.url));
});

// Update the suggestions whenever the input is changed.
browser.omnibox.onInputChanged.addListener((text,suggest) => {
    let suggestions = [];
    if( activeInstance.state === STATE_LOADED )
    {
        let hits = Object.keys(activeInstance.index.search(text))
        for(i in hits) {
            let name = hits[i]
            suggestions.push({
                "content": name,
                "description": activeInstance.routes[name][ROUTE_DESCRIPTION]
            })
        }
    }
    suggest(suggestions);
    browser.omnibox.setDefaultSuggestion({
        description: "found in "+suggestions.length+" documents"
    });
});

// Open the page based on how the user clicks on a suggestion.
browser.omnibox.onInputEntered.addListener((name, disposition) => {
    if( activeInstance.state !== STATE_LOADED ) return;

    let target = activeInstance.url.protocol + "//" +
                activeInstance.url.host +
                activeInstance.routes[name][ROUTE_TARGET];

    switch (disposition) {
        case "currentTab":
            browser.tabs.update({"url":target});
            break;
        case "newForegroundTab":
            // browser.tabs.create({url});
            break;
        case "newBackgroundTab":
            // browser.tabs.create({url, active: false});
            break;
    }
});



browser.browserAction.onClicked.addListener(() => {
    browser.tabs.create({
        "url": "/views/remotes.html"
    });
});

browser.commands.onCommand.addListener(function(command) {
  if (command == "toggle-feature") {
  	var querying = browser.tabs.query({currentWindow: true, active:true});
	querying.then(
		(tabs) => {
			if(!tabs.length) return;
			let t = tabs[0];
			browser.tabs.sendMessage(
				t.id,
				{"greeting": "hello"}
			);
		},
		(t) => {  console.log(t); }
	);
  }
});

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
	let suggestions = [];
    if( activeInstance.state === STATE_LOADED )
    {
        let hits = Object.keys(activeInstance.index.search(request.search));
        for(let i in hits) {
            let name = hits[i];
            suggestions.push({
                "content": name,
                "description": activeInstance.routes[name][ROUTE_DESCRIPTION],
                "target": activeInstance.routes[name][ROUTE_TARGET]
            });
        }
    }
    sendResponse(suggestions);

});