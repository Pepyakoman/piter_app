<!DOCTYPE HTML>
<HTML>
<head>
<TITLE>Режим и изменчивость состояния ледяного покрова залива Петра Великого</TITLE>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=utf-8" />
<link rel="stylesheet" href="style.css" />
<script src="js/polyfill.js"></script>
</head>
<?php

	set_time_limit(0);
	error_reporting(E_ALL & ~E_NOTICE);

	$starttime = microtime(true);


	include ("include.php");

	$months = array(1 => 'январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь');
?>

<BODY onload="document.body.querySelector ('#sat2').checked = true; modul (<?php echo scandirectory ('sat2') ?>, {id: 'sat2'});">
<h2>Режим и изменчивость состояния ледяного покрова залива Петра Великого</h2>
	<p class="eisp">Электронное информационно-справочное пособие (ЭИСП)</p>
	<hr size="4" color="#C0C0C0" />
	<div class="topMenu"><a href="./index.php"><b>Главная страница</b></a> | <a href="./authors.html">Авторы</a> | <a href="./description.html">Аннотация</a> | <a href="./list.html">Содержание</a> | <a href="./data.html">Архив данных</a> | <a href="./settings.html">Настройка</a> | <a href="http://pacificinfo.ru">Pacificinfo.ru</a></div>

	<div class="result">
				
				<? annotation(); ?>
				
				<? $result = GMapDrawMap(); if($result) echo $result; ?>
	</div>
	
<br>
	
	<form name="tabs">
	<section>
	
		<input type="radio" class = "first" id="def"  name="radiobutton" onclick="modul(<?php echo scandirectory ('def') ?>, this)"/>
		<label for="def" class="tabs">Характеристики</label>
		<input type="radio" class = "second" id="yak" name="radiobutton" onclick="modul(<?php echo scandirectory ('yak') ?>, this)"/>
		<label for="yak" class="tabs">Карты Якунин</label>
		<input type="radio" class = "third" id="sat" name="radiobutton" onclick="modul(<?php echo scandirectory ('sat') ?>, this)"/>
		<label for="sat" class="tabs">Спутник</label>
		<input type="radio" class = "forth" id="sat2" name="radiobutton" onclick="modul(<?php echo scandirectory ('sat2') ?>, this)" checked/>
		<label for="sat2" class="tabs">Спутник 2</label>
	</form>
	
	<article class = "first-article">
		<form name="def">
			<div class = "tab_header">
				Выберите характеристику, период наблюдений
				<hr />
				<div class="tab_inner">
					<div class="select">Характеристика: <select name="char"></select></div>
					<div class="select">Год: <select name="year"></select></div>
					<div class="select">Декада: <select name="decade"></select></div>
				</div>
			</div>
		</form>
	</article>

	<article class = "second-article">
		<form name="yak" method="get">
			<div class = "tab_header">
				Обобщенные карты (Якунин Л.П., 2012)
				<hr />
				<div class="tab_inner">
					<div class="select">Тип карты: <select name="char_r"></select></div>
					<div class="select">Месяц: <select name="month"></select></div>
					<div class="select">Декада: <select name="decade"></select></div>
				</div>
			</div>
		</form>
	</article>

	<article class = "forth-article">
		<form id="sat2" name="sat2">
			<div class="calendar"></div>
		</form>
	</article>
</section>

<div class="yearBox"></div>
			
<br>
<strong><a href="./list.html#diag">Многолетние изменения ледовитости</a></strong>
			<div class="copyright">
				<div>Copyright © <? echo date ("Y"); ?> by V.I. Ilichev Pacific Oceanological Institute</div>
				<div style="font-size:70%;"><?$endtime = microtime(true);echo number_format($endtime - $starttime, 2) . " c.";?></div>
			</div>


</BODY>
<script src="js/areaES6.js"></script>
<script src="js/components/dropMenu.js"></script>
</HTML>
