with (paper){
    var Dancer = function(center){

        // Just draw a body first:
        body();

        // Interface:
        return {

        };
    }


    var arm_front = function(){

        // Interface:
        return {

            // Execute when enter the frame:
            onFrame: function(){

            }
        }
    }

    
    var arm_back = function(){

        // Interface:
        return {

            // Execute when enter the frame:
            onFrame: function(){

            }
        }
    }    

    var arm = function(){

        // Interface:
        return {

            // Execute when enter the frame:
            onFrame: function(){

            }
        }
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
    }


    // ------------------------------------------------
    function getVector(radians, length) {
        return new Point({
            // Convert radians to degrees:
            angle: radians * 180 / Math.PI,
            length: length
        });
    }
}