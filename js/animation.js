'use_strict';

/*
	Class Loop that will help animate infinitely the different component.
    The constructor has a period as parameter, which will synchronise every object together.

    The first animation is fire when the start command is started.

    Rewind let play the animation in a back and forth manner
 */
var Loop = function(_animations){
	
    // Interface
    var _loop = {};

    // period to synch all the Loop together:
    var period = 400;

    // Keep track of all the animation we want to play:
    var animations = [];

    // Is the animation looping?
    var isRunning = false;

    // Current index of the animations that we are running:
    var indexAnim = 0;

    // Increment to have the right direction 
    var inc_signed = 1;

    // Function that add an object animation to the list of the animations to do
    var add = function(animation, i){
        
        if(!isRunning){

            // If no end has been setup:
            if(animation.end === undefined){
                animation.end = 1.0;
            }
            // If no animation, just pass a blank one:
            if(animation.Movement === undefined || animation.Movement.start === undefined){
                animation.Movement = new Movement();
            }

            // If i is set, push it at the right place:
            if(i !== undefined){
                animations[i] = animation;
            }else{
                animations.push( animation);
            }
        }
    }

	_loop.add = function(animations){
        $.each(animations, function(index, anim){
            add(anim, index);
        });
        // for chaining:
        return _loop;
	}


    _loop.start = function(){
        isRunning = true;
        
        

        // Function recursive to chain the animations
        function prepareNext(index){
             
            var anim = animations[index];
            
            anim.Movement.once('start', function(curPos){
                if(anim.init === undefined)
                    anim.init = curPos;
                indexAnim = index;
            });

            anim.Movement.once('terminate', function(){
                // Swap init and end:
                var tmp = anim.init;
                anim.init = anim.end;
                anim.end = tmp;

                var next_anim = index + inc_signed;
                
                if( next_anim >= animations.length ) {
                    inc_signed = -1;
                    next_anim = index;
                }
                if( next_anim < 0.0 ) {
                    inc_signed = 1.0;
                    next_anim = index;
                }

                
                
                // recursively call _loop function:
                prepareNext(next_anim);
            });
            
            // Compute the duration if needed:
            var last = anim.duration? anim.duration * period:  period / animations.length;
            // Start _loop current animation
            anim.Movement.start(anim.end, last  );
        }

        prepareNext(indexAnim);

        return _loop;
    }

    _loop.stop = function(){
        isRunning = false;
        // Stop any animation
        $.each(animations, function(index, anim) {
            anim.Movement.stop();
        });
        // we need also to reset
        // 
        
        return _loop;
    }


    _loop.addRandom = function(mouvement){
        add({
            'end': Math.random(),
            'Movement': mouvement
        });
    }

    _loop.replicateFor = function(mov){
        var newanimations = [];
        $.each(animations, function(i, a){
             newanimations[i] = {
                'end': a.end,
                'Movement': mov
             };
        });
        return new Loop(newanimations);
    }

    _loop.__defineGetter__('animations', function(){
        return animations;
    });


	// Init here,
    // Copy all the animation of this loop 
    if(_animations){
        $.each(_animations, function(i, anim){
            add(anim, i);
        });
    }

    return _loop;
}


var Movement = function(_min, _max, callback){
	// List of animations registered:
	var interface = new Item();
	interface._draw = function(){};


	var max = _max || 1.0;
	var min = _min || 0.0;
	
    // Setup a Movement that does not nothing:
	if(callback === undefined ){    
        var callback = function(){} 
    };

	interface.currentPos = 0.0;
	interface.isRunning = false;

	smokesignals.convert(interface);

	// find the time when we fire this function:
    var startingTime = -1;
    

    // Animate it:
    // Intern class
    var Animation = function(duration, _from, to){
            
    interface.isRunning = true;
    // Stupid var to catch the time:
	var isNotSet = true;
            // reset
            startingTime = -1;
            // Percent done for this Animation:
            var percDone = 0.0;
            // Test direction
            var goPositive = (to - _from > 0.0);
            // Start from the value _from or from currentPos if already partially done:
            var from =  goPositive? Math.max(interface.currentPos, _from): Math.min(interface.currentPos, _from);
           
    	// Return the function to execute:
    	return function(evt){
    		if(percDone < 1.0){
            		// Catch the time:
            		if(isNotSet) {
            			startingTime = evt.time;
            			isNotSet = false;
            		}

            		// Where we stand at, in percent?
                            percDone =  (evt.time - startingTime)/duration * 1000;
            		
                            // Handle movement at the end:
            		if(percDone > 1.0 ) {
                                    // console.log(to);
                                    percDone = 1.0;
                                    interface.stop('terminate');
            		}

                            // Update the position of the movement:
                            interface.currentPos = percDone * to  + (1 - percDone) * from;
    	        	// Call the worker, do the real stuff:
    	        	callback( min + max * interface.currentPos );
                            // Tick
                            interface.emit('tick', percDone, interface.currentPos);
                    }
    	        			
    	}
    }


    // Control:
    interface.start = function(a, b, c){

        //Function to test the parameters:
        var testVar = function(a){
                return ((a > 0.0) && (a < 1.0));
        }

        // 0 parameter:
        var duration = 1000;
        var from = interface.currentPos;
        var to = 1.0;

        // if only one parameter:
        if( a != null && b == null && c == null){
                if(testVar(a)) to = a;
        }

        // if two parameters
         if( a != null && b != null && c == null){
                if(testVar(a)) to = a;
                if(b > 0.0) duration = b;
        }

        // if three parameters
         if( a != null && b != null && c != null){
                if(testVar(a)) to = a;
                if(testVar(b)) to = b;
                if(c > 0.0) duration = c;
        }
    	

    	if(interface.isRunning) {
                    interface.stop('interupted');
            }

        // Emit event starting:
        interface.emit('start', interface.currentPos);

    	interface.onFrame = new Animation(duration, from, to);

           

            // For chaining purpose
            return interface;
    }


    interface.stop = function(stop_reason, to){

    	interface.isRunning = false;
            interface.emit('stop');
            interface.emit(stop_reason);
            //interface.onFrame = null; // Weird bug, if I set up it to null, animation got not reassigned
    	interface.onFrame = function(){};
            // For chaining purpose
            return interface;
    }



    interface.set = function(_perc){

    	if(interface.isRunning) interface.stop();

    	var perc = _perc || 0.0;
    	interface.currentPos = perc;

    	callback( min + max * interface.currentPos );

            // For chaining purpose
            return interface;
    }

    interface.resume = function(){
    	interface.set(0.0);

            // For chaining purpose
            return interface;
    }
	

	// Start:
	//interface.set(0.0);

	

	return interface;

}