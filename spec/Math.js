describe("Gaussian law", function() {

	var nb;

	 beforeEach(function() {
	    nb = Math.nrand();
	 });
	it("should return a number", function() {
    	console.log(nb);
    	expect((! isNaN (nb-0))).toBe(true);
  	});


});

describe("Clip", function() {

	var nb;

	 beforeEach(function() {
	    nb = clip(Math.nrand());
	 });
	it("should return a number ", function() {
    	console.log(nb);
    	expect((! isNaN (nb-0))).toBe(true);
  	});
  	it("should return a number between 0.0 and 1.0", function(){
  		expect((nb >= 0.0)).toBe(true);
  		expect((nb <= 1.0)).toBe(true);
  	});


});