const angular = require("angular");
const swal = require("sweetalert");

angular.module('reg')
  .controller('ApplicationCtrl', [
    '$scope',
    '$rootScope',
    '$state',
    '$http',
    'currentUser',
    'settings',
    'Session',
    'UserService',
    function($scope, $rootScope, $state, $http, currentUser, settings, Session, UserService) {

      // Set up the user
      $scope.user = currentUser.data;
      // Is the student from MIT?
      $scope.isMitStudent = $scope.user.email.split('@')[1] == 'ou.edu';

      // If so, default them to adult: true
      // if ($scope.isMitStudent){
      //   $scope.user.profile.adult = true;
      // }

      // Populate the school dropdown
      populateSchools();
      _setupForm();

      $scope.regIsClosed = Date.now() > settings.data.timeClose;

      /**
       * TODO: JANK WARNING
       */
      function populateSchools(){
        $http
          .get('/assets/schools.json')
          .then(function(res){
            var schools = res.data;
            var email = $scope.user.email.split('@')[1];

            if($scope.user.profile == null) {
              $scope.user.profile = {};
            }

            if (schools[email]){
              $scope.user.profile.school = schools[email].school;
              $scope.autoFilledSchool = true;
            }
          });

        $http
          .get('/assets/schools.csv')
          .then(function(res){
            $scope.schools = res.data.split('\n');
            $scope.schools.push('Other');

            var content = [];

            for(i = 0; i < $scope.schools.length; i++) {
              $scope.schools[i] = $scope.schools[i].trim();
              content.push({title: $scope.schools[i]})
            }

            $('#school.ui.search')
              .search({
                source: content,
                cache: true,
                onSelect: function(result, response) {
                  $scope.user.profile.school = result.title.trim();
                }
              })
          });
      }

      function _updateUser(e){
        UserService
          .updateProfile(Session.getUserId(), $scope.user.profile)
          .then(response => {
            swal("Awesome!", "Your application has been saved.", "success").then(value => {
              $state.go("app.dashboard");
            });
          }, response => {
            swal("Uh oh!", "Something went wrong.", "error");
          });
      }

      // function isMinor() {
      //   return !$scope.user.profile.adult;
      // }

      function minorsAreAllowed() {
        return settings.data.allowMinors;
      }

      function isMinor() {
        if(($scope.user.profile.birthdayYear == "y2002") &&
           ($scope.user.profile.birthdayMonth == "m3" ||
            $scope.user.profile.birthdayMonth == "m4" ||
            $scope.user.profile.birthdayMonth == "m5" ||
            $scope.user.profile.birthdayMonth == "m6" ||
            $scope.user.profile.birthdayMonth == "m7" ||
            $scope.user.profile.birthdayMonth == "m8" ||
            $scope.user.profile.birthdayMonth == "m9" ||
            $scope.user.profile.birthdayMonth == "m10" ||
            $scope.user.profile.birthdayMonth == "m11" ||
            $scope.user.profile.birthdayMonth == "m12")) {
              return true;
        }
        else if (($scope.user.profile.birthdayMonth == "m2") &&
                 ($scope.user.profile.birthdayDay ==  "d9" ||
                  $scope.user.profile.birthdayDay == "d10" ||
                  $scope.user.profile.birthdayDay == "d11" ||
                  $scope.user.profile.birthdayDay == "d12" ||
                  $scope.user.profile.birthdayDay == "d13" ||
                  $scope.user.profile.birthdayDay == "d14" ||
                  $scope.user.profile.birthdayDay == "d15" ||
                  $scope.user.profile.birthdayDay == "d16" ||
                  $scope.user.profile.birthdayDay == "d17" ||
                  $scope.user.profile.birthdayDay == "d18" ||
                  $scope.user.profile.birthdayDay == "d19" ||
                  $scope.user.profile.birthdayDay == "d20" ||
                  $scope.user.profile.birthdayDay == "d21" ||
                  $scope.user.profile.birthdayDay == "d22" ||
                  $scope.user.profile.birthdayDay == "d23" ||
                  $scope.user.profile.birthdayDay == "d24" ||
                  $scope.user.profile.birthdayDay == "d25" ||
                  $scope.user.profile.birthdayDay == "d26" ||
                  $scope.user.profile.birthdayDay == "d27" ||
                  $scope.user.profile.birthdayDay == "d28" ||
                  $scope.user.profile.birthdayDay == "d29" ||
                  $scope.user.profile.birthdayDay == "d30" ||
                  $scope.user.profile.birthdayDay == "d31")) {
                    return true;
        }
        else {
          return false;
        }
      }

      // function minorsValidation() {
      //   // Are minors allowed to register?
      //   if (isMinor() && !minorsAreAllowed()) {
      //     return false;
      //   }
      //   return true;
      // }

      function _setupForm(){
        // Custom minors validation rule
        $.fn.form.settings.rules.allowMinors = function (value) {
          return minorsValidation();
        };

        // Semantic-UI form validation
        $('.ui.form').form({
          inline: true,
          fields: {
            name: {
              identifier: 'name',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter your name.'
                }
              ]
            },
            school: {
              identifier: 'school',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter your school name.'
                }
              ]
            },
            birthdayMonth: {
              identifier: 'birthdayMonth',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter your birthday month.'
                }
              ]
            },
            birthdayDay: {
              identifier: 'birthdayDay',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter your birthday day.'
                }
              ]
            },
            birthdayYear: {
              identifier: 'birthdayYear',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter your birthday year.'
                }
              ]
            },
            birthdayMonth: {
              identifier: 'birthdayMonth',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter your birthday month.'
                }
              ]
            },
            gender: {
              identifier: 'gender',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please select a gender.'
                }
              ]
            },
            levelOfStudy: {
              identifier: 'levelOfStudy',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please select your most current level of study.'
                }
              ]
            },
            race: {
              identifier: 'race',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please select a race/ethnicity.'
                }
              ]
            },
            year: {
              identifier: 'year',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please select your graduation year.'
                }
              ]
            },
            major: {
              identifier: 'major',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please select your major.'
                }
              ]
            },
            attendedHackathons: {
              identifier: 'attendedHackathons',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter the number of hackathons you have attended.'
                }
              ]
            },
            stemEssay: {
              identifier: 'stemEssay',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please fill out the essay.'
                }
              ]
            },
            workshopsEssay: {
              identifier: 'workshopsEssay',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please fill out the essay.'
                }
              ]
            },
            prizes: {
              identifier: 'prizes',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please fill out the essay.'
                }
              ]
            }
          }
        });
      }

      $scope.submitForm = function(){
        if ($('.ui.form').form('is valid') && !isMinor()){
          _updateUser();
        }
        else if (isMinor()) {
          swal("You must be 18 years or older", "by February 8th, 2020", "error");
        }
        else {
          swal("Uh oh!", "Please fill the required fields", "error");
        }
      };
    }]);
