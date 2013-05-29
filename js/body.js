'use_strict';



/*
    Create a gaussian law to pick some cool random number:
 */
Math.nrand = function() {
    var x1, x2, rad;
 
    do {
        x1 = 2 * this.random() - 1;
        x2 = 2 * this.random() - 1;
        rad = x1 * x1 + x2 * x2;
    } while(rad >= 1 || rad == 0);
 
    var c = this.sqrt(-2 * Math.log(rad) / rad);
 
    return x1 * c;
};


var clip = function(val, _from, _to){
    var from = _from || 0.0;
    var to = _to || 1.0;

    return Math.max(from, Math.min(to, val));
}




/*
    Be careful, when you assign multiple variables with ','
    in a class, it, for some reasons, share this variable with all the
    instance...
 */

with (paper){
    var Dancer = function(_base, _scale){

        /*
            - base: is the point from which every other point is attached to
            - perdio: is the time of the beat from the music. Each dancer is supposed to be sync with it (some of them could be bad dancer and not snyc with it)

         */

        // the interface is paperjs Group 
        var __dancer__ = new Group();

        // Add some events:
        smokesignals.convert(__dancer__);

        // The dance has, like every humain, some arms, a head, and a body:
        var left_arm = null, right_arm = null, body = null, head = null; 

        // Scale of all the body:
        // this is for comodity, so that I can work at the size I want:
        var scale = _scale || 0.17; // 0.17

        // The point from which we are constructing everything:
        var base = _base || paper.view.center;


        // Array of all dance register:
        // (a dance is a loop)
        var dances = {};

        // For the arm... to be moved somewhere else:
        var typesArm = ['sym', 'para', 'rand'];

        var type_arm = typesArm[2];

        var amplitude_shake = 0.5;

        // For the color.... to be moved somewhere else:
        var colors = null;

        // For the animation:
        var tick = function(){};

        // Constructor:
        var init = function(){
            
            // [TODO] change
            colors = {
                short: ['#3D4665', '#548395'],
                arm_rightarm_right: {
                    front: 'black',
                    back: 'black'
                },
                arm_left: {
                    front: 'black',
                    back: 'black'
                },
                flesh: '#d3d8e1'
            };

            // Just draw a body first:
            body = Body();
            head = Head();

            constructPart();

            __dancer__.on('change:base', function(){

                body.emit('change');
                head.emit('change');
                left_arm.emit('change');
                right_arm.emit('change');

            });
            
            __dancer__.addChildren([head, left_arm, right_arm, body])
                
            return __dancer__;

        }



        //////////////////////////////////////////////
        //                                          //
        //               PUBLIC METHODS             //
        //                                          //
        //////////////////////////////////////////////

        // generate DJ:
        __dancer__.generateDJ = function(){

            colors = {
                short: ['#3D4665', '#548395'],
                flesh: '#d3d8e1'
            };

            // Properties of the DJ
            head.remove();
            head = new Head({
                'eye': 'glass2',
                'hair': 'dj'
            });

            body.remove();
            body = new Body({
                type: 'square'
            });


            left_arm.remove();
            left_arm = new Arm();

            __dancer__.addChildren([head, left_arm, body]);

            tick = function(){
                left_arm.rotate.set(0.6);
                left_arm.foldElbow.set(0.9);
                right_arm.rotate.set(0.6);
            };

            /////////////////////////
            // ANIMATIONS

            // Arm that holds the speakes:
            left_arm.rotate.set(0.6);
            left_arm.foldElbow.set(0.9);
            right_arm.rotate.set(0.6);

            // Arm that dance:
            dances.left_elbow =  new Loop().add([{ 'end': 0.0, 'init': 0.6, 'Movement': right_arm.foldElbow}]);
            dances.left_rotate =  new Loop().add([{ 'end': 0.9, 'init': 0.5, 'Movement': right_arm.rotate}]);
                        
            // Body movements
            dances.body_shake =  new Loop().add([{ 'end': 1, 'Movement': body.shake}]);
            dances.body_jump =  new Loop().add([{ 'end': 1, 'Movement': body.jump}]);
            dances.head_jump =  new Loop().add([{ 'end': 1, 'Movement': head.jump}]);
            dances.left_jump =  new Loop().add([{ 'end': 1, 'Movement': left_arm.jump}]);
            dances.right_jump =  new Loop().add([{ 'end': 1, 'Movement': right_arm.jump}]);
            
            
            head.bringToFront();

            return __dancer__;
        }  
   
        // generate a completely random dancer:
        __dancer__.generateRandom = function(){
            // Random color:
            colors  = RandomColor();

            // type amr:
            type_arm = typesArm[ Math.round(Math.random()*3 - 0.2) ];
            
            // the movement of the body:
            amplitude_shake = Math.random();

            // Construct arm:
            constructPart();
            // Make them of random color:
            left_arm.makeRandom();
            right_arm.makeRandom(left_arm.typeColor);

            // Body:
            body.setRandom();


            // Head
            head.setRandom();


            dances.body_shake =  new Loop().add([{ 'end': 1, 'Movement': body.shake}]);
            dances.body_jump =  new Loop().add([{ 'end': 1, 'Movement': body.jump}]);
            dances.head_jump =  new Loop().add([{ 'end': 1, 'Movement': head.jump}]);
            dances.left_jump =  new Loop().add([{ 'end': 1, 'Movement': left_arm.jump}]);
            dances.right_jump =  new Loop().add([{ 'end': 1, 'Movement': right_arm.jump}]);


            /////////////////////
            // LOOP FOR THE ARM:
            // Setup a new loop:
            dances.loopLeftElbow = randomAnim( left_arm.foldElbow);

            // Animation for the left Elbow:
            if(type_arm == 'sym' || type_arm == 'para')
                dances.loopRightElbow = dances.loopLeftElbow.replicateFor(right_arm.foldElbow);  // Do same symmetric to the right:
            else
                dances.loopRightElbow = randomAnim(right_arm.foldElbow); // Or generate random animation
    

           // Setup a new loop for the roation of the arm:
            dances.loopLeftArm = randomAnim( left_arm.rotate);

            // Setup animation for the right Elbow:
            if(type_arm == 'sym' || type_arm == 'para')
                dances.loopRightArm = dances.loopLeftArm.replicateFor(right_arm.rotate); // Do same symmetric to the right:
            else
                dances.loopRightArm = randomAnim(right_arm.rotate); // generate random one


            


           return __dancer__;
        }

        
        __dancer__.__defineGetter__('z', function(){
            return base.y;
        });


        __dancer__.__defineGetter__('base', function(){
            return base;
        });


        __dancer__.startDance = function(){
            $.each(dances, function(i, dance){
                dance.start();
            });
            return __dancer__;
        }

        __dancer__.setRandomPose = function(){
            $.each(dances, function(i, dance){
                dance.setRandom();
            });
            return __dancer__;
        }

        __dancer__.move = function(newpos, _duration){
            var duration = _duration || 500;
            var oldpos = base;
            var m = new Movement(0.0, 1.0, function(val){
                
                base = newpos.multiply(val).add(oldpos.multiply(1.0 - val)); 
                __dancer__.emit('change:base');

            });
            m.on('tick', function(){
                tick();
            })
            return m.start(0.0, 1.0, duration);
        }

        //////////////////////////////////////////////
        //                                          //
        //             PRIVATE METHODS              //
        //                                          //
        //////////////////////////////////////////////


        // Internal function that create a random Loop for the movement
        var randomAnim = function(movement){

            var loop = new Loop();
            loop.addRandom(movement);
            var prob = 0.3;
            var count = 1;
            while( Math.random() < prob && count < 4){
                loop.addRandom(movement);
                prob = prob/2;
                count++;
            }
            return loop;
        }


        var constructPart = function(){

            __dancer__.removeChildren();

            
            left_arm = new Arm();
            var rightset = {
                 anchor: new Point(-90, 0),
                 type: 'arm_right'
            };
            
            if( type_arm == 'sym' || type_arm == 'rand'){
                rightset.rotate= {
                    modifVal: function(a){ return (180 - a)},
                    max: 200,
                    min: 90
                };
                rightset.foldElbow = {
                    max: 110,
                    min: 0,
                    modifVal: function(a){ return ( - a); }
                };
            }
            right_arm = new Arm( rightset);
            
            __dancer__.addChildren([body, head, right_arm, left_arm]);


        }

        // Give back random color scheme:
        var RandomColor = function(){

            // Ugly right now
            // [TODO]
            var colors_tmp = [];
            colors_tmp.push({
                short: ['#3D4665', '#548395'],
                flesh: '#d3d8e1'
            });

            colors_tmp.push({
                short: ['#314f9b', '#954949'],
                flesh: '#d3d8e1'
            });

            colors_tmp.push({
                short: ['#2383a6', '#46498b'],
                flesh: '#d3d8e1'  //FFF0B3
            });


            colors_tmp.push({
                short: ['#548395', '#548395'],
                flesh: '#d3d8e1'
            })

            colors_tmp.push({
                short: ['#45498b', '#548395'],
                flesh: '#a5967b'
            });

            colors_tmp.push({
                short: ['#45584a', '#a5967b'],
                flesh: '#c8beb1'
            });

            colors_tmp.push({
                short: ['#599563', '#9f9588'],
                flesh: '#a9b363'
            });

            colors_tmp.push({
                short: ['#304e9b;', '#45498b'],
                flesh: '#d3d8e1'
            });


            colors_tmp.push({
                short: ['#588dbb', '#aca054'],
                flesh: '#c7bdb1'
            });


           


            return selectRandom(colors_tmp);

        }


        //////////////////////////////////////////////
        //                                          //
        //               PRIVATE CLASS              //
        //                                          //
        //////////////////////////////////////////////
        //
        
        //////////////////////////////////////////////
        // 
        //  Arm: class to create an arm with 
        //  a back part and a front part
        // 
        
        var Arm = function(options){

            var __id__ = new Date().getTime();
            /* Arm has 3 main points:
             * - the starting point
             * - the elbow point
             * - the hand point
             *
             * Depending of the point, we use
             * the arm_front and arm_back to draw it
             */

            var pt = {};

            // Our arm object:
            var _arm = new Group();

            // For coloration: default plain:
            _arm.typeColor = 'tshirt'; var arm_color = [];

            // The arm is decomposed into two parts:
            var myfront = null, myback = null;

            // Add event handler:
            smokesignals.convert(_arm);

            var default_settings = {
                elbow: new Point(0, 100),
                end: new Point(0, 100),
                rotate: {
                    max: 200,
                    min: 90,
                    modifVal: function(a){ return a; }
                },
                foldElbow: {
                    max: 110,
                    min: 0,
                    modifVal: function(a){ return a; }
                },
                anchor: new Point(90,0),
                type: 'arm_left'
            };

            var settings = $.extend({}, default_settings, options || {}) ;

            /* ******************************************* /
             * Register possible movement:
             *
             */
            

            // rotation of the arm in respect to the body:
            _arm.rotate = new Movement(settings.rotate.min, settings.rotate.max , function(val){
                
                var vect = pt.elbow.subtract(pt.begin);
                var vect2 = pt.end.subtract(pt.elbow);
                vect2.angle = vect2.angle - vect.angle + settings.rotate.modifVal(val);
                vect.angle = settings.rotate.modifVal(val);
                pt.elbow = vect.add(pt.begin);
                pt.end =  vect2.add(pt.elbow); 
                myfront.emit('change');
                myback.emit('change');

            }).on('interupted', function(){
                //console.log('interupted');
            });


            // Fold the Elbow with respect to the arm:
            _arm.foldElbow = new Movement(settings.foldElbow.min, settings.foldElbow.max, function(beta){
                // Get the current orientation of the arm:
                var vect1 = pt.elbow.subtract(pt.begin);
                var alpha = vect1.angle;
                // change the upper part:
                var vect2 = pt.elbow.subtract(pt.begin);
                vect2.angle = alpha + settings.foldElbow.modifVal(beta);
                pt.end =  vect2.add(pt.elbow); 
                myfront.emit('change');
                myback.emit('change');
            }).on('terminate', function(){
                //console.log(__id__ + ' is terminate');
            });


            // Jump with the body:
             _arm.jump = new Movement( -amplitude_shake, amplitude_shake , function(val){
                var splus = new Point(  0, -10 * (Math.abs(val) - amplitude_shake/2) * scale );
            
                pt.begin = pt.begin.add( splus ) ;
                pt.elbow = pt.elbow.add(  splus);
                pt.end = pt.end.add(    splus);


                myfront.emit('change');
                myback.emit('change');

            });
            
            var init = function(){
                construct_point();
                
                colorArm();

                myfront = new arm_front();
                myback = new arm_back();
                
                _arm.on('change', function(){
                    construct_point();
                    myfront.emit('change');
                    myback.emit('change');
                });

                _arm.addChildren([myfront, myback ]);

                return _arm;
            };


            var construct_point = function(){
                pt.begin = base.subtract( settings.anchor.multiply(scale) ) ;
                pt.elbow = pt.begin.add(settings.elbow.multiply(scale));
                pt.end = pt.elbow.add(settings.end.multiply(scale));
                _arm.pt = pt;
            }




            // A generic function to create arm:
            var armGen = function(starting, ending, _draw){

                // A reference to point creating the structure of the arm:
                var __starting_point__ = starting;
                var __ending_point__ = ending;
                


                // The arm is actually a group:
                var part_arm = new Group();

                // Event:
                smokesignals.convert(part_arm);

                var draw = _draw || function(start, end){
                   
                    var tmp = new Path([ start, end] );
                    tmp.selected = true;
                    return [ tmp ];
                };

                var init = function(){
                    // Draw stuff:
                    part_arm.updateView();
                    // Register event:
                    part_arm.on('change', function(){
                        part_arm.updateView();
                    });

                    return part_arm;
                }

                part_arm.updateView = function(){
 
                    part_arm.removeChildren();
                    part_arm.addChildren( draw( pt[__starting_point__], pt[__ending_point__]) );

                }




                // Interface:
                return init();
            }

            // Front part of the arm, with the hand:
            var arm_front = function(){
                

                var hand = function(pos, angle){
                    
                    var handy = new Path(); handy.pathData = "M7.163,7.416c-3.267,3.988-9.146,4.573-13.135,1.307c-2.393-1.96-3.561-4.86-3.405-7.729c0.025-0.478,0.083-0.959,0.127-1.477c0.566-3.788-1.401-9.278,2.187-8.923c0.353-0.035,0.718-0.039,1.097-0.016c0.381,0.02,0.774,0.066,1.189,0.127c2.429-1.302,4.407-1.732,6.067-1.465c0.416,0.066,0.816,0.171,1.236,0.27c8.705-0.736,6.591,6.58,6.741,12.496c-0.028,0.481-0.092,0.96-0.191,1.433C8.777,4.854,8.144,6.221,7.163,7.416z";
                    handy.set({
                        strokeColor: '#000',
                        strokeWidth: 1,
                        fillColor: colors.flesh
                    });
                    handy.closed = true; //handy.selected = true;
                    handy.scale(scale * 2.5);
                    handy.position = pos;
                    handy.rotate(angle, pos)

                    return handy;
                }


                var draw = function(start, end){
                    
                    var a = new Point(10*scale, 0);
                    var vect = end.subtract(start);
                    a.angle = vect.angle + 90;

                    var armi = new Path([ start.add(a), start.subtract(a) , end.subtract(a), end.add(a)] );
                    armi.style = {
                        strokeColor: 'black',
                        strokeWidth: 0.5,
                        fillColor: arm_color[0]
                    };
                    armi.closed = true;


                    return [armi, hand(end, vect.angle + 90) ];

                }


                return armGen('elbow', 'end', draw);
            }


            // back part of the arm
            var arm_back = function(){

                var draw = function(start, end){
                    
                    var a = new Point(10*scale, 0);
                    var vect = end.subtract(start);
                    a.angle = vect.angle + 90;

                    var armi = new Path([ start.add(a), start.subtract(a) , end.subtract(a), end.add(a)] );
                    armi.style = {
                        strokeColor: 'black',
                        strokeWidth: 0.5,
                        fillColor: arm_color[1]
                    };
                    armi.closed = true;


                    return [armi];

                }

                var tmp = armGen('begin', 'elbow', draw);
                

                return tmp;
            }


            // Wheither the type is, return a different color:
            var colorArm = function(){
               
                
                switch(_arm.typeColor){
                    case 'plain': arm_color = [colors.short[0], colors.short[0]]; break;
                    case 'plain2': arm_color = [colors.short[1], colors.short[1]]; break;
                    case 'alt': arm_color = [colors.short[0], colors.short[1]]; break;
                    case 'tshirt': arm_color = [colors.flesh, colors.short[0]]; break;
                    case 'tshirt2': arm_color = [colors.flesh, colors.short[1]]; break;
                    case 'naked': arm_color = [colors.flesh, colors.flesh]; break;
                    case 'opp': 
                        if(settings.type == 'arm_right') arm_color = [colors.short[0], colors.short[0]];
                        else arm_color = [colors.short[1], colors.short[1]]; 
                        break;
                    case 'diag': 
                        if(settings.type == 'arm_right') arm_color = [colors.short[0], colors.short[1]];
                        else arm_color = [colors.short[1], colors.short[0]]; 
                        break;
                    case 'weird': 
                        if(settings.type == 'arm_right') arm_color = [colors.flesh, colors.short[1]];
                        else arm_color = [colors.short[0], colors.short[0]]; 
                        break;
                     case 'weird2': 
                        if(settings.type == 'arm_right') arm_color = [colors.flesh, colors.short[1]];
                        else arm_color = [colors.short[1], colors.short[1]]; 
                        break;
                }
            }

            _arm.makeRandom = function(type){
                if(type == null)
                    _arm.typeColor = selectRandom(['plain', 'plain2', 'alt', 'tshirt', 'tshirt2', 'naked', 'opp', 'diag', 'weird', 'weird2']);
                else
                    _arm.typeColor = type;

                colorArm();
            };

            

            
            // Interface:
            return init();
            
        }

        //////////////////////////////////////////////
        // 
        //  Body: class to create an body with 
        //  some movement
        // 
        
        // Class for the body
        var Body = function(options){
            


            var default_settings = {
                'fat': 0.5,
                pt: [
                    new Point(0, -90),
                    new Point(70, -70),
                    new Point(80, 40), // right middle
                    // bottom
                    new Point(50, 220),
                    new Point(-50, 220),

                    new Point(-80, 40), // left middle
                    new Point(-70, -70), // top left
                ],
                handle1: new Point(0, 50),
                handle2: new Point(40, 10),
                handle3: new Point(40, -10),
                ptStartGrid: new Point(150, 90),
                type: 'plain'
            };

            var settings = $.extend({}, default_settings, options || {}) ;

            // the points to construct the body:
            var ptSet = {};

            // Interface:
            var __body__ = new Group();

            // Add event handler:
            smokesignals.convert(__body__);
            
            // Private variable for the overall contour:
            var contour = null;
            
            // Private function that construct the contour from the point:
            var createContour = function(_ptSet){

                var ptSet2 = _ptSet || ptSet;

                if(contour){
                    contour.remove();
                }

                contour = new Path();
                contour.strokeColor = 'black';
                contour.strokeWidth = 1;

                $.each(ptSet2.pt, function(i, pt){
                    contour.add( base.add( pt.clone().multiply(scale) ) );
                });

                contour.closed = true;


                //contour.fullySelected = true;
                contour.smooth();
                
                contour.segments[2].handleOut =  ptSet2.handle1.clone().multiply(scale);
                contour.segments[5].handleIn =  ptSet2.handle1 .clone().multiply(scale);


                contour.segments[3].handleIn =  ptSet2.handle3 .clone().multiply(scale);
                contour.segments[4].handleIn =  ptSet2.handle2 .clone().multiply(scale);
 
                contour.segments[3].handleOut =  ptSet2.handle3.clone().multiply(-scale);
                contour.segments[4].handleOut =  ptSet2.handle2.clone().multiply(-scale);
            }

            // Create a shirt with strips:
            var makeBarriole = function(){
                var bg = contour.clone();
                bg.fillColor = colors.short[1];
                __body__.addChild(bg);
                var mask = contour.clone();
                mask.clipMask = true;
                __body__.addChild(mask);

                for (var i = 0; i < 12; i++) {
                    var start = base.subtract(settings.pt[0].add(new Point(150, -50*(i -4) - 3 )  ).multiply(scale));
                    var size = new Size(300*scale, 25*scale);
                    var r = new Path.Rectangle( start, size);
                    r.fillColor = colors.short[0];
                    __body__.addChild(r);
                };


            }

            // Create a plain color shirt
            var makePlain = function(){
                contour.fillColor = colors.short[0];
            }

            // Create a squarred pattern:
            var makeSquared = function(){

                var bg = contour.clone(); 
                bg.fillColor = colors.short[1];
                __body__.addChild(bg);
                var mask = contour.clone();
                mask.clipMask = true;
                __body__.addChild(mask);

                for (var i = 8; i < 30; i++) {
                    for (var j = -5; j < 5; j++) {

                        var size = new Size(30*scale, 30*scale);

                        var start = base.add(settings.pt[0].add(new Point( size.width*j + size.width*( (j + i)%2), size.height*i)  ));
                        
                        var r = new Path.Rectangle( start, size);
                        
                        r.fillColor = colors.short[0];
                        __body__.addChild(r);
                    }
                    
                };
            }

            // Create a dual color body:
            var makeDual = function(angle){
                var bg = contour.clone(); 
                bg.fillColor = colors.short[1];
                __body__.addChild(bg);
                var mask = contour.clone();
                mask.clipMask = true;
                __body__.addChild(mask);

                var size = new Size(500*scale, 200*scale);
                var r = new Path.Rectangle( base.subtract(new Point(250*scale, 150*scale)), size).rotate(angle);
                r.fillColor = colors.short[0];
                __body__.addChild(r);
            }

            // Create diagonal line:
            var makeDiag = function(){
                var bg = contour.clone();
                bg.fillColor = colors.short[1];
                __body__.addChild(bg);
                var mask = contour.clone();
                mask.clipMask = true;
                __body__.addChild(mask);

                for (var i = 0; i < 11; i++) {
                    var start = base.subtract(settings.pt[0].add(new Point(250, -60*(i -4) - 3 )  ).multiply(scale));
                    var size = new Size(500*scale, 20*scale);
                    var r = new Path.Rectangle( start, size).rotate(45);
                    r.fillColor = colors.short[0];
                    __body__.addChild(r);
                };

            }

            // Function that make the body fater of thiner
            var setFatness = function(to){
                // 0 < to < 1
                
                settings.pt[2] = settings.pt[2].add( (new Point(50, 0)).multiply(to) );
                settings.pt[5] = settings.pt[5].add( (new Point(-50, 0)).multiply(to) );
            }




            var makeColor = function(){
                // console.log(settings.type)
                switch(settings.type){
                    case 'plain': makePlain(); break;
                    case 'square': makeSquared(); break;
                    case 'line': makeBarriole(); break;
                    case 'diag': makeDiag(); break;
                    case 'dual': makeDual(0); break;
                    case 'dual_45': makeDual(45); break;
                    case 'dual_45_bis': makeDual(-45); break;
                }
                contour.bringToFront();
            }
            
            var draw = function(){

                __body__.removeChildren();
                __body__.addChild(contour);
                
                // Default: plain
                makeColor();

            }

            var init = function(){

                setFatness(settings.fat);
                ptSet = {
                    pt: []
                };
                $.each(settings.pt, function(i, pt){
                   ptSet.pt[i] = pt.clone();
                });
                ptSet.handle1 = settings.handle1.clone();
                ptSet.handle2 = settings.handle2.clone();
                ptSet.handle3 = settings.handle3.clone();
                createContour();
                draw();
                return __body__
            }

            __body__.setRandom = function(){

                setFatness(clip(Math.pow(Math.nrand(), 2)));
                ptSet = {
                    pt: []
                };
                $.each(settings.pt, function(i, pt){
                   ptSet.pt[i] = pt.clone();
                });
                ptSet.handle1 = settings.handle1.clone();
                ptSet.handle2 = settings.handle2.clone();
                ptSet.handle3 = settings.handle3.clone();
                createContour();

                settings.type = selectRandom([ 'plain', 'square', 'line', 'diag', 'dual', 'dual_45', 'dual_45_bis' ]) ;
                draw();
                
            }


            // ANIMATIONS:
            // 
            // Shaking the body:
            __body__.shake = new Movement( -amplitude_shake, amplitude_shake , function(val){
                
                ptSet.pt[2] = settings.pt[2].add( (new Point(  100, 0)).multiply(scale * val ) );
                ptSet.pt[5] = settings.pt[5].add( (new Point( -100, 0)).multiply(scale * val ) );

                
                __body__.emit('change');

            });


            __body__.jump = new Movement( -amplitude_shake, amplitude_shake , function(val){
                
                ptSet.pt[1] = settings.pt[1].add( (new Point(  10, 100)).multiply(scale * val ) );
                ptSet.pt[6] = settings.pt[6].add( (new Point( -10, 100)).multiply(scale * val ) );

                
                __body__.emit('change');

            });

            __body__.on('change', function(){
                createContour();
                draw();
            });


            return init();
        }


        // Parse the hairs:
        var hairsSVG = parseSVG(['cheveux1', 'cheveux2', 'cheveux3', 'cheveux4', 'cheveux5'] );
        var djSVG = parseSVG(['dj', 'headphone'] );

        //////////////////////////////////////////////
        // 
        //  Head: class to create an head 
        //  
        //
        
        
        var Head = function(options){
            
            var __head__ = new Group();
            
            // Events:
            smokesignals.convert(__head__);

            var default_settings = {
                anchor: new Point(0, -70),
                eyeOffset: new Point(20, 0),
                hair: 'normal',
                eye: 'glass'
            };

            var settings = $.extend({}, default_settings, options || {}) ;

            var head_center = null;

            
            var contour = null;


            var makeHair = function(){
                // console.log(settings.type)
                switch(settings.hair){
                    case 'normal': makeNormal(); break;
                    case 'coince': makeCoince(); break;
                    case 'punk': makePunk(0); break;
                    case 'punk3': makePunk(1); break;
                    case 'punk2': makePunk2(0); break;
                    case 'punk4': makePunk2(1); break;
                    case 'coince2': makeCoince2(1); break;
                    case 'dj': dj(); break;
                }
                
            }

            var makeEye = function(){
                
                var pt1 = head_center.add(settings.eyeOffset.multiply(scale));
                var pt2 = head_center.subtract(settings.eyeOffset.multiply(scale));

                switch(settings.eye){
                    case 'normal': eyeDefault(pt1); eyeDefault(pt2); break;
                    case 'cross': eyeCross(pt1); eyeCross(pt2); break;
                    case 'cross2': eyeDefault(pt1); eyeCross(pt2); break;
                    case 'cross3': eyeDefault(pt2); eyeCross(pt1); break;
                    case 'line': eyeRight(pt1); eyeRight(pt2); break;
                    case 'line2': eyeRight(pt1); eyeDefault(pt2); break;
                    case 'line3': eyeRight(pt2); eyeDefault(pt1); break;
                    case 'glass': glasses(pt1); break;
                    case 'glass2': glasses(pt1, colors.short[0]); break;
                    case 'glass3': glasses2(pt1, pt2); break;
                }
                
            }
            // Make hair for the dj:
            var dj = function(){
                var cheveux = djSVG[0].clone();
                cheveux.translate(head_center.subtract(new Point(10*scale, 60*scale))).scale(6.5).scale(scale);
                cheveux.style= {
                    strokeColor: 'black',
                    strokeWidth: 1.0
                };

                __head__.addChild(cheveux);
                cheveux.bringToFront();

                var headphone = djSVG[1].clone();
                headphone.translate(head_center.subtract(new Point(5*scale, 45*scale))).scale(5.8).scale(scale);
                headphone.style = {
                    strokeColor: 'black',
                    strokeWidth: 0.5,
                    fillColor: colors.short[0]
                };
                __head__.addChild(headphone);

                headphone.bringToFront();

            }
            // Make normal hair:
            var makeNormal = function(){

                var cheveux = hairsSVG[0].clone();
                cheveux.translate(head_center.subtract(new Point(10*scale, 60*scale))).scale(6.5).scale(scale);
                cheveux.style= {
                    strokeColor: 'black',
                    strokeWidth: 1.5
                };

                __head__.addChild(cheveux);
                cheveux.bringToFront();
            }

             var makeCoince = function(){

                 var cheveux = hairsSVG[1].clone();
                cheveux.translate(head_center.subtract(new Point(0*scale, 45*scale))).scale(6).scale(scale);
                cheveux.style= {
                    fillColor: 'black'
                    
                };

                __head__.addChild(cheveux);
                cheveux.bringToFront();
            }

            var makeCoince2 = function(){

                 var cheveux = hairsSVG[3].clone();
                cheveux.translate(head_center.subtract(new Point(60*scale, 5*scale))).scale(6).scale(scale);
                cheveux.style= {
                    strokeColor: 'black',
                    strokeWidth: 1.0
                };

                __head__.addChild(cheveux);
                cheveux.bringToFront();
            }


            var makePunk = function(val){

                var cheveux = hairsSVG[2].clone();
                cheveux.translate(head_center.subtract(new Point(25*scale, 40*scale))).scale(6.5).scale(scale);
                cheveux.style= {
                    strokeColor: colors.short[val],
                    strokeWidth: 1.5
                };

                
                __head__.addChild(cheveux);

            }

            var makePunk2 = function(val){

                var cheveux = hairsSVG[4].clone();
                cheveux.translate(head_center.subtract(new Point(5*scale, 50*scale))).scale(6.5).scale(scale);
                cheveux.style= {
                    strokeColor: colors.short[val],
                    strokeWidth: 1.5
                };

                
                __head__.addChild(cheveux);

            }

            var s1 = Math.random();
            var s2 = Math.random();

            // Draw an eye like a cross
            var eyeCross = function(pt){
                var eye1 = new Path([ 
                    pt.add( new Point(20*s1*scale, 20*s2*scale)  ),
                    pt.add( new Point(-20*s1*scale, -20*s2*scale)  )
                ]);

                var eye2 = new Path([ 
                    pt.add( new Point(-20*s1*scale, 20*s2*scale)  ),
                    pt.add( new Point(20*s1*scale, -20*s2*scale)  )
                ]);
                var eye = new Group([eye1, eye2]);
                eye.style = {
                    strokeColor: 'black',
                    strokeWidth: 1.0
                }
                __head__.addChild(eye);
            }

            var eyeRight = function(pt){
                var eye = new Path([ 
                    pt.add( new Point(20*s1*scale, 10*(s2 - 0.5)*scale)  ),
                    pt.add( new Point(-20*s1*scale, -10*(s2 - 0.5)*scale)  )
                ]);
                eye.strokeColor = 'black';
                eye.strokeWidth = 1.0;
                __head__.addChild(eye);
            }

            var eyeDefault = function(pt){

                var eye = new Path.Circle(pt, 10*scale);
                eye.strokeColor = 'black';
                eye.strokeWidth = 1.0;
                __head__.addChild(eye);
            }

             var glasses2 = function(pt1, pt2){

                var g1 = new Path.Circle(pt1.subtract(new Point(2*scale, 0)), 18*scale);
                var g2 = new Path.Circle(pt2.subtract(new Point(-2*scale, 0)), 18*scale);
                var eye = new Group([g1, g2]);
                eye.fillColor = 'black';
                
                __head__.addChild(eye);
            }

            var glasses = function(pt, _color){
                var color = _color || 'black';
                var glasses = new Path();
                glasses.pathData = 'M12.494,11.931c-9.167,0-12.232-8.264-12.232-8.264s-1.434,8.099-9.039,8.099c-13.229,0-10.556-17.264-10.556-17.264H20C20-5.498,20.827,11.931,12.494,11.931z'
                glasses.closed = true;
                glasses.scale(2.5).scale(scale).translate(pt.subtract(new Point(22*scale,10*scale) ));
                glasses.fillColor = color;
                glasses.strokeColor = 'black';
                glasses.strokeWidth = 1.0;
                __head__.addChild(glasses);
            }


            var init = function(){
                head_center = base.add(settings.anchor.multiply(scale));
                contour = new Path.Circle( head_center, 65*scale);
                contour.strokeColor = 'black';
                contour.fillColor = colors.flesh;

                __head__.addChild(contour);

                makeHair();
                makeEye();

                return __head__;
            }

            __head__.setRandom = function(){

                __head__.removeChildren();

                contour = new Path.Circle( head_center, 65*scale);
                contour.segments[3].point = contour.segments[3].point.add( new Point( ((14*clip(Math.nrand())) -7.0)*scale, (50*Math.random() -20)*scale) )
                contour.strokeColor = 'black';
                contour.fillColor = colors.flesh;

                __head__.addChild(contour);

                settings.hair = selectRandom(['normal', 'coince', 'punk', 'punk3', 'punk2', 'punk4', 'coince2']);
                settings.eye =  selectRandom(['normal', 'cross', 'cross2', 'cross3', 'line', 'line2', 'line3', 'glass', 'glass2', 'glass3']);
                makeHair();
                makeEye();

                contour.fillColor = colors.flesh;

                return __head__;
            }
            

            __head__.on('change', function(){
                head_center = base.add(settings.anchor.multiply(scale));

                __head__.removeChildren();

                contour = new Path.Circle( head_center, 65*scale);
                contour.strokeColor = 'black';
                contour.fillColor = colors.flesh;

                __head__.addChild(contour);

                makeHair();
                makeEye();
            });

            // Animation:
            // 
            __head__.jump = new Movement( -amplitude_shake, amplitude_shake , function(val){
                
                head_center =  base.add(settings.anchor.multiply(scale).add( (new Point(  0, 50)).multiply(scale * val ) ));

                __head__.removeChildren();

                contour = new Path.Circle( head_center, 65*scale);
                contour.strokeColor = 'black';
                contour.fillColor = colors.flesh;

                __head__.addChild(contour);

                makeHair();
                makeEye();

            });

            return init();
        }

        // 
        // End of of the private class
        //
        ////////////////////////////////////////// 
        


        // Interface:
        return init();

    } // End Dancer

    // ------------------------------------------------
    function getVector(radians, length) {
        return new Point({
            // Convert radians to degrees:
            angle: radians * 180 / Math.PI,
            length: length
        });
    }

    function selectRandom(array){
        var n = array.length;
        
        return array[ Math.floor(Math.random() * n ) ];
    }

    function parseSVG(array){
        return array.map(function(id){

            return project.importSVG($('#'+id)[0]);
        });
    }
}