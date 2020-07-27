const JobsPart = require("../models/jobPart");
const User = require("../models/user");

exports.getJobs = (req, res, next) => {
  const jobName = req.params.jobName;
  JobsPart.getJobsData(jobName, jobs => {
    res.status(400).send(jobs);
  });
};

exports.loginUser = (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  User.authUser(username, password, result => {
    res.status(200).send(result);
  });
};

exports.authUserAndOrderPart = (req, res, next) => {
  const { userName, jobName, partId, qty } = req.body;
  JobsPart.authUserAndOrderPart(userName, jobName, partId, qty, res);
};

exports.insertSearch = (req, res, next) => {
  const { search } = req.body;
  JobsPart.insertSearch(search, result => {
    res.status(200).send(result);
  });
};
