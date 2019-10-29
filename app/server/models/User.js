var mongoose   = require('mongoose'),
    bcrypt     = require('bcrypt'),
    validator  = require('validator'),
    jwt        = require('jsonwebtoken');
    JWT_SECRET = process.env.JWT_SECRET;

var profile = {

  // Basic info
  name: {
    type: String,
    min: 1,
    max: 100,
  },

  school: {
    type: String,
    min: 1,
    max: 150,
  },

  birthdayMonth: {
    type: String,
    enum: {
      values: 'm1 m2 m3 m4 m5 m6 m7 m8 m9 m10 m11 m12'.split(' '),
    }
  },

  birthdayDay: {
    type: String,
    enum: {
      values: 'd1 d2 d3 d4 d5 d6 d7 d8 d9 d10 d11 d12 d13 d14 d15 d16 d17 d18 d19 d20 d21 d22 d23 d24 d25 d26 d27 d28 d29 d30 d31'.split(' '),
    }
  },

  birthdayYear: {
    type: String,
    enum: {
      values: 'y2002 y2001 y2000 y1999 y1998 y1997 y1996 y1995 y1994 y1993 y1992 y1991 y1990 y1989 y1988 y1987 y1986 y1985 y1984 y1983 y1982 y1981 y1980 y1979 y1978 y1977 y1976 y1975 y1974 y1973 y1972 y1971 y1970'.split(' '),
    }
  },

  race: {
    type: String,
    enum: {
      values: 'AIAN API H WC N'.split(' '),
    }
  },

  levelOfStudy: {
    type: String,
    enum: {
      values: 'HS TS UU GU'.split(' '),
    }
  },

  graduationYear: {
    type: String,
    enum: {
      values: '2020 2021 2022 2023'.split(' '),
    }
  },

  major: {
    type: String,
    min: 0,
    max: 150
  },

  attendedHackathons: {
    type: Number,
    min: 0,
    max: 100
  },

  stemEssay: {
    type: String,
    min: 0,
    max: 1500
  },

  workshopsEssay: {
    type: String,
    min: 0,
    max: 1500
  },

  prizes: {
    type: String,
    min: 0,
    max: 150
  },

  emailAuthorize: {
    type: Boolean
  },

  adult: {
    type: Boolean
  },

  // Optional info for demographics
  gender: {
    type: String,
    enum : {
      values: 'M F NB O N'.split(' ')
    }
  }

};

// Only after confirmed
var confirmation = {
  phoneNumber: String,
  dietaryRestrictions: [String],
  otherDietaryRestriction: String,
  shirtSize: {
    type: String,
    enum: {
      values: 'XS S M L XL XXL'.split(' ')
    }
  },
  wantsHardware: Boolean,
  hardware: String,

  github: String,
  // twitter: String,
  website: String,
  resume: String,

  needsReimbursement: Boolean,
  // address: {
  //   name: String,
  //   line1: String,
  //   line2: String,
  //   city: String,
  //   state: String,
  //   zip: String,
  //   country: String
  // },
  // receipt: String,

  // hostNeededFri: Boolean,
  // hostNeededSat: Boolean,
  // genderNeutral: Boolean,
  // catFriendly: Boolean,
  // smokingFriendly: Boolean,
  // hostNotes: String,

  notes: String,

  codeOfConduct: Boolean,
  logistics: Boolean,
  photoRelease: Boolean
};

var status = {
  /**
   * Whether or not the user's profile has been completed.
   * @type {Object}
   */
  completedProfile: {
    type: Boolean,
    required: true,
    default: false,
  },
  admitted: {
    type: Boolean,
    required: true,
    default: false,
  },
  admittedBy: {
    type: String,
    validate: [
      validator.isEmail,
      'Invalid Email',
    ],
    select: false
  },
  confirmed: {
    type: Boolean,
    required: true,
    default: false,
  },
  declined: {
    type: Boolean,
    required: true,
    default: false,
  },
  checkedIn: {
    type: Boolean,
    required: true,
    default: false,
  },
  checkInTime: {
    type: Number,
  },
  confirmBy: {
    type: Number
  },
  reimbursementGiven: {
    type: Boolean,
    default: false
  }
};

// define the schema for our admin model
var schema = new mongoose.Schema({

  email: {
      type: String,
      required: true,
      unique: true,
      validate: [
        validator.isEmail,
        'Invalid Email',
      ]
  },

  password: {
    type: String,
    required: true,
    select: false
  },

  admin: {
    type: Boolean,
    required: true,
    default: false,
  },

  timestamp: {
    type: Number,
    required: true,
    default: Date.now(),
  },

  lastUpdated: {
    type: Number,
    default: Date.now(),
  },

  teamCode: {
    type: String,
    min: 0,
    max: 140,
  },

  verified: {
    type: Boolean,
    required: true,
    default: false
  },

  salt: {
    type: Number,
    required: true,
    default: Date.now(),
    select: false
  },

  /**
   * User Profile.
   *
   * This is the only part of the user that the user can edit.
   *
   * Profile validation will exist here.
   */
  profile: profile,

  /**
   * Confirmation information
   *
   * Extension of the user model, but can only be edited after acceptance.
   */
  confirmation: confirmation,

  status: status,

});

schema.set('toJSON', {
  virtuals: true
});

schema.set('toObject', {
  virtuals: true
});

//=========================================
// Instance Methods
//=========================================

// checking if this password matches
schema.methods.checkPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

// Token stuff
schema.methods.generateEmailVerificationToken = function(){
  return jwt.sign(this.email, JWT_SECRET);
};

schema.methods.generateAuthToken = function(){
  return jwt.sign(this._id, JWT_SECRET);
};

/**
 * Generate a temporary authentication token (for changing passwords)
 * @return JWT
 * payload: {
 *   id: userId
 *   iat: issued at ms
 *   exp: expiration ms
 * }
 */
schema.methods.generateTempAuthToken = function(){
  return jwt.sign({
    id: this._id
  }, JWT_SECRET, {
    expiresInMinutes: 60,
  });
};

//=========================================
// Static Methods
//=========================================

schema.statics.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
};

/**
 * Verify an an email verification token.
 * @param  {[type]}   token token
 * @param  {Function} cb    args(err, email)
 */
schema.statics.verifyEmailVerificationToken = function(token, callback){
  jwt.verify(token, JWT_SECRET, function(err, email) {
    return callback(err, email);
  });
};

/**
 * Verify a temporary authentication token.
 * @param  {[type]}   token    temporary auth token
 * @param  {Function} callback args(err, id)
 */
schema.statics.verifyTempAuthToken = function(token, callback){
  jwt.verify(token, JWT_SECRET, function(err, payload){

    if (err || !payload){
      return callback(err);
    }

    if (!payload.exp || Date.now() >= payload.exp * 1000){
      return callback({
        message: 'Token has expired.'
      });
    }

    return callback(null, payload.id);
  });
};

schema.statics.findOneByEmail = function(email){
  return this.findOne({
    email: email.toLowerCase()
  });
};

/**
 * Get a single user using a signed token.
 * @param  {String}   token    User's authentication token.
 * @param  {Function} callback args(err, user)
 */
schema.statics.getByToken = function(token, callback){
  jwt.verify(token, JWT_SECRET, function(err, id){
    if (err) {
      return callback(err);
    }
    this.findOne({_id: id}, callback);
  }.bind(this));
};

schema.statics.validateProfile = function(profile, cb){
  return cb(!(
    profile.name.length > 0 &&
    profile.school.length > 0 &&
    ['2020', '2021', '2022', '2023'].indexOf(profile.graduationYear) > -1 &&
    ['M', 'F', 'NB', 'O', 'N'].indexOf(profile.gender) > -1
    ));
};

//=========================================
// Virtuals
//=========================================

/**
 * Has the user completed their profile?
 * This provides a verbose explanation of their furthest state.
 */
schema.virtual('status.name').get(function(){

  if (this.status.checkedIn) {
    return 'checked in';
  }

  if (this.status.declined) {
    return "declined";
  }

  if (this.status.confirmed) {
    return "confirmed";
  }

  if (this.status.admitted) {
    return "admitted";
  }

  if (this.status.completedProfile){
    return "submitted";
  }

  if (!this.verified){
    return "unverified";
  }

  return "incomplete";

});

module.exports = mongoose.model('User', schema);
