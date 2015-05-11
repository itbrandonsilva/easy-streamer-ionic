angular.module('app', ['ionic'])
    .controller('AppController', function ($scope, $http, $ionicModal) {

        $scope.streams = [];

        $ionicModal.fromTemplateUrl('settings.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modal = modal;
        });

        $scope.loadStreams = function () {
            Twitch.api({
                method: 'streams',
                params: {limit: 25} 
            }, function (err, res) {
                if (err) return console.error(err);
                var streams = res.streams;
                $scope.streams = streams;
                console.log(streams);
                $scope.$apply();
            });
        };

        Twitch.init({clientId: '{{ client_id }}'}, function(err, status) {
            if (err) return console.error(err);
            $scope.loadStreams();
        });

        $scope.setStream = function (channelName) {
            $http.put("/stream/play/" + channelName).then(
                function (res) {
                    console.log(res);
                },
                function (err) {
                    console.error(err);
                }
            );
        };

        $scope.shutdown = function () {
            $http.put("/stream/stop");
        };

        $scope.restart = function () {
            $http.put("/stream/restart");
        };

        $scope.showSettings = function () {
            $scope.modal.show();
        };
    })
;
