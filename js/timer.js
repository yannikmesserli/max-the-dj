var Timer = function(){

	var __timer__ = {};

	var d = 0; // a stockage for time
	var time = 0; //in ms
	var timer_id = 0;
	var is_running = false;

	function affiche_date(time_in_ms, show_console){
		
		var time_date = new Date(time_in_ms);
							
		var minstr =time_date.getMinutes();
		var secstr  = time_date.getSeconds();
		var msecstr = Math.floor((time_date.getMilliseconds()/10));

		if (minstr < 10)	minstr = '0' + minstr;
		if (secstr < 10) secstr = '0' + secstr;
		if (msecstr < 10) msecstr = '0' + msecstr;

		if(show_console) {
			console.log( minstr + ':' + secstr + ':' + msecstr);		
		}else{			
			$('#m') .html( minstr );
			$('#s') .html( secstr );
			$('#ms').html( msecstr);
		}	
	}

	function timer_run(){
		var d2 = new Date().getTime();
		elapse_time = d2-d;
		
		time += elapse_time;
		d = d2;
		
		affiche_date(time, false);
	
	}
	__timer__.play = function(){
		if(!is_running){
			d = (new Date()).getTime();
			timer_id = setInterval(timer_run, 10);
			is_running = true;
		}

		return __timer__;
	}

	__timer__.pause = function() {
		if(is_running){
			clearInterval(timer_id);
			is_running = false;
		}

		return __timer__;
	}

	__timer__.reset = function() {
		if(!is_running){
			affiche_date(time, true);						
			time = 0;
			affiche_date(time, false);
		}

		return __timer__;
	}

	__timer__.getTime = function() {
		return time;
	}

	return __timer__;

}