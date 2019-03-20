class DropMenu {
	constructor ({name, data}) {

		let dropMenu = document.createElement ('div');
		dropMenu.className = name;
		dropMenu.textContent = 'Выберите';
		dropMenu.style.cursor = 'pointer';

		let arrow = document.createElement ('div');
		arrow.className = 'arrow';
		arrow.textContent = '<';

		let ul = document.createElement ('div');
		ul.className = 'ul'
		ul.style.display = 'none';

		let value = 0;

		for (let elem of data) {
			let li = document.createElement ('div');
			li.textContent = elem;
			li.dataset.value = ++value;
			li.className = 'selectabel';

			ul.append (li);
		}

		dropMenu.append (ul, arrow);

		dropMenu.addEventListener ('click', this.open);
		dropMenu.addEventListener ('click', this.select);

		return dropMenu;
	}

	open () {
			let ul = this.querySelector ('.ul');

			ul.style.display == 'none' ? 
			ul.style.display = 'block' : 
			ul.style.display = 'none'
	}

	select (event) {
		let li = event.target.closest ('.selectabel')
		if (li) {

			for (let item of this.querySelector ('.ul').children) {
				item.style.background = "";
			}

			li.style.background = "#87c7ff";
			this.firstChild.textContent = li.textContent;
		}
	}
}

let yearBox = new DropMenu ({
	name :'b-yearBox', 
	data : ['2011','2101','2004']
});

document.body.append (yearBox);