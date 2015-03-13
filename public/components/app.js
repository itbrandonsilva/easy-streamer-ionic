angular.module('app', [])
    .controller('AppController', function ($scope, $http) {

        $scope.streams = [];

        Twitch.init({clientId: '{{ client_id }}'}, function(err, status) {
            if (err) return console.error(err);
            Twitch.api({
                method: 'streams',
                params: {limit: 25} 
            }, function (err, res) {
                if (err) return console.error(err);
                var streams = res.streams;
                $scope.streams = streams;
                $scope.$apply();
            });
        });

        $scope.setStream = function (channelName) {
            console.log(channelName);
            $http.get("/stream/set/" + channelName).then(
                function (res) {
                    console.log(res);
                },
                function (err) {
                    console.error(err);
                }
            );
        };
    })
;
