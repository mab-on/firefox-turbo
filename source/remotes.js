var Remotes = /** @class */ (function() {

    function Remotes() {
        this.list = {};
    }

    Remotes.prototype.getRemote = function(siteUrl) {
        let remotes = this.getRemotes();
        return  remotes.hasOwnProperty(siteUrl.host)
            ? remotes[siteUrl.host]
            : "";
    }

    Remotes.prototype.getRemotes = function() {
        return new Promise((resolve,reject) => {
            browser.storage.local.get()
            .then( 
                (result) => {
                    this.list = result;
                    resolve(this.list);
                },
                (err) => {
                    reject(err);
                }
            );
        });
    }

    Remotes.prototype.setRemote = function(siteUrl, mapUrl) {
        return new Promise((resolve,reject) => {
            this.getRemotes()
            .then(remotes => {
                remotes[siteUrl.host] = mapUrl.href;
                this.list = remotes;
                browser.storage.local.set(this.list)
            })
            .then(resolve,reject)
        });
    }
    return Remotes;
}());
