/**
 * @author Rob LaPlaca - rlaplaca@hugeinc.com
 * @description Takes a string input as a message and sends back the result reversed
 */
self.onmessage = function(e) {
	var stringToReverse = e.data;
	postMessage( stringToReverse.split("").reverse().join("") );
};