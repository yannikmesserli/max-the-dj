'use_strict';




/*
    Be careful, when you assign multiple variables with ','
    in a class, it, for some reasons, share this variable with all the
    instance...
 */

with (paper){
    var Dancer = function(base, period ){

        /*
            - base: is the point from which every other point is attached to
            - perdio: is the time of the beat from the music. Each dancer is supposed to be sync with it (some of them could be bad dancer and not snyc with it)

         */

        var _dancer = new Group();





        // Constructor:
        var init = function(){
            
            // Just draw a body first:
            var o = body();
           
            var left_arm = new arm( new Point(120, 250));
           
            var right_arm = new arm( new Point(280, 250));
            _dancer.addChildren([o, left_arm, right_arm]);
            

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

           
            
            // left_arm.rotate.start(0.8, 500).once('terminate', function(){
            //     left_arm.foldElbow.start(0.7, 200).once('terminate', function(){
            //         left_arm.foldElbow.start(0.6, 0.1, 400);
            //     });
            // });

            
            right_arm.foldElbow.start(0.5, 400);


            return _dancer;

        }

   





        // The arms:
        var arm = function(anchor, options){

            /* Arm has 3 main points:
             * - the starting point
             * - the elbow point
             * - the hand point
             *
             * Depending of the point, we use
             * the arm_front and arm_back to draw it
             */

            var pt = {};
            var _arm = new Group();

            // Add event handler:
            smokesignals.convert(_arm);

            var default_settings = {
                elbow: new Point(0, 100),
                end: new Point(0, 100),
                rotate: {
                    max: 200,
                    min: 90
                },
                foldElbow: {
                    max: 160,
                    min: 0
                }
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
                vect2.angle = vect2.angle - vect.angle + val;
                vect.angle = val;
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
                vect2.angle = alpha + beta;
                pt.end =  vect2.add(pt.elbow); 
                _arm.emit('changed');

            }).on('terminate', function(){
                //console.log('terminate');
            });
            
            var init = function(){
                construct_point();
       
                var myfront = new arm_front();
                var myback = new arm_back();
                
                _arm.addChildren([myfront, myback ]);

                return _arm;
            };


            var construct_point = function(){
                pt.begin = anchor || new Point(10,0);
                pt.elbow = pt.begin.add(settings.elbow);
                pt.end = pt.elbow.add(settings.end);
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


                part_arm.moveStartTo = function(new_p, t){
                    moveGenTo(__starting_point__, __ending_point__, new_p, t);
                }

                part_arm.moveEndTo = function(new_p, t){
                    moveGenTo(__ending_point__, __starting_point__, new_p, t);
                }


                var moveGenTo = function( string_pt, string_pt2, _new_p, _t){
                    if( _t > 0 && _t < 1){
                        
                        var t = _t || 1;
                        pt[string_pt] = pt[string_pt].add(  _new_p.subtract(pt[string_pt]).multiply( new Point(t, t) ));
                        part_arm.updateView();
                    }
                    return part_arm;
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
                        fillColor: '#FFF0B3'
                    });
                    handy.closed = true; //handy.selected = true;
                    handy.position = pos;

                    return handy;
                }


                var draw = function(start, end){
                    
                    var armi = new Path([ start, end] );
                    armi.style = {
                        strokeColor: '#000',
                        strokeWidth: 1
                    };


                    return [armi, hand(end) ];

                }


                return armGen('elbow', 'end', draw);
            }


            // back part of the arm
            var arm_back = function(){
                var tmp = armGen('begin', 'elbow');
                

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
         
        var body = function(){

            var _body = new Group();
         // Huge circle:
            var big = new Path.Circle({
                center: [200, 300],
                radius: 100,
            });
            
            // Small circle:
            var small = new Path.Circle({
                center: [200, 200],
                radius: 70,
            });
            // Styling for all:
            var style = {
                fillColor: 'white',
                strokeColor: 'black',
                strokeWidth: 1
            };

            small.style = style;
            big.style = style;
            small.selected = true;
            big.selected = true;

            var center1 = small.position;
            var center2 = big.position;
            var radius1 = small.bounds.width / 2;
            var radius2 = big.bounds.width / 2;
            var pi2 = Math.PI / 2;
            var d = center1.getDistance(center2);
            var u1 = Math.acos((radius1 * radius1 + d * d - radius2 * radius2) /
                        (2 * radius1 * d)),
                u2 = Math.acos((radius2 * radius2 + d * d - radius1 * radius1) /
                        (2 * radius2 * d));
            

            
            var angle1 = center2.getAngleInRadians(center1) + Math.PI/2.3;
            var angle2 = Math.acos((radius1 - radius2) / d);
            var angle1a = angle1 + u1 + (angle2 - u1) * 0.5;
            var angle1b = angle1 - u1 - (angle2 - u1) * 0.5;
            var angle2a = angle1 + Math.PI - u2 - (Math.PI - u2 - angle2) * 0.5;
            var angle2b = angle1 - Math.PI + u2 + (Math.PI - u2 - angle2) * 0.5;
            var p1a = center1.add(   getVector(angle1a, radius1));
            var p1b = center1.add(   getVector(angle1b, radius1));
            var p2a = center2.add(   getVector(angle2a, radius2));
            var p2b = center2.add(   getVector(angle2b, radius2));



            // define handle length by the distance between
            // both ends of the curve to draw
            var totalRadius = (radius1 + radius2);
            var d2 = Math.min(0.5 * 2.4, (p1a.subtract(p2a)).length / totalRadius);

            // case circles are overlapping:
            d2 *= Math.min(1, d * 2 / (radius1 + radius2));

            radius1 *= d2;
            radius2 *= d2;

            var path = new Path({
                segments: [p1a, p2a, p2b, p1b],
                style:  {
                    fillColor: 'black',
                },
                closed: true
            });
            var segments = path.segments;
            segments[0].handleOut = getVector(angle1a - pi2, radius1);
            segments[1].handleIn = getVector(angle2a + pi2, radius2);
            segments[2].handleOut = getVector(angle2b - pi2, radius2);
            segments[3].handleIn = getVector(angle1b + pi2, radius1);

            path.selected = true;

            _body.addChildren([big, small, path]);
            return _body;
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