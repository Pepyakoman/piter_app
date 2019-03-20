let calendar = document.body.querySelector ('.conteiner');

let i = 6;
while (i--) {
	let emptyDay = document.createElement ('div');
	emptyDay.className = 'emptyDay';
	emptyDay.textContent = '';
	calendar.append (emptyDay);
}

	
i = 1;
while (i <= 37) {
	let day = document.createElement ('div');
	day.className = 'monthDay';
	day.textContent = i;
	calendar.append (day);
	i++;
}

calendar.addEventListener ('click', moveDays);

function moveDays () {

	
	let conteinerDivs = calendar.querySelectorAll ('div');
	for (let div in conteinerDivs) {
		if (div < 4) {
			conteinerDivs[div].classList.toggle ('hideDay');
			console.log (conteinerDivs[div])
		}
	}
	console.log ('move')
}
