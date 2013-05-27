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
    var Dancer = function(_base ){

        /*
            - base: is the point from which every other point is attached to
            - perdio: is the time of the beat from the music. Each dancer is supposed to be sync with it (some of them could be bad dancer and not snyc with it)

         */

        // the interface is paperjs Group 
        var __dancer__ = new Group();

        // The dance has, like every humain, some arms, a head, and a body:
        var left_arm = null, right_arm = null, body = null, head = null; 

        // Scale of all the body:
        // this is for comodity, so that I can work at the size I want:
        var scale = 0.17; // 0.17

        // The point from which we are constructing everything:
        var base = _base || paper.view.center;


        // Array of all dance register:
        // (a dance is a loop)
        var dances = {};

        // For the arm... to be moved somewhere else:
        var typesArm = ['sym', 'para', 'rand'];

        var type_arm = typesArm[2];


        // For the color.... to be moved somewhere else:
        // 
        var colors = null;

        // Constructor:
        var init = function(){
            
            // [TODO] change
            colors = {
                short: ['#3D4665', 'black'],
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
            
            
            return __dancer__;

        }


        //////////////////////////////////////////////
        //                                          //
        //               PUBLIC METHODS             //
        //                                          //
        //////////////////////////////////////////////

   
        // generate a completely random dancer:
        __dancer__.generateRandom = function(){
            // Random color:
            colors  = RandomColor();

            // type amr:
            type_arm = typesArm[ Math.round(Math.random()*3 - 0.2) ];
            
            // Construct arm:
            constructPart();
            // Make them of random color:
            left_arm.makeRandom();
            right_arm.makeRandom(left_arm.typeColor);

            // Body:
            body.setRandom();


            // Head
            head.setRandom();

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


        __dancer__.startDance = function(){
            $.each(dances, function(i, dance){
                dance.start();
            });
            return __dancer__;
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
            while( Math.random() < prob ){
                loop.addRandom(movement);
                prob = prob/2;
            }
            return loop;
        }


        var constructPart = function(){

            __dancer__.removeChildren();

            
            left_arm = new Arm();
            var rightset = {
                 anchor: new Point(-110, 0),
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
                
                colorArm();

                myfront = new arm_front();
                myback = new arm_back();
                
                

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


            // Interface:
            var __body__ = new Group();
            
            // Private variable for the overall contour:
            var contour = null;
            
            // Private function that construct the contour from the point:
            var createContour = function(_ptSet){

                var ptSet = _ptSet || settings;

                if(contour){
                    contour.remove();
                }

                contour = new Path();
                contour.strokeColor = 'black';
                contour.strokeWidth = 1;

                $.each(ptSet.pt, function(i, pt){
                    contour.add( base.add( pt.multiply(scale) ) );
                });

                contour.closed = true;


                //contour.fullySelected = true;
                contour.smooth();
                
                contour.segments[2].handleOut =  ptSet.handle1.multiply(scale);
                contour.segments[5].handleIn =  ptSet.handle1.multiply(scale);


                contour.segments[3].handleIn =  ptSet.handle3.multiply(scale);
                contour.segments[4].handleIn =  ptSet.handle2.multiply(scale);

                contour.segments[3].handleOut =  ptSet.handle3.multiply(-scale);
                contour.segments[4].handleOut =  ptSet.handle2.multiply(-scale);
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

            var make = function(){
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
            
            var init = function(){
                
                
                setFatness(settings.fat);
                createContour();
                __body__.addChild(contour);
                
                // Default: plain
                make();
                

                return __body__
            }

            __body__.setRandom = function(){

                __body__.removeChildren();
                
                setFatness(clip(Math.pow(Math.nrand(), 2)));

                createContour();

                __body__.addChild(contour);

                settings.type = selectRandom([ 'plain', 'square', 'line', 'diag', 'dual', 'dual_45', 'dual_45_bis' ]) ;
                make();
                
            }


            return init();
        }


        // Parse the hairs:
        var hairsSVG = parseSVG(['cheveux1', 'cheveux2', 'cheveux3'] );

        //////////////////////////////////////////////
        // 
        //  Head: class to create an head 
        //  
        //
        
        
        var Head = function(options){
            
            var __head__ = new Group();
            

            var default_settings = {
                anchor: new Point(0, -70),
                hair: 'coince'
            };

            var settings = $.extend({}, default_settings, options || {}) ;

            var head_center = base.add(settings.anchor.multiply(scale));

            var __head__ = new Group();


            
            var contour = null;


            var makeHair = function(){
                // console.log(settings.type)
                switch(settings.hair){
                    case 'normal': makeNormal(); break;
                    case 'coince': makeCoince(); break;
                    case 'punk': makePunk(); break;
                }
                
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


             var makePunk = function(){

                var cheveux = hairsSVG[2].clone();
                cheveux.translate(head_center.subtract(new Point(25*scale, 40*scale))).scale(6.5).scale(scale);
                cheveux.style= {
                    strokeColor: colors.short[0],
                    strokeWidth: 1.5
                };

                
                __head__.addChild(cheveux);

            }


            var init = function(){
                contour = new Path.Circle( head_center, 65*scale);
                contour.strokeColor = 'black';
                contour.fillColor = colors.flesh;

                __head__.addChild(contour);

                makeHair();

                return __head__;
            }

            __head__.setRandom = function(){

                __head__.removeChildren();
                __head__.addChild(contour);

                settings.hair = selectRandom(['normal', 'coince', 'punk'])
               makeHair();

               contour.fillColor = colors.flesh;

                return __head__;
            }
            



           

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