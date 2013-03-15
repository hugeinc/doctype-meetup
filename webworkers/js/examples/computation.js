(function() {

  // Set up our dom variables for form and the result area
  form = document.getElementsByTagName('form')[0];
  result = document.getElementById('result');
  
  // Listen to form submission
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    result.textContent = '';
    
    // Spawn new computation.js worker
    var worker = new Worker('/js/workers/compute.js');
    
    input = document.getElementById('poly').value;
    // Pass the user input to the worker
    worker.postMessage(input);
    
    // Listen for the message passed fro the worker and
    // handle the data received
    worker.onmessage = function (event) {
      result.textContent = event.data;
    };
  
  });

})();