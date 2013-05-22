'use_strict';




/*
    Be careful, when you assign multiple variables with ','
    in a class, it, for some reasons, share this variable with all the
    instance...
 */

with (paper){
    var Dancer = function(_base ){

        /*
            - base: is the point from which every other point is attached to
            - perdio: is the time of the beat from the music. Each dancer is supposed to be sync with it (some of them could be bad dancer and not snyc with it)

         */

        // the interface is paperjs Group 
        var _dancer = new Group();

        // Scale of all the body:
        // this is for comodity, so that I can work at the size I want:
        var scale = 0.15;

        // The point from which we are constructing everything:
        var base = _base || paper.view.center;

        // For the arm... to be moved somewhere else:
        var typesArm = ['sym', 'para', 'rand'];

        var type_arm = typesArm[0];


        // For the color.... to be moved somewhere else:
        // 
        var colors = {
            short: ['black', '#3D4665'],
            arm_right: {
                front: 'black',
                back: 'black'
            },
            arm_left: {
                front: 'black',
                back: 'black'
            },
            flesh: '#FFF0B3'
        }

        // Constructor:
        var init = function(){
            
            // Just draw a body first:
            var o = body();
            var h = head();
           
            var left_arm = new Arm();
            var rightset = {
                 anchor: new Point(-110, 0),
                 type: 'arm_right'
            };
            if( type_arm == 'sym'){
                rightset = {
                    rotate: {
                        modifVal: function(a){ return (180 - a)},
                        max: 200,
                        min: 90
                    },
                    foldElbow: {
                        max: 160,
                        min: 0,
                        modifVal: function(a){ return ( - a); }
                    },
                    anchor: new Point(-110, 0),
                    type: 'arm_right'
                };
            }
            var right_arm = new Arm( rightset);
            


            //_dancer.addChildren([o, left_arm, right_arm]);
            

            // setup a new loop:
           new Loop().add(
                    [
                        {
                            'end': 0.7,
                            'Movement':  left_arm.foldElbow,
                            'duration': 0.2
                        },
                        {
                            'end': 0.1,
                            'Movement':  left_arm.foldElbow,
                            'duration': 0.5
                        },
                        {
                            'end': 0.4,
                            'Movement':  left_arm.foldElbow,
                            'duration': 0.3
                        }
                    ]
                ).start();


           new Loop().add(
                    [
                        {
                            'end': 0.7,
                            'Movement':  right_arm.foldElbow,
                            'duration': 0.2
                        },
                        {
                            'end': 0.1,
                            'Movement':  right_arm.foldElbow,
                            'duration': 0.5
                        },
                        {
                            'end': 0.4,
                            'Movement':  right_arm.foldElbow,
                            'duration': 0.3
                        }
                    ]
                ).start();

            new Loop().add(
                    [
                        {
                            'end': 0.4,
                            'Movement':  left_arm.rotate,
                            'duration': 0.5
                        },
                        {
                            'end': 0.9,
                            'Movement':  left_arm.rotate,
                            'duration': 0.5
                        }
                    ]
                ).start();


            new Loop().add(
                    [
                        {
                            'end': 0.4,
                            'Movement':  right_arm.rotate,
                            'duration': 0.5
                        },
                        {
                            'end': 0.9,
                            'Movement':  right_arm.rotate,
                            'duration': 0.5
                        }
                    ]
                ).start();

           
            
            


            return _dancer;

        }

   





        // The arms:
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
                    max: 160,
                    min: 0,
                    modifVal: function(a){ return a; }
                },
                anchor: new Point(110,0),
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
                _arm.emit('changed');

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
                _arm.emit('changed');

            }).on('terminate', function(){
                //console.log(__id__ + ' is terminate');
            });
            
            var init = function(){
                construct_point();
       
                var myfront = new arm_front();
                var myback = new arm_back();
                
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

                var draw = _draw || function(start, end){
                   
                    var tmp = new Path([ start, end] );
                    tmp.selected = true;
                    return [ tmp ];
                };

                var init = function(){
                    // Draw stuff:
                    part_arm.updateView();
                    // Register event:
                    _arm.on('changed', function(){
                        part_arm.updateView();
                    })

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
                

                var hand = function(pos){
                    
                    var handy = new Path(); handy.pathData = "M7.163,7.416c-3.267,3.988-9.146,4.573-13.135,1.307c-2.393-1.96-3.561-4.86-3.405-7.729c0.025-0.478,0.083-0.959,0.127-1.477c0.566-3.788-1.401-9.278,2.187-8.923c0.353-0.035,0.718-0.039,1.097-0.016c0.381,0.02,0.774,0.066,1.189,0.127c2.429-1.302,4.407-1.732,6.067-1.465c0.416,0.066,0.816,0.171,1.236,0.27c8.705-0.736,6.591,6.58,6.741,12.496c-0.028,0.481-0.092,0.96-0.191,1.433C8.777,4.854,8.144,6.221,7.163,7.416z";
                    handy.set({
                        strokeColor: '#000',
                        strokeWidth: 1,
                        fillColor: colors.flesh
                    });
                    handy.closed = true; //handy.selected = true;
                    handy.scale(scale * 2);
                    handy.position = pos;


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
                        fillColor: colors[settings.type].front
                    };
                    armi.closed = true;


                    return [armi, hand(end) ];

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
                        fillColor: colors[settings.type].front
                    };
                    armi.closed = true;


                    return [armi];

                }

                var tmp = armGen('begin', 'elbow', draw);
                

                return tmp;
            }

            
            // Interface:
            return init();
            
        }


        var head = function(){

            // Interface:
            return {

                // Execute when enter the frame:
                onFrame: function(){

                }
            }
        }
         
        var body = function(options){
            


            var default_settings = {
                pt: [
                    new Point(0, -90),
                    new Point(70, -70),
                    new Point(150, 40), // right middle
                    // bottom
                    new Point(50, 220),
                    new Point(-50, 220),

                    new Point(-150, 40), // left middle
                    new Point(-70, -70), // top left
                ],
                handle1: new Point(0, 50),
                handle2: new Point(40, 10),
                handle3: new Point(40, -10),
                ptStartGrid: new Point(150, 90)
            };

            var settings = $.extend({}, default_settings, options || {}) ;


            // Interface:
            var _body = new Group();
            
            // Private variable for the overall contour:
            var contour = null;
            
            // Private function that construct the contour from the point:
            var createContour = function(){

                if(contour){
                    contour.remove();
                }

                contour = new Path();
                contour.strokeColor = 'black';
                contour.strokeWidth = 1;

                $.each(settings.pt, function(i, pt){
                    contour.add( base.add( pt.multiply(scale) ) );
                });

                contour.closed = true;


                //contour.fullySelected = true;
                contour.smooth();
                
                contour.segments[2].handleOut =  settings.handle1.multiply(scale);
                contour.segments[5].handleIn =  settings.handle1.multiply(scale);


                contour.segments[3].handleIn =  settings.handle3.multiply(scale);
                contour.segments[4].handleIn =  settings.handle2.multiply(scale);

                contour.segments[3].handleOut =  settings.handle3.multiply(-scale);
                contour.segments[4].handleOut =  settings.handle2.multiply(-scale);
            }

            // Create a shirt with strips:
            var makeBarriole = function(){
                contour.fillColor = colors.short[1];
                var mask = contour.clone();
                mask.clipMask = true;
                _body.addChild(mask);

                for (var i = 0; i < 12; i++) {
                    var start = base.subtract(settings.pt[0].add(new Point(150, -50*(i -4) - 3 )  ).multiply(scale));
                    var size = new Size(300*scale, 25*scale);
                    var r = new Path.Rectangle( start, size);
                    r.fillColor = colors.short[0];
                    _body.addChild(r);
                };


            }

            // Create a plain color shirt
            var makePlain = function(){
                contour.fillColor = colors.short[0];
            }
            
            var init = function(){
                
                createContour();
                _body.addChild(contour);
                makeBarriole();

                return _body
            }


            return init();
        }


        var head = function(options){
            


            var default_settings = {
                anchor: new Point(0, -70)
            };

            var settings = $.extend({}, default_settings, options || {}) ;

            var _head = new Group();
            

            var contour = new Path.Circle( base.add(settings.anchor.multiply(scale)) , 65*scale);
            contour.strokeColor = 'black';
            contour.fillColor = colors.flesh;

            return _head;
        }


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
}