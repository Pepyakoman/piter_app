'use strict';

var piter = {
	months: ['Январь', 'Февраль', 'Март', 'Апрель',,,,,,, 'Ноябрь', 'Декабрь'],
	def: ['Сплоченность', 'Форма льда', 'Возраст'],
	yak: ['Карты вероятности встречи (в %) со льдом (кромки льда)', 'Карты вероятности встречи (в %) со льдом сплоченностью 7 и более баллов', 'Карты вероятности встречи (в %) с крупными формами льда', 'Карты вероятности встречи (в %) с преобладающим однолетним льдом'],
	forms: {
		def: { cuts: [[0, 1], [2, 4], [7, 2]] },
		yak: { cuts: [[2, 1], [4, 2], [-5, 1]] },
		sat: { cuts: [[2, 4], [7, 2], [10, 1]] },
		sat2: { cuts: [[3, 2], [5, 2], [7, 2], [0, 3], [-7, 3]] }
	},
	render: function render(arr, formName) {
		console.log (piter)
		piter.selectedForm = formName;
		var select = Array.from(formName.elements);
		var form = piter.forms[formName.name];
		// Сбрасываем масив имен файлов
		form.files = [];
		// Создаем массив разбитых по, соответствующим именам селектов, частям имен файлов
		arr.forEach(function (value) {

			var i = select.length;
			var obj = {};
			while (i--) {
				var val = value.substr.apply(value, form.cuts[i]);
				var parse = parseInt(val);
				obj[select[i].name] = parse ? parse : val;
			}
			obj.filename = value.slice(0, -4);
			form.files.push(obj);
		});

		// Сортируем и отрисовываем уникальные значения имен каждого селекта
		var i = select.length;

		var _loop = function _loop() {
			// Сортируем обьекты по значениям имен свойств, соответствующих именам селектов
			var elem = select[i].name;
			form.files.sort(function (a, b) {
				if (b[elem] > a[elem]) return -1;
				if (b[elem] < a[elem]) return 1;
				else return 0;
			});

			// Сбрасываем значения
			select[i].innerHTML = '';

			var temp = void 0; // Здесь будет храниться каждое предыдущее значение для сравнения
			if (select[i].name == 'day') temp = 0;
			form.files.forEach(function (value) {

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
							if (val > 4 && val < 11) option[_i].remove();else option[_i].textContent = piter.months[val - 1];
							break;
						case 'char':
							option[_i].textContent = piter.def[val - 1];
							break;
						case 'char_r':
							option[_i].textContent = piter.yak[val - 1];
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
			_loop();
		}

		select.forEach(function (sel) {
			return sel.addEventListener('change', piter.selectForm);
		});
		select.forEach(function (sel) {
			return sel.addEventListener('mouseover', piter.chose);
		});

		piter.showImg (formName, form.files);
	},
	selectFilter: function selectFilter(checked, files) {
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
	selectForm: function select() {
		// Находим форму на которой была вызвана функция и Берем массив имен файлов, соответствующий данной форме
		var form = this.closest('form');
		var files = piter.forms[form.name].files;
		// Находим в форме все выбранные опции
		var checked = Array.from(form.querySelectorAll('option:checked'));

		// Фильтруем массив с файлами, в соответствии со значениями выбранных опций
		files = piter.selectFilter(checked, files);

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
				})) option.className = '';else option.className = 'missing';
			});
		};

		while (i--) {
			_loop2();
		}
		// Если осталось одно значение в отфильтрованом массиве или все выбранные значения не имеют класс 'missing'
		// Запрашиваем наличие файлов на сервере, quiq_look, если отсутствует - полноразмерный, либо в формате .png
		// И отрисовываем картинку в result
		
		if (files.length == 1 || checked.every(function (opt) {
			return opt.className != 'missing';
		})) {
			piter.showImg (form, files);
		}
	},
	showImg: function showImg (form, files) {
		console.log (files[files.length - 1])
		piter.selectedFile = files[files.length - 1];
		var str = 'ice/' + form.name + '/' + files[files.length - 1].filename;

		var full = str + '.jpg';
		var png = str + '.png';
		var ql = str + '_ql.jpg';

		var result = document.querySelector('.result a');
		var resImg = result.querySelector('img');
		var request = new XMLHttpRequest();
		request.open('GET', ql, false);
		request.send();
		if (request.status == 200) {
			resImg.src = ql;
			result.href = full;
		} else {
			request.open('GET', full, false);
			request.send();
			if (request.status == 200) {
				resImg.src = full;
				result.href = full;
			} else {
				request.open('GET', png, false);
				request.send();
				if (request.status == 200) {
					resImg.src = png;
					result.href = png;
				} else resImg.src = 'ice/NoData.png';
			}
		}
		var elements = Array.from (form.elements);
		elements.forEach (function (elem) {
			var opt = elem.options;
			var i = opt.length;
			while (i--) if (opt[i].value == files[files.length - 1][elem.name]) {
				opt[i].selected = true;
			}
		})		
	},
	chose: function chose() {
		console.log (this)
		var _this = this;

		// При наведении на select, массив именн сортируется игнорируя текущюю выбранную опцию селекта
		// и отрисовываються возможные значния, событие назначено на mouseover, а не на click,
		// т.к при клике селект не успевает отрисоваться select
		var form = this.closest('form');
		var files = piter.forms[form.name].files;
		var checked = Array.from(form.querySelectorAll('option:checked'));
		var options = Array.from(this.options);

		checked = checked.filter(function (opt) {
			return opt.value != _this[_this.selectedIndex].value;
		});
		files = piter.selectFilter(checked, files);

		options.forEach(function (elem) {
			var i = files.length;
			while (i--) {
				if (elem.value == files[i][_this.name]) elem.className = '';
			}
		});
	}
};