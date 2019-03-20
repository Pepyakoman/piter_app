'use strict';


// Модуль
const modul = (() => {

	let service = { // Объект с дополнительными данными
		calendar : document.body.querySelector ('.calendar'),
		month : ['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'],
		week : ['пн','вт','ср','чт','пт','сб','вс'],

		sat2 : {
			cuts : [[3,2], [5,2], [7,2], [0,3], [-7,3]],
			sort : [3,6]
		},
		sat : {
			cuts : [[2,4], [7,2], [10,2]]
		},
		yak : {
			types: ['Карты вероятности встречи (в %) со льдом (кромки льда)', 'Карты вероятности встречи (в %) со льдом сплоченностью 7 и более баллов', 'Карты вероятности встречи (в %) с крупными формами льда', 'Карты вероятности встречи (в %) с преобладающим однолетним льдом'],
			cuts : [[2,1], [4,2], [-5,1]]
		},
		def : {
			types: ['Сплоченность', 'Форма льда', 'Возраст'],
			cuts : [[0,1], [2,4], [7,2]]
		},

		initialCalendar () { // Функция инициализации календаря

			let files = this;

			selected.form = this.name;
			
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

			let scroll = function (e) {
				e.preventDefault();
				this.scrollTop += e.deltaY;
			}

			yearsBox.addEventListener ('mousewheel', scroll);

			let calendar = this.calendar;
			
			let box = calendar.querySelector ('.yearsBox');

			if (box) {
				box.replaceWith (yearsBox);
			} else {
				calendar.append (yearsBox);
			}
			
			yearsBox.scrollTop = 740;

			yearsArr.forEach ((year) => years.querySelector ('.year li[value='+ year +']').classList.add ('include'));

			if (!files.selectedYear) {
				let maxYear = Math.max (...yearsArr);
				files.selectedYear = years.querySelector ('.year li[value='+ maxYear +']');
			} else {
				let year = files.selectedYear.value;
				files.selectedYear = years.querySelector ('.year li[value='+ year +']');
			}

			selected.year = files.selectedYear;

			this.select (files.selectedYear);

			let result = document.querySelector ('.result');

			result.onclick = (e) => this.nextMap.call (area[selected.form], e);
		},

		select (e) {

			let target = e.target || e;

			let name = target.name || target.parentElement.className;

			if (!(name == 'year' || name == 'month' || name == 'day' || name == 'satBox')) return;

			/*if (target.classList && target.classList.contains ('selected')) {
				return;
			}*/

			let calendar = service.calendar;

			let form = selected.form;

			if (name != 'satBox') {
				let sat = calendar.querySelector ('.satBox');
				if (sat) sat.remove();
			}

			let selectedDate = selected[name];

			if (selectedDate && name == selectedDate.parentElement.className) {
				selectedDate.classList.remove ('selected', 'missing');
			}

			selected[name] = target.obj || target;

			switch (name) {
				case 'year' : {

					let box = calendar.querySelector ('.monthsBox')

					if (!box) {

						let monthsBox = document.createElement ('div');
							monthsBox.className = 'monthsBox';
						let months = document.createElement ('ul');
							months.className = 'month';

						let i = 12;
						while (i--) {
							let month = document.createElement ('li');
							month.textContent = this.month[i];
							month.value = i;
							months.prepend (month);
						}
						monthsBox.append (months);
						calendar.append (monthsBox);
					}

					if (box) {

						let i = box.firstChild.childNodes.length;

						while (i--) {
							box.firstChild.childNodes[i].classList = '';
						}
					}

					let year = target.value;
					let includeMonths = this[year];

					for (let month in includeMonths) {
						if (!isNaN (+month)) {
							calendar.querySelector ('.month li[value='+ month +']').classList.add ('include');
						}
					}

					if (!this[year]) {
						this.selectedYear = selected[name] = target;
						return this.select ({name: 'month', value: '0', obj: target});
					}
					else if (this[year] && !this[year].selectedMonth) {

						let maxMonth = Math.max (...Object.keys(this[year]));
						this[year].selectedMonth = calendar.querySelector ('.month li[value='+ maxMonth +']');
					} else {
						let month = this[year].selectedMonth;
						this[year].selectedMonth = calendar.querySelector ('.month li[value='+ month.value+ ']');
					}

					this.selectedYear = target;
					selected.month = this[year].selectedMonth;

					target = null;
				};
				case 'month' : {

					let box = calendar.querySelector ('.daysBox')
					if (box) box.remove();

					let daysBox = document.createElement ('table');
						daysBox.className = 'daysBox';

					let header = document.createElement ('tr');
						header.className = 'header';

					let i = 7;
					while (i--) {
						let cell = document.createElement ('td');
							cell.textContent = this.week[i];
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
					daysBox.append (tBody);
					calendar.append (daysBox);

					let year = this.selectedYear.value;
					let month = target ? target.value : this[year].selectedMonth.value;

					let date = new Date (year, month, 1);

					let day = date.getDay() - 1;
					let firstDay = (day == -1) ? 6 : day;

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

					if (this[year] && this[year][month] && !this[year][month].selectedDay) {

						let maxDay = Math.max (...Object.keys(this[year][month]));
						this[year][month].selectedDay = calendar.querySelector ('.day td[title='+ maxDay +']');
					} else {

						if (!this[year] || !this[year][month]) return this.showImg (null, target);

						let day = this[year][month].selectedDay;
						this[year][month].selectedDay = calendar.querySelector ('.day td[title='+ day.title +']');
					}

					selected.day = this[year][month].selectedDay;
					this[year].selectedMonth = selected.month = target || this[year].selectedMonth;

					let includeDays = this[year][month];
					for (let day in includeDays) {
						if (!isNaN (+day)) {
							calendar.querySelector ('.day td[title='+ +day +']').classList.add ('include');
						}
					}

					target = null;
				};
				case 'day' : {

					let year = selected.year.value;
					let month = selected.month.value;

					if (target && (!this[year] || !this[year][month] || !this[year][month][target.title])) {
						return this.showImg (null, target);
					}

					let selectedDay = this[year][month].selectedDay = selected.day = target || this[year][month].selectedDay;

					let day = selectedDay.title;
					let filesSat = this[year][month][day];

					if (!filesSat.file) {
						let satBox = document.createElement ('div');
							satBox.className = 'satBox';
						
						for (let sat in filesSat) {

							if (filesSat[sat].nodeType) continue;

							let div = document.createElement ('div');
							div.className = 'satelite';
							div.textContent = div.title = filesSat[sat].sat + filesSat[sat].dip;

							satBox.append (div);

							if (!filesSat.selectedSat) {
								filesSat.selectedSat = selected.satBox = satBox.querySelector ('div[title='+ div.title +']');
							}
						}
						calendar.append (satBox);
					} else {
						if (!filesSat.selectedSat) {
							filesSat.selectedSat = selected.satBox = selected.day;
						}
					}

					target = null;
				};
				case 'satBox' : {

					let year = selected.year.value;
					let month = selected.month.value;
					let day = selected.day.title;
					let sat = target && target.title || this[year][month][day].selectedSat.title;

					let selectedSat = this[year][month][day].selectedSat = selected.satBox = target || calendar.querySelector ('div[title='+ sat +']');

					let file = this[year][month][day][sat] && this[year][month][day][sat].file || this[year][month][day].file;

					for (let elem in selected) {

						if (!selected[elem] || !selected[elem].nodeType || elem == 'satFilter') continue;

						selected[elem].classList.add ('selected');
					}

					this.showImg (file, selected.satBox);

					area[this.name].satFilter ();
				};
			}
		},

		showImg (file, target) {

			let fileObj;

			if (typeof file == 'object' && file != null) {
				fileObj = file;
				file = file.filename
			} else if (this.files) {
				fileObj = this.files.find (e => e.filename == file);
			}

			if (target && target.obj) target = target.obj;

			let result = document.querySelector ('.result a');
				result.classList.add ('loading');

			let resImg = result.querySelector ('img');
				resImg.addEventListener ('load', loading);

			let form = selected.form;

			function loading () {
				result.classList.remove ('loading');
			}

			if (!file) {
				result.href = '#';
				resImg.src = 'ice/NoData.png';
				target.classList.add ('missing');

				area[this.name].satFilter ();
				
				return;

			} else {
				selected.file = file;
				this.selectedFile = file;

				let str = 'ice/+ form+ /';

				let name = file.slice (0, -4);
				let ext = file.slice (-4);

				let full = str + file;
				let ql = str + name + '_ql' + ext;
				let kmz = str + name + '.kmz';

				let pre = document.body.querySelector ('.kmz');
				if (pre) pre.remove();

				let request	= new XMLHttpRequest ();
				request.open ('POST', ql);
				request.send ();

				let ajax = function () {

					if (this.status == 200) {
						resImg.src = this.responseURL;
						result.href = full;
					} else {
						resImg.src = full;
						result.href = full;
					}
				}

				request.addEventListener ('loadend', ajax);

				let requestKMZ	= new XMLHttpRequest ();
				requestKMZ.open ('POST', kmz);
				requestKMZ.send ();

				let ajaxKMZ = function () {

					if (this.status == 200) {
						let a = document.createElement ('a');
						a.className = 'kmz';
						a.href = requestKMZ.responseURL;
						a.textContent = kmz;
						result.parentElement.after (a);
					}
				}

				requestKMZ.addEventListener ('loadend', ajaxKMZ);
			}

			if (selected.form == 'yak' || selected.form == 'def') {
				var elements = Array.from (document.forms[form].elements);

				elements.forEach (function (elem) {
					var opt = elem.options;
					var i = opt.length;

					while (i--) if (opt[i].value == fileObj[elem.name]) {
						opt[i].selected = true;
					}
				})
			}
		},

		nextMap (e) {

			if (e.target.classList.contains ('button')) {

				let form = selected.form;
				let file = selected.file;
				let arr = selected.arr;
				let calendar = this.calendar;
				let k;

				e.target.classList.contains ('right') ? k = 1 : k = -1

				let index = arr.indexOf (file) + k;

				let newMap = arr[index];

				if (newMap) {

					if (form == 'yak' || form == 'def') {
	
						this.showImg (newMap, null)
						return;
					}

					let cuts = service[form].cuts;
					let year, month, day, sat, dip;

					cuts[0][1] == 2 ? year = '20' + newMap.substr (...cuts[0]) : year = newMap.substr (...cuts[0]);

					month = newMap.substr (...cuts[1]) - 1;
					day = +newMap.substr (...cuts[2]);

					if (cuts[3]) sat = newMap.substr (...cuts[3]);
					if (cuts[4]) dip = newMap.substr (...cuts[4]);

					if (selected.year.value != year) {						
						this.select (calendar.querySelector ('.year li[value='+ year +']'));
						return;
					}
					if (selected.month.value != month) {
						this.select (calendar.querySelector ('.month li[value='+ month +']'));
						return;
					}
					if (selected.day.title != day) {
						this.select (calendar.querySelector ('.day td[title='+ day +']'));
						return;
					}
					if (selected.satBox.title != sat + dip) {
						this.select (calendar.querySelector ('.satBox div[title='+ sat + dip +']'));
						return;
					}
				}
			}
		},

		initialForm () {

			var form = document.forms[selected.form];
			var select = Array.from(form.elements);

			// Сбрасываем масив имен файлов
			this.files = [];
			// Создаем массив разбитых по, соответствующим именам селектов, частям имен файлов
			this.arr.forEach (function (value) {

				var i = select.length;
				var obj = {};

				while (i--) {
					var val = value.substr.apply(value, this[form.name].cuts[i]);
					var parse = parseInt(val);
					obj[select[i].name] = parse ? parse : val;
				}

				obj.filename = value;

				this.files.push(obj);

			}, this);

			// Сортируем и отрисовываем уникальные значения имен каждого селекта
			var i = select.length;

			var _loop = function _loop() {
				// Сортируем обьекты по значениям имен свойств, соответствующих именам селектов
				var elem = select[i].name;

				this.files.sort(function (a, b) {
					if (b[elem] > a[elem]) return -1;
					if (b[elem] < a[elem]) return 1;
					else return 0;
				});

				// Сбрасываем значения
				select[i].innerHTML = '';

				var temp = void 0; // Здесь будет храниться каждое предыдущее значение для сравнения
				if (select[i].name == 'day') temp = 0;

				this.files.forEach(function (value) {

					var val = value[elem];
					if (val != temp) {
						// Добовляем отсутствующие значения, если значение числовое
						var diff = val - temp;
						// Если разница между значениями больше 1-го, то создаем и добавляем недостающие <option> с классом "missing", использованна префиксная форма инкремента, для исключения лишних значений, например при разнице в два, на самом деле не хватает 1-го элемента
						if (diff > 1) while (--diff) {
							var missOption = document.createElement('option');
							missOption.className = 'missing';
							missOption.value = ++temp;
							select[i].append(missOption);
						}
						// Добовляем текущее значение после того как дорисовали недостающие и помещаем его в temp
						var currentOption = document.createElement('option');
						currentOption.value = val;
						select[i].append(currentOption);
						temp = val;
					}
				});

				// Отрисовываем значения в опциях
				var option = select[i].options;
				{
					var _i = option.length;
					while (_i--) {
						var val = option[_i].value;
						switch (elem) {
							case 'month':
								if (val > 4 && val < 11) option[_i].remove();
								else option[_i].textContent = this.month[val - 1];
								break;

							case 'char':
								option[_i].textContent = this.def.types[val - 1];
								break;

							case 'char_r':
								option[_i].textContent = this.yak.types[val - 1];
								break;

							case 'year':
								option[_i].textContent = val < 100 ? '20' + val : val;
								break;

							case 'day':
								option[_i].textContent = val < 10 ? '0' + +val : val;
								break;

							default:
								option[_i].textContent = val;
						}
					}
				}
				var meta = document.createElement('option');
				meta.className = 'missing';
				meta.value = 0;
				meta.textContent = "Выберите";
				meta.selected = true;
				select[i].prepend(meta);
			};

			while (i--) {
				_loop.call (this);
			}

			form.addEventListener('change', this.selectOptions);
			form.addEventListener('mouseover', this.chose.bind (this), true);
			
			var lastIndex = this.files.length - 1;

			this.showImg (this.files[lastIndex], null);
		},

		selectFilter (checked, files) {
			return files = files.filter(function (obj) {

				var i = checked.length;
				while (i--) {
					var name = checked[i].parentElement.name;
					var val = checked[i].value;

					if (val != 0 && val != obj[name]) return false;
				}

				return true;
			});
		},

		selectOptions (e) {
			if (e.target.tagName != 'SELECT') return;

			// Находим форму на которой была вызвана функция и Берем массив имен файлов, соответствующий данной форме
			var form = this.closest('form');
			var files = area[form.name].files;
			
			// Находим в форме все выбранные опции
			var checked = Array.from(document.querySelectorAll('option:checked'));

			// Фильтруем массив с файлами, в соответствии со значениями выбранных опций
			files = area[form.name].selectFilter(checked, files);

			// Проходим по селектам и перерисовываем отсутствующие опции
			var i = form.elements.length;

			var _loop2 = function _loop2() {
				var select = form.elements[i];
				var name = select.name;
				// Создаем вспомогательный массив из всех значений подимен файлов соответствующих имени селекта
				var arr = Array.from(files, function (value) {
					return value[name];
				});
				// Проходим по всем опциям в данном селекте
				Array.from(select.options).forEach(function (option) {
					if (arr.some(function (value) {
						return value == option.value;
					})) option.className = '';
					else option.className = 'missing';
				});
			};

			while (i--) {
				_loop2();
			}
			// Если осталось одно значение в отфильтрованом массиве или все выбранные значения не имеют класс 'missing'
			// Запрашиваем наличие файлов на сервере, quiq_look, если отсутствует - полноразмерный, либо в формате .png
			// И отрисовываем картинку в result
			
			if (files.length == 1 || checked.every ((opt) => opt.className != 'missing')) {
				area[form.name].showImg (files[0], null);
			}

			// При наведении на select, массив именн сортируется игнорируя текущюю выбранную опцию селекта
			// и отрисовываються возможные значния, событие назначено через setTimeout,
			// т.к при клике на селект не успевает отрисоваться select

			//setTimeout (() => area[form.name].chose (e, area[form.name]), 0);
		},

		chose (e) {
			if (e.target.tagName != 'SELECT') return;

			var files = this.files;
			var checked = Array.from(document.querySelectorAll('option:checked'));
			var options = Array.from(e.target.options);

			checked = checked.filter(function (opt) {

				return opt.value != e.target[e.target.selectedIndex].value;
			});

			files = this.selectFilter(checked, files);

			options.forEach(function (elem) {
				var i = files.length;
				while (i--) {
					if (elem.value > files[i][e.target.name]) {
						elem.classList.add ('missing');
						return;
					}
					if (elem.value == files[i][e.target.name]) {
						elem.className = '';
						return;
					}
				}
			});

		},

		satFilter () {

			let satFilter = document.body.querySelector ('.satFilter');

			if (this.name == 'sat2') {
				if (satFilter) {
					this.calendar.querySelector ('.daysBox').after (satFilter);
					return;
				};

				if (selected.satFilter) {
					this.calendar.querySelector ('.daysBox').after (selected.satFilter);
					return;
				}
				
				satFilter = document.createElement ('div');
				satFilter.className = 'satFilter';

				this.calendar.querySelector ('.daysBox').after (satFilter);

				let sats = [];

				this.arr.forEach (e => {
					let sat = e.substr (...this[this.name].cuts[3]);
					if (sats.indexOf (sat) == -1) sats.push (sat);
				})

				sats.forEach (e => {
					let label = document.createElement ('label');
						label.textContent = e;
						label.htmlFor = e;
				 	let input = document.createElement ('input');
				 		input.type = 'checkbox';
				 		input.checked = true;
				 		input.value = e;
				 		input.id = e;

				 	label.append (input);
				 	satFilter.append (label);
				})

				selected.satFilter = satFilter;

				satFilter.addEventListener ('change', filter.bind (this));

				function filter (e) {
					let checkedSatCheckboxes = Array.from (selected.satFilter.querySelectorAll ('input[type="checkbox"]:checked'));
					let checkedSats = checkedSatCheckboxes.map (e => e.value);
					let filteredSats = this.mainArr.filter (f => {
						return checkedSats.some (e => e == f.substr (...this.sat2.cuts[3]));
					});

					area[this.name] = new Area (filteredSats, this.name);
					area[this.name].initialCalendar();

					selected.satFilter = satFilter;
				}

			} else if (satFilter) {
				satFilter.remove();
			}
		}
	}

	service.calendar.addEventListener ('click', (e) => {
		area[selected.form].select (e)
	});

	let area = {}; // Объект с данными форм
	let selected = {}; // Объект для выбранных параметров

	Area.prototype = Object.create (service);

	function Area (arr, name) {
		this.arr = arr;
		this.mainArr = arr;
		this.name = name;

		if (this[name].sort) this.arr.sort ((x, y) => x.substr (...this[name].sort) - y.substr (...this[name].sort));

		selected.form = name;
		selected.arr = arr;

		let cuts = this[name].cuts;

		this.arr.forEach (elem => {
			let data = {};
			data.year = cuts[0][1] == 2 ? '20' + elem.substr (...cuts[0]) : elem.substr (...cuts[0]);
			data.month = elem.substr (...cuts[1]) - 1;
			data.day = +elem.substr (...cuts[2]);
			data.date = new Date (data.year, data.month, data.day);
			data.file = elem;

			if (cuts[3]) data.sat = elem.substr (...cuts[3]);
			if (cuts[4]) data.dip = elem.substr (...cuts[4]);

			if (!this[data.year]) this[data.year] = {};
			if (!this[data.year][data.month]) this[data.year][data.month ] = {};
			if (!this[data.year][data.month][data.day]) this[data.year][data.month][data.day] = {};

			if (!data.sat) this[data.year][data.month][data.day] = data;
			else this[data.year][data.month][data.day][data.sat + data.dip] = data;
		})
	}

	return function (arr, form)  { // Если объекта формы нет, модуль возвращает новый
		let name = form.id;

		if (!area[name]) {
			area[name] = new Area (arr, name);
		}

		selected.arr = area[name].arr;
		selected.form = form.id;

		if (form.id == 'sat' || form.id == 'sat2') {
			area[name].initialCalendar();
		} else {
			area[name].initialForm ()
		}
	}
})();