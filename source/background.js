

const ROUTE_DESCRIPTION = 0;
const ROUTE_TAGS = 1;
const ROUTE_TARGET = 2;

const STATE_UNINITIALIZED = 0;
const STATE_EMPTY = 1;
const STATE_LOADED = 2;

var instances = {};
function getInstance(hostname) {
    if(!instances.hasOwnProperty(hostname) ) {
        instances[hostname] = {
            "routes": {},
            "index": new Index(),
            "state": STATE_UNINITIALIZED
        };
    }
    return instances[hostname];
}

browser.webNavigation.onCompleted.addListener(evt => {
    // Filter out any sub-frame related navigation event
    if (evt.frameId !== 0) {
      return;
    }

    const url = new URL(evt.url);
    let instance = getInstance(url.hostname);
    if( instance.state !== STATE_UNINITIALIZED ) return;
    
    instance.state = STATE_EMPTY
    
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
            instance.routes = response.route
            for(let i in routenames) {
                let name = routenames[i]
                if(
                    response.route[name].length === 3 
                    && typeof response.route[name][ROUTE_DESCRIPTION] === "string"
                    && response.route[name][ROUTE_TAGS].constructor === Array
                    && typeof response.route[name][ROUTE_TARGET] === "string"
                ) {
                    instance.index.add(name, response.route[name][ROUTE_DESCRIPTION])
                    let tags = response.route[name][ROUTE_TAGS]
                    for(let t in tags) {
                        let tag = tags[t]
                        if(typeof tag === "string") instance.index.add(name , tag)
                    }
                }
            }
            instance.state = STATE_LOADED
        }
        else {
            instance.state = STATE_EMPTY
        }
    });    
  });

browser.omnibox.setDefaultSuggestion({
    description: `...`
});

browser.omnibox.onInputStarted.addListener(() => {
    
});

// Update the suggestions whenever the input is changed.
browser.omnibox.onInputChanged.addListener((text,suggest) => {
    
    browser.tabs.query({active:true,currentWindow:true})
    .then(
        function(tabInfo) { 
            let url = new URL(tabInfo[0].url);
            console.log(url);
            let instance = getInstance(url.hostname);
            if( instance.state !== STATE_LOADED ) 
            {
                suggest([]);
                return;
            }

            let suggestions = [];
            let hits = Object.keys(instance.index.search(text))
            for(i in hits) {
                let name = hits[i]
                suggestions.push({
                    "content": name,
                    "description": instance.routes[name][ROUTE_DESCRIPTION]
                })
            }
            suggest(suggestions);
        }
    );
});
  
  // Open the page based on how the user clicks on a suggestion.
  browser.omnibox.onInputEntered.addListener((name, disposition) => {
    browser.tabs.query({active:true,currentWindow:true})
    .then(
        function(tabInfo) { 
            let url = new URL(tabInfo[0].url);
            let instance = getInstance(url.hostname);

            if( instance.state !== STATE_LOADED ) return;
            
            let target = instance.routes[name][ROUTE_TARGET];
            switch (disposition) {
                case "currentTab":
                  browser.tabs.update({"url":url.protocol+"//"+url.hostname+target});
                  break;
                case "newForegroundTab":
                  // browser.tabs.create({url});
                  break;
                case "newBackgroundTab":
                  // browser.tabs.create({url, active: false});
                  break;
              }
        }
    );
    
    
  });
  
  
  

