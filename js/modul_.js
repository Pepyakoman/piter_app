const modul = (function () {
	const protoPiter = {
		select (e) {
			let target = e.target || e;
			let name = target.name || target.parentElement.className;
			if (!(name == 'year' || name == 'month' || name == 'day' || name == 'satBox')) return;
			let calendar = piter.calendar;
			let form = piter.selectedForm;
			let files = piter[form].files;

			if (name != 'satBox') {
				let sat = calendar.querySelector ('.satBox');
				if (sat) sat.remove();
			}
			
			if (piter.selectedDate[name] && name == piter.selectedDate[name].parentElement.className) {
				piter.selectedDate[name].classList.remove ('selected', 'missing');
			}

			piter.selectedDate[name] = target.obj || target;

			switch (name) {
				case 'year' : {

					let monthsBox = document.createElement ('div');
						monthsBox.className = 'monthsBox';
					let months = document.createElement ('ul');
						months.className = 'month';
					let i = 12;
					while (i--) {
						let month = document.createElement ('li');
						month.textContent = piter.month[i];
						month.value = i;
						months.prepend (month);
					}
					monthsBox.append (months);

					let box = calendar.querySelector ('.monthsBox')
					if (box) box.remove();

					calendar.append (monthsBox);

					let year = target.value;
					let includeMonths = files[year];
					for (let month in includeMonths) {
						if (!isNaN (+month)) calendar.querySelector (`.month li[value='${month}']`).classList.add ('include');
					}

					if (!files[year]) {
						files.selectedYear = piter.selectedDate[name] = target;
						return piter.select ({name: 'month', value: '0', obj: target});
					}
					else if (files[year] && !files[year].selectedMonth) {
						let maxMonth = Math.max (...Object.keys(files[year]));
						files[year].selectedMonth = calendar.querySelector (`.month li[value='${maxMonth}']`);
					} else {
						let month = files[year].selectedMonth;
						files[year].selectedMonth = calendar.querySelector (`.month li[value='${month.value}']`);
					}
					files.selectedYear = target;
					piter.selectedDate.month = files[year].selectedMonth;

					target = null;
				};
				case 'month' : {
					let daysBox = document.createElement ('table');
						daysBox.className = 'daysBox';

					let header = document.createElement ('tr');
						header.className = 'header';
					let i = 7;
					while (i--) {
						let cell = document.createElement ('td');
							cell.textContent = piter.week[i];
						header.prepend (cell);
					}
					daysBox.append (header);

					if (daysBox.tBodies[0]) daysBox.tBodies[0].remove();
					let tBody = document.createElement ('tBody');
					let rows = 6;
					while (rows--) {
						let row = document.createElement ('tr');
							row.className = 'day';
						let i = 7;
						while (i--) {
							let cell = document.createElement ('td');
							row.append (cell);
						}
						tBody.append (row);
					}

					let box = calendar.querySelector ('.daysBox')
					if (box) box.remove();

					daysBox.append (tBody);
					calendar.append (daysBox);

					let year = files.selectedYear.value;
					let month = target ? target.value : files[year].selectedMonth.value;

					let date = new Date (year, month, 1);
					let day = date.getDay() - 1;
					let firstDay = day != -1 ? day : 6;
					let lastDay = new Date ((new Date (year, month + 1, 1) - 1)).getDate();

					let week = 1;
					let monthDay = 1;
					let weekDay = firstDay;

					days:while (daysBox.rows[week]) {
						let row = daysBox.rows[week];
						while (row.cells[weekDay])  {
							let cell = row.cells[weekDay];
							cell.textContent = cell.title = monthDay++;
							if (monthDay > lastDay) break days;
							weekDay++;
						}
						week++;
						weekDay = 0;
					}
					if (files[year] && files[year][month] && !files[year][month].selectedDay) {
						let maxDay = Math.max (...Object.keys(files[year][month]));
						files[year][month].selectedDay = calendar.querySelector (`.day td[title='${maxDay}']`);
					} else {
						if (!files[year] || !files[year][month]) return piter.showImg (null, target);
						let day = files[year][month].selectedDay;
						files[year][month].selectedDay = calendar.querySelector (`.day td[title='${day.title}']`);
					}
					piter.selectedDate.day = files[year][month].selectedDay;
					files[year].selectedMonth = piter.selectedDate.month = target || files[year].selectedMonth;

					let includeDays = files[year][month];
					for (let day in includeDays) {
						if (!isNaN (+day)) {
							calendar.querySelector (`.day td[title='${+day}']`).classList.add ('include');
						}
					}

					target = null;
				};
				case 'day' : {
					let year = piter.selectedDate.year.value;
					let month = piter.selectedDate.month.value;
					if (target && (!files[year] || !files[year][month] || !files[year][month][target.title])) return piter.showImg (null, target);

					let selectedDay = files[year][month].selectedDay = piter.selectedDate.day = target || files[year][month].selectedDay;

					let day = selectedDay.title;
					let filesArr = files[year][month][day];

					if (filesArr.length > 1) {
						let satBox = document.createElement ('div');
						satBox.className = 'satBox';
						filesArr.forEach ((elem) => {
							let sat = document.createElement ('div');
								sat.className = 'satelite';
								sat.textContent = elem.sat + ' ' + elem.dip;
							sat.addEventListener ('click', () => piter.showImg (elem.file, target));
							satBox.append (sat);
							let file = filesArr && filesArr[0].file;
							piter.showImg (file, target);
						})
						calendar.append (satBox);
					} else {
						let file = filesArr && filesArr[0].file;
						piter.showImg (file, target);
					}

					for (let elem in piter.selectedDate) piter.selectedDate[elem].classList.add ('selected');

					return;
					
				};
				case 'satBox' : {
					if (!target.classList.contains ('selected')) {
						let oldTarget = target.parentElement.querySelector ('.selected');
						if (oldTarget) target.classList.remove ('selected');
						target.classList.add ('selected');
					}
				};
			}
		},
		showImg (file, target) {
			console.log (file, target);
			if (target && target.obj) target = target.obj;
			let form = piter.selectedForm;
			let result = document.body.querySelector ('.result a');
			let img = result.querySelector ('img');
			if (file) {
				piter.selectedFile = file;
				img.src = result.href = `ice/${form}/${file}`;
			} else {
				result.href = '#';
				img.src  = `ice/NoData.png`;
				target.classList.add ('missing');
			}
		}
	}

	let piter = {

		calendar : document.body.querySelector ('.calendar'),
		month : ['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'],
		week : ['пн','вт','ср','чт','пт','сб','вс'],

		sat2 : {
			cuts : [[3,2], [5,2], [7,2], [0,3], [-7,3]],
			sort : [3,6]
		},
		sat : {
			cuts : [[2,4], [7,2], [10,1]]
		},
		yak : {
			cuts : [[4,2], [2,1], [7,1]]
		},
		def : {
			cuts : [[2,4], [0,1], [7,2]]
		}
	};
	piter.prototype = protoPiter;

	return function Data (arr, form) {
		console.log (piter);
		if (form = 'sat2') {
			arr.sort ((x, y) => x.substr (3, 6) - y.substr (3, 6));
		}
		
		piter.selectedForm = form;

		let files = piter[form].files;
		
		if (files == undefined) {

			files = {};
			let cuts = piter[form].cuts;

			arr.forEach (elem => {
				let data = {};
				data.year = cuts[0][1] == 2 ? '20' + elem.substr (...cuts[0]) : elem.substr (...cuts[0]);
				data.month = elem.substr (...cuts[1]) - 1;
				data.day = +elem.substr (...cuts[2]);
				data.date = new Date (data.year, data.month, data.day);
				data.file = elem;

				if (cuts[3]) data.sat = elem.substr (...cuts[3]);
				if (cuts[4]) data.dip = elem.substr (...cuts[4]);

				if (!files[data.year]) files[data.year] = {};
				if (!files[data.year][data.month]) files[data.year][data.month ] = {};
				if (!files[data.year][data.month][data.day]) files[data.year][data.month][data.day] = [];
				files[data.year][data.month][data.day].push (data);

			})
			piter[form].files = files;
		}

		let yearsBox = document.createElement ('div');
			yearsBox.className = 'yearsBox';
		let years = document.createElement ('ul');
			years.className = 'year';

		let nowYear = new Date().getFullYear();
		let yearsArr = Object.keys(files).filter ((e) => !isNaN (+e));
		let minYear = Math.min (...yearsArr);
		if (minYear > nowYear - 15) minYear = nowYear - 15;

		while (nowYear >= minYear) {
			let year = document.createElement ('li');
			year.textContent = nowYear;
			year.value = nowYear;
			years.prepend (year);
			nowYear--;
		}
		yearsBox.append (years);

		yearsBox.addEventListener ('mousewheel', scroll);

		function scroll (e) {
			console.log ('scroll');
			this.scrollTop += e.deltaY;
		}

		let calendar = piter.calendar;
		let box = calendar.querySelector ('.yearsBox')
		if (box) box.remove();

		calendar.append (yearsBox);

		yearsBox.scrollTop = 740;

		yearsArr.forEach ((year) => years.querySelector (`.year li[value='${year}']`).classList.add ('include'));

		calendar.addEventListener ('click', piter.select);

		if (!files.selectedYear) {
			let maxYear = Math.max (...yearsArr);
			files.selectedYear = years.querySelector (`.year li[value='${maxYear}']`);
		} else {
			let year = files.selectedYear.value;
			files.selectedYear = years.querySelector (`.year li[value='${year}']`);
		}

		piter.selectedDate = {};
		piter.selectedDate.year = files.selectedYear;

		piter.select (files.selectedYear);

		let result = document.querySelector ('.result');
		let button = result.querySelector ('.button');
			result.addEventListener ('click', nextMap);

		function nextMap (e) {
			if (e.target.classList.contains ('button')) {

				let files = piter[piter.selectedForm].files;
				let k;

				e.target.classList.contains ('right') ? k = 1 : k = -1

				let index = arr.indexOf (piter.selectedFile) + k;

				let newMap = arr[index];

				if (newMap) {
					let cuts = piter[form].cuts;

					let year = '20' + newMap.substr (...cuts[0]);
					let month = newMap.substr (...cuts[1]) - 1;
					let day = +newMap.substr (...cuts[2]);

					piter.selectedDate.year = calendar.querySelector (`.year li[value='${year}']`);
					piter.selectedDate.month = calendar.querySelector (`.month li[value='${month}']`);
					piter.selectedDate.day = calendar.querySelector (`.day td[title='${day}']`);

					console.log (piter);

					piter.select (piter.selectedDate.day);
				}
			};
		}
	}
})();
