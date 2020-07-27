const db = require('../util/database');

module.exports = class User {
  constructor(username, password) {
    this.username = username;
    this.password = password;
  }

  /* Authenticate user credentials with database. */
  static authUser(username, password, result) {
    db.query(`SELECT * FROM users WHERE username = "${username}"`)
    .then((tuples) => {
      if (!tuples[0].length) {
        return result({message: 'Invalid email or password.'});
      }
      if (!(tuples[0][0].password == password)) {
        return result({message: 'Invalid email or password.'});
      }
      return result({message: "Success"});
    })
    .catch(function (error) {
      console.log(error);
    })
  }
};
