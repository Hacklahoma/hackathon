const swal = require('sweetalert');

angular.module('reg')
  .controller('AdminUserCtrl',[
    '$scope',
    '$http',
    'user',
    'UserService',
    function($scope, $http, User, UserService){
      $scope.selectedUser = User.data;

      // Populate the school dropdown
      populateSchools();

      /**
       * TODO: JANK WARNING
       */
      function populateSchools(){

        $http
          .get('/assets/schools.json')
          .then(function(res){
            var schools = res.data;
            var email = $scope.selectedUser.email.split('@')[1];

            if (schools[email]){
              $scope.selectedUser.profile.school = schools[email].school;
              $scope.autoFilledSchool = true;
            }

          });
      }

      // Dietary Restrictions
      var dietaryRestrictions = {
        'Vegetarian': false,
        'Vegan': false,
        'Halal': false,
        'Kosher': false,
        'Nut Allergy': false,
        'Other': false
      };

      if ($scope.selectedUser.confirmation.dietaryRestrictions){
        $scope.selectedUser.confirmation.dietaryRestrictions.forEach(function(restriction){
          if (restriction in dietaryRestrictions){
            dietaryRestrictions[restriction] = true;
          }
        });
      }

      $scope.dietaryRestrictions = dietaryRestrictions;


      $scope.updateProfile = function(){
        UserService
          .updateProfile($scope.selectedUser._id, $scope.selectedUser.profile)
          .then(response => {
            $selectedUser = response.data;
            swal("Updated!", "Profile updated.", "success");
          }, response => {
            swal("Oops, you forgot something.");
          });
      };

      $scope.qrCheckIn = function() {
        if (!User.status.checkedIn) {
              if (!$scope.selectedUser.status.confirmed) {
                console.log("Checking again");
                swal({
                  title: "Are you sure?",
                  text: "" + $scope.selectedUser.profile.name + " has not been confirmed. Make " +
                    "sure they submit the confirmation form.",
                  icon: "warning",
                  buttons: {
                    cancel: {
                      text: "Cancel",
                      value: null,
                      visible: true
                    },
                    checkIn: {
                      className: "danger-button",
                      closeModal: false,
                      text: "I am sure",
                      value: true,
                      visible: true
                    }
                  }
                })
                  .then(value => {
                    if (!value) {
                      return;
                    }
                    UserService
                      .checkIn($scope.selectedUser._id)
                      .then(response => {
                        swal("Accepted", response.data.profile.name + " has been checked in.", "success");
                      });
                  });
              }
              else {
                UserService
                  .checkIn($scope.selectedUser._id)
                  .then(response => {
                    swal("Accepted", response.data.profile.name + " has been checked in.", "success");
                  });
              }
            };
      };

      $scope.updateConfirmation = function(){
        var confirmation = $scope.selectedUser.confirmation;
        // Get the dietary restrictions as an array
        var drs = [];
        Object.keys($scope.dietaryRestrictions).forEach(function(key){
          if ($scope.dietaryRestrictions[key]){
            drs.push(key);
          }
        });
        confirmation.dietaryRestrictions = drs;

        UserService
          .updateConfirmation($scope.selectedUser._id, $scope.selectedUser.confirmation)
          .then(response => {
            swal("Updated!", "Confirmation updated.", "success").then(value => {
            });
          }, response => {
            swal("Oops, you forgot something.");
          });
      };
    }]);
