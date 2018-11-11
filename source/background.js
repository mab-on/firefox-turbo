
const index = new Index();

var routes;
const ROUTE_DESCRIPTION = 0;
const ROUTE_TAGS = 1;
const ROUTE_TARGET = 2;


browser.webNavigation.onCompleted.addListener(evt => {
    // Filter out any sub-frame related navigation event
    if (evt.frameId !== 0) {
      return;
    }

    const url = new URL(evt.url);
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
            routes = response.route
            for(let i in routenames) {
                let name = routenames[i]
                if(
                    response.route[name].length === 3 
                    && typeof response.route[name][ROUTE_DESCRIPTION] === "string"
                    && response.route[name][ROUTE_TAGS].constructor === Array
                    && typeof response.route[name][ROUTE_TARGET] === "string"
                ) {
                    index.add(name, response.route[name][ROUTE_DESCRIPTION])
                    let tags = response.route[name][ROUTE_TAGS]
                    for(let t in tags) {
                        let tag = tags[t]
                        if(typeof tag === "string") index.add(name , tag)
                    }
                }
            }
        }
    });    
  });

browser.omnibox.setDefaultSuggestion({
    description: `...`
});

// Update the suggestions whenever the input is changed.
browser.omnibox.onInputChanged.addListener((text, suggest) => {
    let suggestions = [];
    let hits = Object.keys(index.search(text))
    for(i in hits) {
        let name = hits[i]
        suggestions.push({
            "content": name,
            "description": routes[name][ROUTE_DESCRIPTION]
        })
    }
    suggest(suggestions);
  });
  
  // Open the page based on how the user clicks on a suggestion.
  browser.omnibox.onInputEntered.addListener((name, disposition) => {
    let target = routes[name][ROUTE_TARGET]
    browser.tabs.query({active:true,currentWindow:true})
    .then(
        function(tabInfo) { 
            let url = new URL(tabInfo[0].url);
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
  
  
  

