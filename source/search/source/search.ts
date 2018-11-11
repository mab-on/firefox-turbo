class Index {
    wordIndex : { [word : string]: number[] }
    splitter : string = "[\s]+"

    constructor() {
        this.wordIndex = {};
    }

    add(id : number , content : string)
    {
        for(let word of content.split(/[\s]+/) ) {
            word = word.toLowerCase()
            if(this.wordIndex.hasOwnProperty(word))  {
                this.wordIndex[word].push(id)
            }
            else {
                this.wordIndex[word] = [ id ]
            }
        }
    }

    search(text : string) {
        text = text.toLowerCase()
        let result : { [name: string]: number } = {}
        let searchWords = text.split(/[\s]+/)

        for(let indexWord of this.words()) {
            for(let searchWord of searchWords) {
                if( indexWord.indexOf(searchWord) !== -1 ) {
                    for(let name of this.wordIndex[indexWord]) {
                        if( result.hasOwnProperty( name )) {
                            result[name]++
                        }
                        else {
                            result[name] = 1
                        }
                    }
                }
            }
        }
        
        return result;
    }

    words() : string[] {
        return Object.keys(this.wordIndex);
    }

    throwup() {
        return this.wordIndex;
    }
}
