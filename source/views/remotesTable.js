var RemotesTable = (function() {
    function RemotesTable() {
        this.remotes = new Remotes();
        this.tableElement = document.createElement("table");
        this.tbody = document.createElement("tbody")
        this.blankoSite = "";
        this.blankoNavmap = "";

        this.tableElement.appendChild(this.tbody);

        //build thead
        let thead = document.createElement("thead");
        let th = document.createElement("th");
        th.appendChild( document.createTextNode("Site") );
        th.appendChild( document.createTextNode("Foreign navigation map") );
        thead.appendChild(th);
        this.tableElement.appendChild( thead );
        
        this._tfoot();
        
    }

    RemotesTable.prototype._tfoot = function() {
        let tfoot = document.createElement("tfoot");
        let row = document.createElement("tr");
        let siteColumn = document.createElement("td");
        let navmapColumn = document.createElement("td");
        let siteInput = document.createElement("input");
        let navmapInput = document.createElement("input");
        siteInput.setAttribute("type","text");
        navmapInput.setAttribute("type","url");
        siteInput.onchange = (e) => {this.blankoChanged(e) };
        navmapInput.onchange = (e) => {this.blankoChanged(e) };
        siteColumn.appendChild(siteInput);
        navmapColumn.appendChild(navmapInput);
        row.appendChild(siteColumn);
        row.appendChild(navmapColumn);
        tfoot.appendChild(row);
        this.tableElement.appendChild( tfoot );
    }

    RemotesTable.prototype.blankoChanged = function(e) {
        switch(e.target.getAttribute("type")) {
            case "text":
                this.blankoSite = e.target.value;
                break;
            case "url":
                this.blankoNavmap = e.target.value;
                break;
        }
        
        //TODO: validate
        
        if(this.blankoNavmap.length && this.blankoSite.length) {
            let siteUrl = new URL("http://"+this.blankoSite);
            let navUrl = new URL(this.blankoNavmap);
            this.remotes.setRemote( siteUrl,navUrl );
        }
    }

    RemotesTable.prototype.loadDOM = async function() {
        let remotes = await this.remotes.getRemotes();
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
                let siteUrl = new URL("http://"+i);
                let navUrl = new URL(e.target.value);
                this.remotes.setRemote(siteUrl,navUrl);
            };
            row.appendChild(siteColumn);
            row.appendChild(navmapColumn);
            this.tbody.appendChild(row);
        }

        return this.tableElement;
    }
    
    return RemotesTable;
}());

const remotesTable = new RemotesTable();
remotesTable.loadDOM().then((e) => {
    Array.from(document.getElementsByTagName("remotesTable")).forEach(tab => { tab.replaceWith(e) });
});
