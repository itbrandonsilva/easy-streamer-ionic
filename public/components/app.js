angular.module('app', ['ionic'])
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
                        $http.put('/stream/settings/set/quality/' + $scope.settings.quality).then(
                            function (res) {
                                console.log("SUSESS");
                                this.close();
                            },
                            function (err) {
                                console.log(err);
                                this.close();
                            }
                        );
                    }}]
                });
            }
        };
    })
;
