function _typeof(obj) {
	if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
		_typeof = function _typeof(obj) {
			return typeof obj;
		};
	} else {
		_typeof = function _typeof(obj) {
			return obj &&
				typeof Symbol === "function" &&
				obj.constructor === Symbol &&
				obj !== Symbol.prototype
				? "symbol"
				: typeof obj;
		};
	}
	return _typeof(obj);
}

function _toConsumableArray(arr) {
	return (
		_arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread()
	);
}

function _nonIterableSpread() {
	throw new TypeError("Invalid attempt to spread non-iterable instance");
}

function _iterableToArray(iter) {
	if (
		Symbol.iterator in Object(iter) ||
		Object.prototype.toString.call(iter) === "[object Arguments]"
	)
		return Array.from(iter);
}

function _arrayWithoutHoles(arr) {
	if (Array.isArray(arr)) {
		for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) {
			arr2[i] = arr[i];
		}
		return arr2;
	}
}

var modul = (function() {
	var service = {
		// Объект с дополнительными данными
		calendar: document.body.querySelector(".calendar"),
		month: [
			"январь",
			"февраль",
			"март",
			"апрель",
			"май",
			"июнь",
			"июль",
			"август",
			"сентябрь",
			"октябрь",
			"ноябрь",
			"декабрь"
		],
		week: ["пн", "вт", "ср", "чт", "пт", "сб", "вс"],
		sat2: {
			cuts: [[3, 2], [5, 2], [7, 2], [0, 3], [-7, 3]],
			sort: [3, 6]
		},
		sat: {
			cuts: [[2, 4], [7, 2], [10, 2]]
		},
		yak: {
			types: [
				"Карты вероятности встречи (в %) со льдом (кромки льда)",
				"Карты вероятности встречи (в %) со льдом сплоченностью 7 и более баллов",
				"Карты вероятности встречи (в %) с крупными формами льда",
				"Карты вероятности встречи (в %) с преобладающим однолетним льдом"
			],
			cuts: [[2, 1], [4, 2], [-5, 1]]
		},
		def: {
			types: ["Сплоченность", "Форма льда", "Возраст"],
			cuts: [[0, 1], [2, 4], [7, 2]]
		},
		initialCalendar: function initialCalendar() {
			var _this = this;

			// Функция инициализации календаря
			var files = this;
			selected.form = this.name;
			var yearsBox = document.createElement("div");
			yearsBox.className = "yearsBox";
			var years = document.createElement("ul");
			years.className = "year";
			var nowYear = new Date().getFullYear();
			var yearsArr = Object.keys(files).filter(function(e) {
				return !isNaN(+e);
			});
			var minYear = Math.min.apply(Math, _toConsumableArray(yearsArr));
			if (minYear > nowYear - 15) minYear = nowYear - 15;

			while (nowYear >= minYear) {
				var year = document.createElement("li");
				year.textContent = nowYear;
				year.value = nowYear;
				years.prepend(year);
				nowYear--;
			}

			yearsBox.append(years);

			var scroll = function scroll(e) {
				e.preventDefault();
				this.scrollTop += e.deltaY;
			};

			yearsBox.addEventListener("mousewheel", scroll);
			var calendar = this.calendar;
			var box = calendar.querySelector(".yearsBox");

			if (box) {
				box.replaceWith(yearsBox);
			} else {
				calendar.append(yearsBox);
			}

			yearsBox.scrollTop = 740;
			yearsArr.forEach(function(year) {
				years.querySelector(".year li[value='" + year + "']").classList.add("include");
			});

			if (!files.selectedYear) {
				var maxYear = Math.max.apply(Math, _toConsumableArray(yearsArr));
				files.selectedYear = years.querySelector(
					".year li[value='" + maxYear + "']"
				);
			} else {
				var _year = files.selectedYear.value;
				files.selectedYear = years.querySelector(
					".year li[value='" + _year + "']"
				);
			}

			selected.year = files.selectedYear;
			this.select(files.selectedYear);
			var result = document.querySelector(".result");

			result.onclick = function(e) {
				return _this.nextMap.call(area[selected.form], e);
			};
		},
		select: function select(e) {
			var target = e.target || e;

			var name = target.name || target.parentElement.className;
			if (
				!(
					name == "year" ||
					name == "month" ||
					name == "day" ||
					name == "satBox"
				)
			)
				return;
			/*if (target.classList && target.classList.contains ('selected')) {
				return;
			}*/

			var calendar = service.calendar;
			var form = selected.form;

			if (name != "satBox") {
				var sat = calendar.querySelector(".satBox");
				if (sat) sat.remove();
			}

			var selectedDate = selected[name] || selected[name].obj;

			if (selectedDate && name == selectedDate.parentElement.className) {
				selectedDate.classList.remove("selected");
				selectedDate.classList.remove("missing");
			}

			selected[name] = target.obj || target;

			switch (name) {
				case "year": {
					var box = calendar.querySelector(".monthsBox");

					if (!box) {
						var monthsBox = document.createElement("div");
						monthsBox.className = "monthsBox";
						var months = document.createElement("ul");
						months.className = "month";
						var i = 12;

						while (i--) {
							var month = document.createElement("li");
							month.textContent = this.month[i];
							month.setAttribute ('data-value', i);
							months.prepend(month);
						}

						monthsBox.append(months);
						calendar.append(monthsBox);
					}

					if (box) {

						var _i2 = box.firstChild.childNodes.length;

						while (_i2--) {
							box.firstChild.childNodes[_i2].className = "";
						}
					}

					var year = target.value;
					var includeMonths = this[year];

					for (var _month in includeMonths) {
						if (!isNaN(+_month)) {
							calendar.querySelector('.month li[data-value="' + _month + '"]').classList.add("include");
						}
					}

					if (!this[year]) {
						this.selectedYear = selected[name] = target;
						return this.select({
							name: "month",
							dataset: {value: "0"},
							obj: target
						});
					} else if (this[year] && !this[year].selectedMonth) {
						var maxMonth = Math.max.apply(
							Math,
							_toConsumableArray(Object.keys(this[year]))
						);
						this[year].selectedMonth = calendar.querySelector(
							".month li[data-value='" + maxMonth + "']"
						);
					} else {
						var _month2 = this[year].selectedMonth;
						this[year].selectedMonth = calendar.querySelector(
							".month li[data-value='" + _month2.getAttribute ('data-value') + "']"
						);
					}

					this.selectedYear = target;
					selected.month = this[year].selectedMonth;
					target = null;
				}

				case "month": {
					var _box = calendar.querySelector(".daysBox");

					if (_box) _box.remove();
					var daysBox = document.createElement("table");
					daysBox.className = "daysBox";
					var header = document.createElement("tr");
					header.className = "header";
					var _i3 = 7;

					while (_i3--) {
						var cell = document.createElement("td");
						cell.textContent = this.week[_i3];
						header.prepend(cell);
					}

					daysBox.append(header);
					if (daysBox.tBodies[0]) daysBox.tBodies[0].remove();
					var tBody = document.createElement("tBody");
					var rows = 6;

					while (rows--) {
						var row = document.createElement("tr");
						row.className = "day";
						var _i4 = 7;

						while (_i4--) {
							var _cell = document.createElement("td");

							row.append(_cell);
						}

						tBody.append(row);
					}

					daysBox.append(tBody);
					calendar.append(daysBox);
					var _year2 = this.selectedYear.value;

					var _month3 = target
						? target.getAttribute && target.getAttribute ('data-value')
						: this[_year2].selectedMonth.getAttribute ('data-value');

					var date = new Date(_year2, _month3, 1);
					var day = date.getDay() - 1;
					var firstDay = day == -1 ? 6 : day;
					var lastDay = new Date(
						new Date(_year2, _month3 + 1, 1) - 1
					).getDate();
					var week = 1;
					var monthDay = 1;
					var weekDay = firstDay;

					days: while (daysBox.rows[week]) {
						var _row = daysBox.rows[week];

						while (_row.cells[weekDay]) {
							var _cell2 = _row.cells[weekDay];
							_cell2.textContent = _cell2.title = monthDay++;
							if (monthDay > lastDay) break days;
							weekDay++;
						}

						week++;
						weekDay = 0;
					}

					if (
						this[_year2] &&
						this[_year2][_month3] &&
						!this[_year2][_month3].selectedDay
					) {
						var maxDay = Math.max.apply(
							Math,
							_toConsumableArray(Object.keys(this[_year2][_month3]))
						);
						this[_year2][_month3].selectedDay = calendar.querySelector(
							".day td[title='" + maxDay + "']"
						);
					} else {

						if (!this[_year2] || !this[_year2][_month3])
							return this.showImg(null, target);
						var _day = this[_year2][_month3].selectedDay;
						this[_year2][_month3].selectedDay = calendar.querySelector(
							".day td[title='" + _day.title + "']"
						);
					}

					selected.day = this[_year2][_month3].selectedDay;
					this[_year2].selectedMonth = selected.month =
						target || this[_year2].selectedMonth;
					var includeDays = this[_year2][_month3];

					for (var _day2 in includeDays) {
						if (!isNaN(+_day2)) {
							calendar
								.querySelector(".day td[title='" +_day2 + "']")
								.classList.add("include");
						}
					}

					target = null;
				}

				case "day": {
					var _year3 = selected.year.value;
					var _month4 = selected.month.getAttribute ('data-value');

					if (
						target &&
						(!this[_year3] ||
							!this[_year3][_month4] ||
							!this[_year3][_month4][target.title])
					) {
						return this.showImg(null, target);
					}

					var selectedDay = (this[_year3][_month4].selectedDay = selected.day =
						target || this[_year3][_month4].selectedDay);
					var _day3 = selectedDay.title;
					var filesSat = this[_year3][_month4][_day3];

					if (!filesSat.file) {
						var satBox = document.createElement("div");
						satBox.className = "satBox";

						for (var _sat in filesSat) {
							if (filesSat[_sat].nodeType) continue;
							var div = document.createElement("div");
							div.className = "satelite";
							div.textContent = div.title =
								filesSat[_sat].sat + filesSat[_sat].dip;
							satBox.append(div);

							if (!filesSat.selectedSat) {
								filesSat.selectedSat = selected.satBox = satBox.querySelector(
									"div[title='" + div.title + "']"
								);
							}
						}

						calendar.append(satBox);
					} else {
						if (!filesSat.selectedSat) {
							filesSat.selectedSat = selected.satBox = selected.day;
						}
					}

					target = null;
				}

				case "satBox": {
					var _year4 = selected.year.value;
					var _month5 = selected.month.getAttribute ('data-value');
					var _day4 = selected.day.title;

					var _sat2 =
						(target && target.title) ||
						this[_year4][_month5][_day4].selectedSat.title;

					var selectedSat = (this[_year4][_month5][
						_day4
					].selectedSat = selected.satBox =
						target || calendar.querySelector("div[title='" + _sat2 + "']"));
					var file =
						(this[_year4][_month5][_day4][_sat2] &&
							this[_year4][_month5][_day4][_sat2].file) ||
						this[_year4][_month5][_day4].file;

					for (var elem in selected) {
						if (
							!selected[elem] ||
							!selected[elem].nodeType ||
							elem == "satFilter"
						)
							continue;
						selected[elem].classList.add("selected");
					}

					this.showImg(file, selected.satBox);
					area[this.name].satFilter();
				}
			}
		},
		showImg: function showImg(file, target) {
			var fileObj;

			if (_typeof(file) == "object" && file != null) {
				fileObj = file;
				file = file.filename;
			} else if (this.files) {
				fileObj = this.files.find(function(e) {
					return e.filename == file;
				});
			}

			if (target && target.obj) target = target.obj;
			var result = document.querySelector(".result a");
			result.classList.add("loading");
			var resImg = result.querySelector("img");
			resImg.addEventListener("load", loading);
			var form = selected.form;

			function loading() {
				result.classList.remove("loading");
			}

			if (!file) {
				result.href = "#";
				resImg.src = "ice/NoData.png";
				target.classList.add("missing");
				area[this.name].satFilter();
				return;
			} else {
				selected.file = file;
				this.selectedFile = file;
				var str = "ice/"+ form+ "/";
				var name = file.slice(0, -4);
				var ext = file.slice(-4);
				var full = str + file;
				var ql = str + name + "_ql" + ext;
				var kmz = str + name + ".kmz";
				var pre = document.body.querySelector(".kmz");
				if (pre) pre.remove();
				var request = new XMLHttpRequest();
				request.open("GET", ql);
				request.send();

				var ajax = function ajax() {

					if (this.status == 200) {
						resImg.src = ql;
						result.href = full;
					} else {
						resImg.src = full;
						result.href = full;
					}
				};

				request.addEventListener("loadend", ajax);
				var requestKMZ = new XMLHttpRequest();
				requestKMZ.open("GET", kmz);
				requestKMZ.send();

				var ajaxKMZ = function ajaxKMZ() {
					if (this.status == 200) {
						var a = document.createElement("a");
						a.className = "kmz";
						a.href = kmz;
						a.textContent = kmz;
						result.parentElement.after(a);
					}
				};

				requestKMZ.addEventListener("loadend", ajaxKMZ);
			}

			if (selected.form == "yak" || selected.form == "def") {
				var elements = Array.from(document.forms[form].elements);
				elements.forEach(function(elem) {
					var opt = elem.options;
					var i = opt.length;

					while (i--) {
						if (opt[i].value == fileObj[elem.name]) {
							opt[i].selected = true;
						}
					}
				});
			}
		},
		nextMap: function nextMap(e) {

			if (e.target.classList.contains("button")) {
				var form = selected.form;
				var file = selected.file;
				var arr = selected.arr;

				var calendar = this.calendar;
				var k;
				e.target.classList.contains("right") ? (k = 1) : (k = -1);
				var index = arr.indexOf(file) + k;
				var newMap = arr[index];

				if (newMap) {
					if (form == "yak" || form == "def") {
						this.showImg(newMap, null);
						return;
					}

					var cuts = service[form].cuts;
					var year, month, day, sat, dip;
					cuts[0][1] == 2
						? (year = "20" + newMap.substr.apply(newMap, _toConsumableArray(cuts[0])))
						: (year = newMap.substr.apply(newMap, _toConsumableArray(cuts[0])));
					month = newMap.substr.apply(newMap, _toConsumableArray(cuts[1])) - 1;
					day = +newMap.substr.apply(newMap, _toConsumableArray(cuts[2]));
					if (cuts[3])
						sat = newMap.substr.apply(newMap, _toConsumableArray(cuts[3]));
					if (cuts[4])
						dip = newMap.substr.apply(newMap, _toConsumableArray(cuts[4]));

					if (selected.year.value != year) {

						this.select(calendar.querySelector(".year li[value='" + year + "']"));
						return;
					}

					if (selected.month.getAttribute ('data-value') != month) {

						this.select(
							calendar.querySelector(".month li[data-value='" + month + "']")
						);
						return;
					}

					if (selected.day.title != day) {

						this.select(calendar.querySelector(".day td[title='" + day + "']"));
						return;
					}

					if (selected.satBox.title != sat + dip) {

						this.select(
							calendar.querySelector(".satBox div[title='" + sat + dip + "']")
						);
						return;
					}
				}
			}
		},
		initialForm: function initialForm() {
			var form = document.forms[selected.form];
			var select = Array.from(form.elements); // Сбрасываем масив имен файлов

			this.files = []; // Создаем массив разбитых по, соответствующим именам селектов, частям имен файлов

			this.arr.forEach(function(value) {
				var i = select.length;
				var obj = {};

				while (i--) {
					var val = value.substr.apply(value, this[form.name].cuts[i]);
					var parse = parseInt(val);
					obj[select[i].name] = parse ? parse : val;
				}

				obj.filename = value;
				this.files.push(obj);
			}, this); // Сортируем и отрисовываем уникальные значения имен каждого селекта

			var i = select.length;

			var _loop = function _loop() {
				// Сортируем обьекты по значениям имен свойств, соответствующих именам селектов
				var elem = select[i].name;
				this.files.sort(function(a, b) {
					if (+b[elem] > +a[elem]) return -1;
					if (+b[elem] < +a[elem]) return 1;
					else return 0;
				}); // Сбрасываем значения

				select[i].innerHTML = "";
				var temp = void 0; // Здесь будет храниться каждое предыдущее значение для сравнения

				if (select[i].name == "day") temp = 0;
				this.files.forEach(function(value) {
					var val = value[elem];

					if (val != temp) {
						// Добовляем отсутствующие значения, если значение числовое
						var diff = val - temp; // Если разница между значениями больше 1-го, то создаем и добавляем недостающие <option> с классом "missing", использованна префиксная форма инкремента, для исключения лишних значений, например при разнице в два, на самом деле не хватает 1-го элемента

						if (diff > 1)
							while (--diff) {
								var missOption = document.createElement("option");
								missOption.className = "missing";
								missOption.value = ++temp;
								select[i].append(missOption);
							} // Добовляем текущее значение после того как дорисовали недостающие и помещаем его в temp

						var currentOption = document.createElement("option");
						currentOption.value = val;
						select[i].append(currentOption);
						temp = val;
					}
				}); // Отрисовываем значения в опциях

				var option = select[i].options;
				{
					var _i = option.length;

					while (_i--) {
						var val = option[_i].value;

						switch (elem) {
							case "month":
								if (val > 4 && val < 11) option[_i].remove();
								else option[_i].textContent = this.month[val - 1];
								break;

							case "char":
								option[_i].textContent = this.def.types[val - 1];
								break;

							case "char_r":
								option[_i].textContent = this.yak.types[val - 1];
								break;

							case "year":
								option[_i].textContent = val < 100 ? "20" + val : val;
								break;

							case "day":
								option[_i].textContent = val < 10 ? "0" + +val : val;
								break;

							default:
								option[_i].textContent = val;
						}
					}
				}
				var meta = document.createElement("option");
				meta.className = "missing";
				meta.value = 0;
				meta.textContent = "Выберите";
				meta.selected = true;
				select[i].prepend(meta);
			};

			while (i--) {
				_loop.call(this);
			}

			form.addEventListener("change", this.selectOptions);
			form.addEventListener("mouseover", this.chose.bind(this), true);
			var lastIndex = this.files.length - 1;
			this.showImg(this.files[lastIndex], null);
		},
		selectFilter: function selectFilter(checked, files) {

			files = files.filter(function(obj) {
				var i = checked.length;

				while (i--) {
					var name = checked[i].parentElement.name;
					var val = checked[i].value;
					
					if (val != 0 && val != obj[name]) return false;
				}

				return true;
			});

			return files;
		},
		selectOptions: function selectOptions(e) {
			if (e.target.tagName != "SELECT") return; // Находим форму на которой была вызвана функция и Берем массив имен файлов, соответствующий данной форме

			var form = this.closest("form");
			var files = area[form.name].files; // Находим в форме все выбранные опции


			var checked = Array.from(form.querySelectorAll("option:checked")); // Фильтруем массив с файлами, в соответствии со значениями выбранных опций

			files = area[form.name].selectFilter(checked, files); // Проходим по селектам и перерисовываем отсутствующие опции

			var i = form.elements.length;

			var _loop2 = function _loop2() {
				var select = form.elements[i];
				var name = select.name; // Создаем вспомогательный массив из всех значений подимен файлов соответствующих имени селекта

				var arr = Array.from(files, function(value) {
					return value[name];
				}); // Проходим по всем опциям в данном селекте

				Array.from(select.options).forEach(function(option) {
					if (
						arr.some(function(value) {
							return value == option.value;
						})
					)
						option.className = "";
					else option.className = "missing";
				});
			};

			while (i--) {
				_loop2();
			} // Если осталось одно значение в отфильтрованом массиве или все выбранные значения не имеют класс 'missing'
			// Запрашиваем наличие файлов на сервере, quiq_look, если отсутствует - полноразмерный, либо в формате .png
			// И отрисовываем картинку в result

			if (
				files.length == 1 ||
				checked.every(function(opt) {
					return opt.className != "missing";
				})
			) {
				area[form.name].showImg(files[0], null);
			} 

			// При наведении на select, массив именн сортируется игнорируя текущюю выбранную опцию селекта
			// и отрисовываються возможные значния, событие назначено через setTimeout,
			// т.к при клике на селект не успевает отрисоваться select
			//setTimeout (() => area[form.name].chose (e, area[form.name]), 0);
		},
		chose: function chose(e) {
			if (e.target.tagName != "SELECT") return;
			var files = this.files;
			var form = document.forms[this.name];

			var checked = Array.from(form.querySelectorAll("option:checked"));
			var options = Array.from(e.target.options);
			checked = checked.filter(function(opt) {
				return opt.value != e.target[e.target.selectedIndex].value;
			});
			files = this.selectFilter(checked, files);
			options.forEach(function(elem) {
				var i = files.length;

				while (i--) {
					if (elem.value > files[i][e.target.name]) {
						elem.classList.add("missing");
						return;
					}

					if (elem.value == files[i][e.target.name]) {
						elem.className = "";
						return;
					}
				}
			});
		},
		satFilter: function satFilter() {
			var _this2 = this;

			var satFilter = document.body.querySelector(".satFilter");

			if (this.name == "sat2") {
				var filter = function filter(e) {
					var _this3 = this;

					var checkedSatCheckboxes = Array.from(
						selected.satFilter.querySelectorAll(
							'input[type="checkbox"]:checked'
						)
					);
					var checkedSats = checkedSatCheckboxes.map(function(e) {
						return e.value;
					});
					var filteredSats = this.mainArr.filter(function(f) {
						return checkedSats.some(function(e) {
							return (
								e == f.substr.apply(f, _toConsumableArray(_this3.sat2.cuts[3]))
							);
						});
					});
					area[this.name] = new Area(filteredSats, this.name);
					area[this.name].initialCalendar();
					selected.satFilter = satFilter;
				};

				if (satFilter) {
					this.calendar.querySelector(".daysBox").after(satFilter);
					return;
				}

				if (selected.satFilter) {
					this.calendar.querySelector(".daysBox").after(selected.satFilter);
					return;
				}

				satFilter = document.createElement("div");
				satFilter.className = "satFilter";
				this.calendar.querySelector(".daysBox").after(satFilter);
				var sats = [];
				this.arr.forEach(function(e) {
					var sat = e.substr.apply(
						e,
						_toConsumableArray(_this2[_this2.name].cuts[3])
					);
					if (sats.indexOf(sat) == -1) sats.push(sat);
				});
				sats.forEach(function(e) {
					var label = document.createElement("label");
					label.textContent = e;
					label.htmlFor = e;
					var input = document.createElement("input");
					input.type = "checkbox";
					input.checked = true;
					input.value = e;
					input.id = e;
					label.append(input);
					satFilter.append(label);
				});
				selected.satFilter = satFilter;
				satFilter.addEventListener("change", filter.bind(this));
			} else if (satFilter) {
				satFilter.remove();
			}
		}
	};
	service.calendar.addEventListener("click", function(e) {
		area[selected.form].select(e);
	});
	var area = {}; // Объект с данными форм

	var selected = {}; // Объект для выбранных параметров

	Area.prototype = Object.create(service);

	function Area(arr, name) {
		var _this4 = this;

		this.arr = arr;
		this.mainArr = arr;
		this.name = name;
		if (this[name].sort)
			this.arr.sort(function(x, y) {
				return (
					+x.substr.apply(x, _toConsumableArray(_this4[name].sort)) -
					+y.substr.apply(y, _toConsumableArray(_this4[name].sort))
				);
			});
		selected.form = name;
		selected.arr = arr;
		var cuts = this[name].cuts;
		this.arr.forEach(function(elem) {
			var data = {};
			data.year =
				cuts[0][1] == 2
					? "20" + elem.substr.apply(elem, _toConsumableArray(cuts[0]))
					: elem.substr.apply(elem, _toConsumableArray(cuts[0]));
			data.month = elem.substr.apply(elem, _toConsumableArray(cuts[1])) - 1;
			data.day = +elem.substr.apply(elem, _toConsumableArray(cuts[2]));
			data.date = new Date(data.year, data.month, data.day);
			data.file = elem;
			if (cuts[3])
				data.sat = elem.substr.apply(elem, _toConsumableArray(cuts[3]));
			if (cuts[4])
				data.dip = elem.substr.apply(elem, _toConsumableArray(cuts[4]));
			if (!_this4[data.year]) _this4[data.year] = {};
			if (!_this4[data.year][data.month]) _this4[data.year][data.month] = {};
			if (!_this4[data.year][data.month][data.day])
				_this4[data.year][data.month][data.day] = {};
			if (!data.sat) _this4[data.year][data.month][data.day] = data;
			else _this4[data.year][data.month][data.day][data.sat + data.dip] = data;
		});
	}

	return function(arr, form) {
		// Если объекта формы нет, модуль возвращает новый
		var name = form.id;

		if (!area[name]) {
			area[name] = new Area(arr, name);
		}

		selected.arr = area[name].arr;
		selected.form = form.id;

		if (form.id == "sat" || form.id == "sat2") {
			area[name].initialCalendar();
		} else {
			area[name].initialForm();
		}
	};
})();
