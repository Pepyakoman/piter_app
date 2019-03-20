const piter = {
	files : {},
	render (arr) {
		
		console.log (this.files)
		console.log (arr);
	},
	calendar () {
		let calendar = document.body.querySelector ('.calendar');
		console.log (calendar);
		let years = document.createElement ('div');
			years.className = 'yearField';
		let fullYear = new Date ().getFullYear;
			for (let i = 1970; i < fullYear; i++) {
				let elem = document.createElement ('div');
					elem.classList.add ('year');
					elem.textContent = i;
					piter.files[i] ? elem.classList.add ('missing');
					years.append (elem);
			}
			for (let date in piter.files) {
					console.log (years);
					if (elem.textContent == date) {
						elem.classList.remove ('missing')
					}
				}
			}
		calendar.append (years);
		let month = document.createElement ('div');
			month.className = 'monthField';
		let day = document.createElement ('div');
			day.className = 'dayField';
	}
}