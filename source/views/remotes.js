function fillTableBody(remotes) {
    tBody = document.getElementById("navmaps").getElementsByTagName("tbody")[0];
    for(let i in remotes) {
        let row = document.createElement("tr");
        let siteColumn = document.createElement("td");
        let navmapColumn = document.createElement("td");
        let navmapInput = document.createElement("input");
    
        siteColumn.appendChild( document.createTextNode(i) );
        navmapColumn.appendChild(navmapInput);
        navmapInput.setAttribute("type","url");
        navmapInput.setAttribute("value", remotes[i]);
        navmapInput.setAttribute("data-site", i);
        navmapInput.onchange = (e) => {
            let r = new Remotes();
            let siteUrl = new URL("turbo://"+i);
            let navUrl = new URL(e.target.value);
            r.setRemote(siteUrl,navUrl);
        };
        row.appendChild(siteColumn);
        row.appendChild(navmapColumn);
        tBody.appendChild(row);
    }
}
const remotes = new Remotes();
remotes.getRemotes().then(fillTableBody);