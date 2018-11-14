

const ROUTE_DESCRIPTION = 0;
const ROUTE_TAGS = 1;
const ROUTE_TARGET = 2;

const STATE_UNINITIALIZED = 0;
const STATE_EMPTY = 1;
const STATE_LOADED = 2;

var instances = {};
function getInstance(url) {
    if(!instances.hasOwnProperty(url.hostname) ) {
        instances[url.hostname] = {
            "routes": {},
            "index": new Index(),
            "state": STATE_UNINITIALIZED,
            "url": url
        };
    }
    instances[url.hostname].url = url;
    return instances[url.hostname];
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

function loadTurbo(url) {
    
    let headers = new Headers({"Accept": "application/json"});
    let init = {method: 'GET', headers};
    let request = new Request(url.protocol+"//"+url.hostname+"/navmap.json", init);

    fetch(request)
    .then(function(response){
        return response.json()
    })
    .then(function(response) {
        if(typeof response === "object" && response.hasOwnProperty("route") && typeof response.route === "object") {
            let routenames = Object.keys(response.route)
            activeInstance.routes = response.route
            for(let i in routenames) {
                let name = routenames[i]
                if(
                    response.route[name].length === 3 
                    && typeof response.route[name][ROUTE_DESCRIPTION] === "string"
                    && response.route[name][ROUTE_TAGS].constructor === Array
                    && typeof response.route[name][ROUTE_TARGET] === "string"
                ) {
                    activeInstance.index.add(name, response.route[name][ROUTE_DESCRIPTION])
                    let tags = response.route[name][ROUTE_TAGS]
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
    });
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
    
    let target = activeInstance.url.protocol + "//" 
                + activeInstance.url.hostname
                + activeInstance.routes[name][ROUTE_TARGET];
    
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
  
  
  

