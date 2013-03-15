// Listen for a message from our script
self.addEventListener('message', function(e) {

  // Assign the passed data to a variable
  var poly = e.data
  
  // Our "computationally heavy" javascript function   
  function evaluatePoly(poly) {
    polyArr = poly.split(' ');
    var x = 2;
    var n = 0;
    
    for (var i = 0; i < polyArr.length; i++) {
      var current = polyArr[i]*x;
      current = Math.pow(current, i);
      n += current;
    }
    return current;
  }
  
  // Pass the result of evaluatePoly back to our main script
  self.postMessage(evaluatePoly(poly));
   
}, false);