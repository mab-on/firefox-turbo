browser.runtime.onMessage.addListener(
	(request) => {
		let ui = new SearchUI();

		document.body.append( ui.Dom );

		// ui.Dom.addEventListener('focusout', (event) => {
		//   document.body.removeChild( ui.Dom );
		// });


		ui.Input.input.focus();

		ui.Input.input.addEventListener('input',  (event) => {
		 	browser.runtime.sendMessage({
				"search": event.target.value
	 		}).then( results => {
				ui.Suggestions.Clear();
	 			for(let i=0; i<results.length; i++) {
	 				let suggestion = new SearchUI_Suggestion().Name( results[i].content ).Description( results[i].description ).Target( results[i].target );
					ui.Suggestions.Add(suggestion);
				}
	 		} , error => {}
	 		);
		});



	}
);