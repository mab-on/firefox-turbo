class SearchUI {
	Dom : HTMLElement = document.createElement("nav");
	Input : SearchUI_Userinput;
	Suggestions : SearchUI_SuggestionList;

	constructor() {
		this.Input = new SearchUI_Userinput();
		this.Suggestions = new SearchUI_SuggestionList();
		this.Dom.appendChild( this.Input.Dom );
		this.Dom.appendChild( this.Suggestions.Dom );

		this.Dom.style.position = "fixed";
		this.Dom.style.width = "80%";
		this.Dom.style.left = "50%";
		this.Dom.style.top = "5px";
		this.Dom.style.transform = "translateX(-50%)";

		this.Dom.addEventListener("keyup", event => {
			if(event.keyCode === /*ESC*/27) {
				document.body.removeChild( this.Dom );
			}
		});

		this.Dom.addEventListener('keydown',  (event) => {
			switch(event.keyCode) {
				case /*UP*/38:

					break;

				case /*DOWN*/40:
					this.Suggestions.Next();
					console.log( this.Suggestions.Current() );
					break;
			}
		});
	}
}

class SearchUI_Userinput {
	Dom : HTMLElement = document.createElement("span")
	input : HTMLInputElement = document.createElement("input")
	constructor() {
		this.input.setAttribute("placeholder","what are you searching for?")
		this.Dom.appendChild(this.input)
	}

	Value(setter? : string) : string|this {
		if(!setter) return this.input.value ;
		this.input.value = setter;
		return this;
	}
}

class SearchUI_SuggestionList {
	Dom : HTMLElement = document.createElement("ul");
	list : SearchUI_Suggestion[] = [];
	current : number = 0;

	constructor() {
		this.Dom.classList.add("SearchUI_SuggestionList");
	}

	Add(...item : SearchUI_Suggestion[]) : this {
		let offset = this.Dom.children.length;
		for(let i=0; i < item.length; i++) {
			this.list.push(item[i]);
			this.Dom.appendChild( item[i].Dom );
			if( (offset+i) % 2 ) {
				item[i].Dom.classList.add("even");
			} else {
				item[i].Dom.classList.add("odd");

			}
		}
		return this;
	}

	Clear() : this {
		while( this.Dom.firstChild ) {
			this.Dom.removeChild( this.Dom.firstChild );
		}
		this.list = [];
		return this;
	}

	Next() : this {
		if (this.list.length <= 1) return this;

		this.current = this.current === this.list.length
			? 0
			: this.current + 1;

		this.Current().target.focus();
		return this;
	}
	Prev() : this {
		return this;
	}
	Current() : SearchUI_Suggestion|null {
		return this.list.length
		? this.list[ this.current ]
		: null;
	}
}

class SearchUI_Suggestion {
	Dom : HTMLElement = document.createElement("li");
	name : HTMLElement = document.createElement("li");
	description : HTMLElement = document.createElement("li");
	target : HTMLAnchorElement = document.createElement("a");

	constructor() {
		let ul = document.createElement("ul");
		ul.style.padding = "5px";
		ul.style.listStyleType = "none";

		this.name.style.fontSize = "larger";
		this.description.style.fontSize = "smaller";

		ul.appendChild(this.name);
		ul.appendChild(this.description);

		this.target.appendChild(ul);

		this.Dom.classList.add("SearchUI_Suggestion");
		this.Dom.appendChild(this.target);
	}

	Name(setter? : string) : string|this {
		if(!setter) return this.name.textContent;
		this.name.textContent = setter;
		return this;
	}

	Description(setter? : string) : string|this {
		if(!setter) return this.description.textContent;
		this.description.textContent = setter;
		return this;
	}

	Target(setter? : string) : string|this {
		if(!setter) return this.target.href;
		this.target.href = setter;
		return this;
	}
}