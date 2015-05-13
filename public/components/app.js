angular.module('app', ['ionic'])
    .filter('reverse', function() {
        return function (array) {
            return array.slice().reverse();
        };
    })
    .controller('AppController', function ($scope, $http, $ionicModal, $ionicPopup) {

        $scope.streams = [];
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

        $scope.log = [];
        var socket = io.connect(location.origin);
        socket.on('log', function (data) {
            $scope.log.push(data);
            if ($scope.log.length > 15) $scope.log.splice(0, 1);
            $scope.$apply();
        });

        $scope.setStream = function (channelName) {
            $http.put("/stream/play/" + channelName).then(
                function (res) {
                    console.log(res);
                },
                function (err) {
                    console.log(err);
                }
            );
        };

        $scope.shutdown = function () {
            $http.put("/stream/stop");
        };

        $scope.restart = function () {
            $http.put("/stream/restart");
        };

        $scope.settings = {quality: "high"};
        $http.get("/stream/settings").then(
            function (res) {
                $scope.settings.quality = res.data.quality;
                console.log($scope.settings);
            },
            function (err) {
                console.log(err);
            }
        );

        $scope.qualityPopup = {
            show: function () {
                $ionicPopup.show({
                    templateUrl: 'quality.html',
                    title: 'Quality',
                    scope: $scope,
                    buttons: [{text: 'Save', type: 'button-positive', onTap: function (e) {
                        this.close();
                        $http.put('/stream/settings/set/quality/' + $scope.settings.quality).then(
                            function () {},
                            function (err) {
                                console.log(err);
                            }
                        );
                    }}]
                });
            }
        };

        $scope.logPopup = {
            show: function () {
                $ionicPopup.show({
                    templateUrl: 'log.html',
                    title: 'Console Output',
                    scope: $scope,
                    buttons: [{text: 'Close', type: 'button-positive', onTap: function (e) {
                        this.close();
                    }}]
                });
            }
        };

    })
;
