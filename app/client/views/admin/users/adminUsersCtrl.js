const moment = require('moment');
const swal = require('sweetalert');

angular.module('reg')
  .controller('AdminUsersCtrl',[
    '$scope',
    '$state',
    '$stateParams',
    'UserService',
    'AuthService',
    function($scope, $state, $stateParams, UserService, AuthService){

      $scope.pages = [];
      $scope.users = [];

      // Semantic-UI moves modal content into a dimmer at the top level.
      // While this is usually nice, it means that with our routing will generate
      // multiple modals if you change state. Kill the top level dimmer node on initial load
      // to prevent this.
      $('.ui.dimmer').remove();
      // Populate the size of the modal for when it appears, with an arbitrary user.
      $scope.selectedUser = {};
      $scope.selectedUser.sections = generateSections({status: '', confirmation: {
        dietaryRestrictions: []
      }, profile: ''});

      function updatePage(data){
        $scope.users = data.users;
        $scope.currentPage = data.page;
        $scope.pageSize = data.size;

        var p = [];
        for (var i = 0; i < data.totalPages; i++){
          p.push(i);
        }
        $scope.pages = p;
      }

      UserService
        .getPage($stateParams.page, $stateParams.size, $stateParams.query)
        .then(response => {
          updatePage(response.data);
        });

      $scope.$watch('queryText', function(queryText){
        UserService
          .getPage($stateParams.page, $stateParams.size, queryText)
          .then(response => {
            updatePage(response.data);
          });
      });

      $scope.goToPage = function(page){
        $state.go('app.admin.users', {
          page: page,
          size: $stateParams.size || 20
        });
      };

      $scope.goUser = function($event, user){
        $event.stopPropagation();

        $state.go('app.admin.user', {
          id: user._id
        });
      };

      $scope.toggleCheckIn = function($event, user, index) {
        $event.stopPropagation();

        if (!user.status.checkedIn){
          swal({
            title: "Whoa, wait a minute!",
            text: "You are about to check in " + user.profile.name + "!",
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
                text: "Yes, check them in",
                value: true,
                visible: true
              }
            }
          })
          .then(value => {
            if (!value) {
              return;
            }
            if(!user.status.confirmed) {
              console.log("Checking again");
              swal({
                title: "Are you sure?",
                text: "" + user.profile.name + " has not been confirmed. Make " +
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
                .checkIn(user._id)
                .then(response => {
                  $scope.users[index] = response.data;
                  swal("Accepted", response.data.profile.name + " has been checked in.", "success");
                });
              });
            }
            else {
              UserService
                .checkIn(user._id)
                .then(response => {
                  $scope.users[index] = response.data;
                  swal("Accepted", response.data.profile.name + " has been checked in.", "success");
                });
            }
          });
        } else {
          UserService
            .checkOut(user._id)
            .then(response => {
              $scope.users[index] = response.data;
              swal("Accepted", response.data.profile.name + ' has been checked out.', "success");
            });
        }
      };

      $scope.reimburse = function($event, user, bool, index) {
        $event.stopPropagation();
        if(bool) {
          UserService
            .giveReimbursement(user._id)
            .then(response => {
              $scope.users[index] = response.data;
              swal("Given", response.data.profile.name + '\'s reimbursements', "success");
            });
        }
        else {
          UserService
            .removeReimbursement(user._id)
            .then(response => {
              $scope.users[index] = response.data;
              swal("Removed", response.data.profile.name + '\'s reimbursements', "success");
            });
        }
      };

      $scope.acceptUser = function($event, user, index) {
        $event.stopPropagation();

        console.log(user);

        swal({
          buttons: {
            cancel: {
              text: "Cancel",
              value: null,
              visible: true
            },
            accept: {
              className: "danger-button",
              closeModal: false,
              text: "Yes, accept them",
              value: true,
              visible: true
            }
          },
          dangerMode: true,
          icon: "warning",
          text: "You are about to accept " + user.profile.name + "!",
          title: "Whoa, wait a minute!"
        }).then(value => {
          if (!value) {
            return;
          }

          swal({
            buttons: {
              cancel: {
                text: "Cancel",
                value: null,
                visible: true
              },
              yes: {
                className: "danger-button",
                closeModal: false,
                text: "Yes, accept this user",
                value: true,
                visible: true
              }
            },
            dangerMode: true,
            title: "Are you sure?",
            text: "Your account will be logged as having accepted this user. " +
              "Remember, this power is a privilege.",
            icon: "warning"
          }).then(value => {
            if (!value) {
              return;
            }

            var email = $scope.users[index].email;
            AuthService.sendAcceptEmail(email);

            UserService
              .admitUser(user._id)
              .then(response => {
                $scope.users[index] = response.data;
                swal("Accepted", response.data.profile.name + ' has been admitted.', "success");
              });
          });
        });
      };

      $scope.toggleAdmin = function($event, user, index) {
        $event.stopPropagation();

        if (!user.admin){
          swal({
            title: "Whoa, wait a minute!",
            text: "You are about make " + user.email + " an admin!",
            icon: "warning",
            buttons: {
              cancel: {
                text: "Cancel",
                value: null,
                visible: true
              },
              confirm: {
                text: "Yes, make them an admin",
                className: "danger-button",
                closeModal: false,
                value: true,
                visible: true
              }
            }
          }).then(value => {
            if (!value) {
              return;
            }

            UserService
              .makeAdmin(user._id)
              .then(response => {
                $scope.users[index] = response.data;
                swal("Made", response.data.email + ' an admin.', "success");
              });
            }
          );
        } else {
          UserService
            .removeAdmin(user._id)
            .then(response => {
              $scope.users[index] = response.data;
              swal("Removed", response.data.email + ' as admin', "success");
            });
        }
      };

      function formatTime(time){
        if (time) {
          return moment(time).format('MMMM Do YYYY, h:mm:ss a');
        }
      }

      $scope.rowClass = function(user) {
        if (user.admin){
          return 'admin';
        }
        if (user.status.confirmed) {
          return 'positive';
        }
        if (user.status.admitted && !user.status.confirmed) {
          return 'warning';
        }
      };

      function selectUser(user){
        $scope.selectedUser = user;
        $scope.selectedUser.sections = generateSections(user);
        $('.long.user.modal')
          .modal('show');
      }

      function readable(sym) {
        if(sym == "M") return "Male";
        else if (sym == "F") return "Female";
        else if (sym == "O") return "Other";
        else if (sym == "NB") return "Non Binary";
        else if (sym == "N") return "Prefer not to answer";
        else if (sym == "AIAN") return "American Indian or Alaskan Native";
        else if (sym == "API") return "Asian/Pacific Islander";
        else if (sym == "H") return "Hispanic";
        else if (sym == "WC") return "White/Caucasian";
        else if (sym == "BAA") return "Black or African American";
        else if (sym == "HS") return "High School";
        else if (sym == "TS") return "Technical School";
        else if (sym == "UU") return "Undergraduate University";
        else if (sym == "GU") return "Graduate University";
        else if (sym == "m1" || sym == "d1") return "1";
        else if (sym == "m2" || sym == "d2") return "2";
        else if (sym == "m3" || sym == "d3") return "3";
        else if (sym == "m4" || sym == "d4") return "4";
        else if (sym == "m5" || sym == "d5") return "5";
        else if (sym == "m6" || sym == "d6") return "6";
        else if (sym == "m7" || sym == "d7") return "7";
        else if (sym == "m8" || sym == "d8") return "8";
        else if (sym == "m9" || sym == "d9") return "9";
        else if (sym == "m10" || sym == "d10") return "10";
        else if (sym == "m11" || sym == "d11") return "11";
        else if (sym == "m12" || sym == "d12") return "12";
        else if (sym == "d13") return "13";
        else if (sym == "d14") return "14";
        else if (sym == "d15") return "15";
        else if (sym == "d16") return "16";
        else if (sym == "d17") return "17";
        else if (sym == "d18") return "18";
        else if (sym == "d19") return "19";
        else if (sym == "d20") return "20";
        else if (sym == "d21") return "21";
        else if (sym == "d22") return "22";
        else if (sym == "d23") return "23";
        else if (sym == "d24") return "24";
        else if (sym == "d25") return "25";
        else if (sym == "d26") return "26";
        else if (sym == "d27") return "27";
        else if (sym == "d28") return "28";
        else if (sym == "d29") return "29";
        else if (sym == "d30") return "30";
        else if (sym == "d31") return "31";
        else if (sym == "y2002") return "2002";
        else if (sym == "y2001") return "2001";
        else if (sym == "y2000") return "2000";
        else if (sym == "y1999") return "1999";
        else if (sym == "y1998") return "1998";
        else if (sym == "y1997") return "1997";
        else if (sym == "y1996") return "1996";
        else if (sym == "y1995") return "1995";
        else if (sym == "y1994") return "1994";
        else if (sym == "y1993") return "1993";
        else if (sym == "y1992") return "1992";
        else if (sym == "y1991") return "1991";
        else if (sym == "y1990") return "1990";
        else if (sym == "y1989") return "1989";
        else if (sym == "y1988") return "1988";
        else if (sym == "y1987") return "1987";
        else if (sym == "y1986") return "1986";
        else if (sym == "y1985") return "1985";
        else if (sym == "y1984") return "1984";
        else if (sym == "y1983") return "1983";
        else if (sym == "y1982") return "1982";
        else if (sym == "y1981") return "1981";
        else if (sym == "y1980") return "1980";
        else if (sym == "y1979") return "1979";
        else if (sym == "y1978") return "1978";
        else if (sym == "y1977") return "1977";
        else if (sym == "y1976") return "1976";
        else if (sym == "y1975") return "1975";
        else if (sym == "y1974") return "1974";
        else if (sym == "y1973") return "1973";
        else if (sym == "y1972") return "1972";
        else if (sym == "y1971") return "1971";
        else if (sym == "y1970") return "1970";
        else return sym;
      }

      function generateSections(user){
        return [
          {
            name: 'Basic Info',
            fields: [
              {
                name: 'Created On',
                value: formatTime(user.timestamp)
              },{
                name: 'Last Updated',
                value: formatTime(user.lastUpdated)
              },{
                name: 'Confirm By',
                value: formatTime(user.status.confirmBy) || 'N/A'
              },{
                name: 'Checked In',
                value: formatTime(user.status.checkInTime) || 'N/A'
              },{
                name: 'Email',
                value: user.email
              },{
                name: 'Team',
                value: user.teamCode || 'None'
              }
            ]
          },{
            name: 'Profile',
            fields: [
              {
                name: 'Name',
                value: user.profile.name
              },{
                name: 'School',
                value: user.profile.school
              },{
                name: 'Birthday',
                value: readable(user.profile.birthdayMonth) + "/" + readable(user.profile.birthdayDay) + "/" + readable(user.profile.birthdayYear)
              },{
                name: 'Gender Identity',
                value: readable(user.profile.gender)
              },{
                name: 'Race/Ethnicity',
                value: readable(user.profile.race)
              },{
                name: 'Level of Study',
                value: readable(user.profile.levelOfStudy)
              },{
                name: 'Graduation Year',
                value: user.profile.graduationYear
              },{
                name: 'Major',
                value: user.profile.major
              },{
                name: 'Hackathons Attended',
                value: user.profile.attendedHackathons
              },{
                name: 'Stem Essay',
                value: user.profile.stemEssay
              },{
                name: 'Workshops Essay',
                value: user.profile.workshopsEssay
              },{
                name: 'Prizes',
                value: user.profile.prizes
              },{
                name: 'MLH Email Authorization',
                value: user.profile.emailAuthorize,
                type: 'boolean'
              }
            ]
          },{
            name: 'Confirmation',
            fields: [
              {
                name: 'Phone Number',
                value: user.confirmation.phoneNumber
              },{
                name: 'Dietary Restrictions',
                value: user.confirmation.dietaryRestrictions.join(', ')
              },{
                name: 'Other Dietary Restrictions',
                value: user.confirmation.otherDietaryRestriction
              },{
                name: 'Shirt Size',
                value: user.confirmation.shirtSize
              },{
                name: 'Github',
                value: user.confirmation.github
              },{
                name: 'Website',
                value: user.confirmation.website
              },{
                name: 'Needs Hardware',
                value: user.confirmation.wantsHardware,
                type: 'boolean'
              },{
                name: 'Hardware Requested',
                value: user.confirmation.hardware
              }
            ]
          }
          // ,{
          //   name: 'Hosting',
          //   fields: [
          //     {
          //       name: 'Needs Hosting Friday',
          //       value: user.confirmation.hostNeededFri,
          //       type: 'boolean'
          //     },{
          //       name: 'Needs Hosting Saturday',
          //       value: user.confirmation.hostNeededSat,
          //       type: 'boolean'
          //     },{
          //       name: 'Gender Neutral',
          //       value: user.confirmation.genderNeutral,
          //       type: 'boolean'
          //     },{
          //       name: 'Cat Friendly',
          //       value: user.confirmation.catFriendly,
          //       type: 'boolean'
          //     },{
          //       name: 'Smoking Friendly',
          //       value: user.confirmation.smokingFriendly,
          //       type: 'boolean'
          //     },{
          //       name: 'Hosting Notes',
          //       value: user.confirmation.hostNotes
          //     }
          //   ]
          // }
          ,{
            name: 'Travel',
            fields: [
              {
                name: 'Needs Reimbursement',
                value: user.confirmation.needsReimbursement,
                type: 'boolean'
              },{
                name: 'Received Reimbursement',
                value: user.confirmation.needsReimbursement && user.status.reimbursementGiven,
                type: 'boolean'
              },{
                name: 'Additional Notes',
                value: user.confirmation.notes
              }
            ]
          }
        ];
      }

      $scope.selectUser = selectUser;
    }]);
