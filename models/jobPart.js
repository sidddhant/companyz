const db = require("../util/database");
const date = require("date-and-time");
const axios = require("axios").default;
const JOBS_URL = "http://ec2-75-101-236-93.compute-1.amazonaws.com:1337/jobs";
const PARTS_URL =
  "https://nr6oia68mk.execute-api.us-east-1.amazonaws.com/Dev/getallparts";
const PARTS_URL_UPDATE =
  "https://nr6oia68mk.execute-api.us-east-1.amazonaws.com/Dev/updatepart";

module.exports = class JobsPart {
  constructor(jobName, partId, quantity) {
    this.jobName = jobName;
    this.partId = partId;
    this.quantity = quantity;
  }

  static authUserAndOrderPart(username, jobName, partId, qty, res) {
    const ddateTime = new Date().toLocaleString().split(",");
    const now = new Date();
    const dd = date.format(now, "YYYY/MM/DD");
    const tt = date.format(now, "hh:mm A ");
    return db
      .execute(
        "select partId, jobName, userId, qty from PartOrders where userId=? and jobName=? and partId=?",
        [username, jobName, partId]
      )
      .then(([rows, fieldData]) => {
        if (rows.length > 0) {
          db.execute(
            "INSERT INTO JobParts (partId, jobName, userId, qty, date, time, result) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [partId, jobName, username, qty, dd, tt, "Failed"]
          );

          return res
            .status(200)
            .json({
              Status: "Failed",
              Reason: "User has already ordered for this partId",
              jobName: jobName,
              partId: partId,
              qty: qty,
              userId: username,
              date: dd,
              time: tt
            });
        } else {
          getPartData(partId)
            .then(response => {
              console.log("response:" + response);
              const filterPart = response.data.filter(part => {
                return parseInt(part.partId) === parseInt(partId);
              });
              if (filterPart.length == 0) {
                db.execute(
                  "INSERT INTO JobParts (partId, jobName, userId, qty, date, time, result) VALUES (?, ?, ?, ?, ?, ?, ?)",
                  [partId, jobName, username, qty, dd, tt, "Failed"]
                );
                return res
                  .status(200)
                  .json({
                    Status: "Failed",
                    Reason: `No entry for PartId:${partId} in Company Y`,
                    jobName: jobName,
                    partId: partId,
                    qty: qty,
                    userId: username,
                    date: dd,
                    time: tt
                  });
              } else if (
                filterPart.length > 0 &&
                parseInt(filterPart[0].qty) >= parseInt(qty)
              ) {
                updatePartQtyInCompanyY(partId, qty)
                  .then(function(response) {
                    db.execute(
                      "INSERT INTO JobParts (partId, jobName, userId, qty, date, time, result) VALUES (?, ?, ?, ?, ?, ?, ?)",
                      [partId, jobName, username, qty, dd, tt, "Success"]
                    );
                    db.execute(
                      "INSERT INTO PartOrders (partId, jobName, userId, qty) VALUES (?, ?, ?, ?)",
                      [partId, jobName, username, qty]
                    );
                  })
                  .then(result => {
                    res
                      .status(200)
                      .json({
                        Status: "Success",
                        Reason: "Order successfully placed",
                        jobName: jobName,
                        partId: partId,
                        qty: qty,
                        userId: username,
                        date: dd,
                        time: tt
                      });
                  });
              } else {
                db.execute(
                  "INSERT INTO JobParts (partId, jobName, userId, qty, date, time, result) VALUES (?, ?, ?, ?, ?, ?, ?)",
                  [partId, jobName, username, qty, dd, tt, "Failed"]
                );
                return res
                  .status(200)
                  .json({
                    Status: "Failed",
                    Reason:
                      "Ordered Quantity is greater than available quantity",
                    jobName: jobName,
                    partId: partId,
                    qty: qty,
                    userId: username,
                    date: dd,
                    time: tt
                  });
              }
            })
            .catch(function(error) {
              console.log(error);
            });
        }
      });
  }

  static insertSearch(search, cb) {
    const ddateTime = new Date().toLocaleString().split(",");
    const now = new Date();
    const dd = date.format(now, "YYYY/MM/DD");
    const tt = date.format(now, "hh:mm A ");
    db.execute(
      "INSERT INTO `searchHistory` (`jobName`, `date`, `time`) VALUES (?, ?, ?)",
      [search, dd, tt]
    ).then(() => cb("Data inserted in search table"));
  }

  static getJobsData(jobName, cb) {
    axios
      .get(JOBS_URL)
      .then(response => {
        const filterJob = response.data.filter(job => {
          return job.jobName.toString() === jobName.toString();
        });
        return cb(filterJob);
      })
      .catch(function(error) {
        // handle error
        console.log(error);
      });
  }
};

getPartData = partId => {
  return axios.get(PARTS_URL);
};

updatePartQtyInCompanyY = (partId, qty) => {
  return axios.put(PARTS_URL_UPDATE, {
    partId: partId,
    qty: qty
  });
};
