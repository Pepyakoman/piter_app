<?php

mb_internal_encoding ('UTF-8');

/* ==================================================================== */
/*      _POST array contains the HTTP GET or POST parameters.  */
/* ==================================================================== */
$_GET  = array_map("strip_tags", $_GET);
$_GET  = array_map("chop", $_GET);
$_GET  = array_map("trim", $_GET);
$_GET  = array_map("addslashes", $_GET);
$_GET  = array_map("htmlspecialchars", $_GET);
$_POST = array_map("strip_tags", $_POST);
$_POST = array_map("chop", $_POST);
$_POST = array_map("trim", $_POST);
$_POST = array_map("addslashes", $_POST);
$_POST = array_map("htmlspecialchars", $_POST);

if (sizeof($_POST) > 0)
  $_POST = $_POST;
else if (sizeof($_GET) > 0)
  $_POST = $_GET;
else
  $_POST = array("");


/* ==================================================================== */
/* Find out whether GIF is supported... if not falback on PNG/JPG       */
/* ==================================================================== */
/*if (strpos( ms_GetVersion(), "OUTPUT=GIF") > 0 )
{
  $gAppletImgFmt = MS_GIF;
  $gImagesFmt = MS_GIF;
}
else
{
  $gAppletImgFmt = MS_JPEG;
  $gImagesFmt = MS_PNG;
}
*/

/************************************************************************/
/*                        function GMapDrawMap()                        */
/*                                                                      */
/*      Funcion to draw the contains of the map.                        */
/************************************************************************/

function scandirectory ($str) {
	$directory = 'ice/'.$str.'/';
	$scandir = scandir ($directory);
	$toJS = '[';
    foreach ($scandir as $value) {
    	// Отфильтровываем ненужные значения, такие как 'точка', 'две точки' и имен с суфиксом 'ql' (quick look)
    	if ($value == '' || $value == '.' || $value == '..' || strpos ($value, '_ql') || strpos ($value, '.kmz')) continue;
    	$toJS = $toJS. "'" .$value. "',";
    }
    $toJS = $toJS. "]";
    return $toJS;
}

function scandirectory_sat1 () {
	$directory = 'ice/sat/';
	$scandir = scandir ($directory);
	return $scandir;
}

function scandirectory_def ()
{
	$directory = 'ice/def/';
	$scandir = scandir ($directory);

	$data = array();
	$year = array();
	$decade = array();
	
	
	$temp;

	foreach ($scandir as $value) {
		if ($_POST['char'] == substr($value, 0, 1)) {
			$year[] = substr ($value, 2, 4);
			$temp[] = $value;
		} 
	}
	foreach ($temp as $value) {
		if ($_POST['year'] == substr($value, 2, 4)) {
			$decade[] = substr ($value, 7) - '.png';
		} 
	}
	
	$year = array_unique ($year);
	$year = array_values ($year);
	$decade = array_unique ($decade);
	sort ($decade);
	$decade = array_values ($decade);
	
	$data['year'] = $year;
	$data['decade'] = $decade;
	
	return $data;
}

function scandirectory_sat ()
{
	$directory = 'ice/sat/';
	$scandir = scandir ($directory);

	$data_s = array();
	$year = array();
	$decade = array();
	$month = array();
	$temp = array();
	
	foreach ($scandir as $value) {
			$year[] = substr ($value, 2, 4);
	}
	foreach ($scandir as $value) {
		if ($_POST['year_s'] == substr ($value, 2, 4)) {
			$month[] = substr ($value, 7, 2);
			$temp[] = $value;
		}
	}
	foreach ($temp as $value) {
		if ($_POST['month_s'] == substr ($value, 7, 2)) {
			$decade[] = rtrim (substr ($value, 10, 2), ".");
		}
	}
	
	$year = array_unique ($year);
	$year = array_values ($year);
	$month = array_unique ($month);
	$month = array_values ($month);
	$decade = array_unique ($decade);
	sort ($decade);
	$decade = array_values ($decade);
	
	$data_s['year_s'] = $year;
	$data_s['month_s'] = $month;
	$data_s['decade_s'] = $decade;
	
	return $data_s;
}

function scandirectory_main () 
{
	$directory = 'ice/sat2/';
	$scandir = scandir ($directory);
	for ($i = 0; $scandir[$i]; $i++) {
		if (strripos ($scandir[$i], '_ql')) unset ($scandir[$i]); 	
	}
	array_values ($scandir);
	if (!function_exists('func')) {
		function func($a, $b){
			if (substr ($a, 3, 6) == substr($b, 3, 6)) {
				return 0;
			}
			return (substr ($a, 3, 6) < substr($b, 3, 6)) ? -1 : 1;
		};
	};
	usort ($scandir, "func");
	return end($scandir);
}

function GMapDrawMap()
{
	if (count($_POST) > 6 || $_POST['decade'] || $_POST['decade_s'] || $_POST['decade_r'] || $_POST['dip_s2']) {
		
		if ($_POST['decade']){
			$filename = '<a href="ice/def/'. $_POST['char'] . '_' . $_POST['year'] . '_' . $_POST['decade'] . '.png" target="_blank" rel="noopener noreferrer"><img src="ice/def/'. $_POST['char'] . '_' . $_POST['year'] . '_' . $_POST['decade'] . '.png" width=900 height=480></a>';
			$nofile = '<img src="ice/NoData.png" width=900 height=480>';
			$file = 'ice/def/'. $_POST['char'] . '_' . $_POST['year'] . '_' . $_POST['decade'] . '.png';
			if(file_exists ($file)) {
				echo $filename;
			} else {
				echo $nofile;
			}
		} 
		
		$data_char_r = $_POST['char_r'];
		if ($_POST['decade_r']){
			$filename = '<a href="ice/reg/r_'. $data_char_r . '_' . $_POST['month_r'] . '_' . $_POST['decade_r'] . '.png" target="_blank" rel="noopener noreferrer"><img src="ice/reg/r_'. $data_char_r . '_' . $_POST['month_r'] . '_' . $_POST['decade_r'] . '.png" width=900 height=480></a>';
			$nofile = '<img src="ice/NoData.png" width=900 height=480>';
			$file = 'ice/reg/r_'. $data_char_r . '_' . $_POST['month_r'] . '_' . $_POST['decade_r'] . '.png';
			if(file_exists ($file)) {
				echo $filename;
			}else{
				echo $nofile;
			}
		}

		 if ($_POST['decade_s']){
			$filename = '<a href="ice/sat/s_'. $_POST['year_s'] . '_' . $_POST['month_s'] . '_' . $_POST['decade_s'] . '.jpg" target="_blank" rel="noopener noreferrer"><img src="ice/sat/s_'. $_POST['year_s']  . '_' . $_POST['month_s'] . '_' . $_POST['decade_s'] . '.jpg" width=900 height=480></a>';
			$nofile = '<img src="ice/NoData.png" width=900 height=480>';
			$file = 'ice/sat/s_'. $_POST['year_s']  . '_' . $_POST['month_s'] . '_' . $_POST['decade_s'] . '.jpg';
			if(file_exists ($file)) {
				echo $filename;
			}else{
				echo $nofile;
			}
		}
		
		if ($_POST['dip_s2']){
			$filename = '<a href="ice/sat2/'. $_POST['sat_s2'] . '' . $_POST['year_s2'] . '' . $_POST['month_s2'] . '' . $_POST['day_s2'] . '' . $_POST['dip_s2'] . '.jpg" target="_blank" rel="noopener noreferrer"><img src="ice/sat2/'. $_POST['sat_s2'] . '' . $_POST['year_s2'] . '' . $_POST['month_s2'] . '' . $_POST['day_s2'] . '' . $_POST['dip_s2'] . '.jpg" width=900 height=480></a>';
			$nofile = '<img src="ice/NoData.png" width=900 height=480>';
			$file = 'ice/sat2/'. $_POST['sat_s2'] . '' . $_POST['year_s2'] . '' . $_POST['month_s2'] . '' . $_POST['day_s2'] . '' . $_POST['dip_s2'] . '.jpg';
			
			if(file_exists ($file)) {
				echo $filename;
				if (str_replace ('.jpg', '.kmz', $filename)) echo '<br><a href="'. str_replace ('.jpg', '.kmz', $file) .'">'. str_replace ('.jpg', '.kmz', $file) .'</a>';
			}else{
				echo $nofile;
			}
		}

    } else {
    	$filename = "main";
    }
    
    if(!$result_filename && $filename !== "main")
    	return;

   

    if($filename == "main" ) {
    	echo '<div class="button left"></div><a href="ice/sat2/'. scandirectory_main () .'" target="_blank" rel="noopener noreferrer"><img src="ice/sat2/'. str_replace ('.jpg', '_ql.jpg', scandirectory_main ()) .'" width=900 height=480></a><div class="button right"></div>';
		
    } else {
	    $url = $filename;
    }
}

function annotation () {

	if ($_POST['decade'] && scandirectory_def ()) {
		
		$def = array(1 => 'Сплоченность','Форма льда','Возраст');
		$months = array(1 => 'Январь', 4 => 'Февраль', 7 => 'Март', 10 => 'Апрель', 13 => 'Май', 16 => 'Июнь', 19 => 'Июль', 22 => 'Август', 25 => 'Сентябрь', 28 => 'Октябрь', 31 => 'Ноябрь', 34 => 'Декабрь');
		if ($months[$_POST['decade']]) 
		{
			$m = $_POST['decade'];
			$decade = '1';
		} else if ($months[$_POST['decade'] - 1]) 
		{
			$m = $_POST['decade'] - 1;
			$decade = '2';
		} else {
			$m = $_POST['decade'] - 2;
			$decade = '3';
		};
		
		echo '<div class = "annotation">';
		
		echo  '<p>'. $def[$_POST['char']] .'</p>
			   <p>'. $_POST['year'] .'</p>
			   <p>'. $months[$m] .'</p>
			   <p>'. $decade .' декада</p>
			  ';
			  
	    echo  '</div>';
	
	}
}

?>
