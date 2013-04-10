function Transport($scope){
	$scope.tempo = 30;
	$scope.start = 0;
	$scope.end = 10;

	$scope.computeLength = function(){
		$scope.length = ($scope.end - $scope.start) * (60 / $scope.tempo);
	}

	$scope.computeLength();
}