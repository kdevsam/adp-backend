/**
 * This file is the submission for the simple backend ADP project.
 * (c) 2022
 * ----------------------------------------------------------
 * @author Samer Kozrosh <kdevsam@gmail.com>
 *
 * (Note to reviewer): There are some inconsistencies in how the code was typed on purpose
 * to showcase that I can follow any convention the company would like me to adhere to:
 * ex) using async/await, nested ifs vs (&& ||), for loops vs while loops ...etc
 */

import fetch from "node-fetch";

/**
 * Start of the Program
 * @params ()
 * function retreives(GET) employee transactions and sends back(POST)
 * the highest earned employee transactions of the prior year with the type alpha
 */

async function main() {
  // (GET)
  let data = await getData();
  //console.log(data);

  // takes the data and returns an array with [maxAmount, maxEmployeeID]
  // Note: could have stored maxEmployeeID alone but having the total value could have been useful
  let maxEmployee = processHighestEarner(data.transactions);
  //console.log(maxEmployee);

  // takes the maxEmployee and transactions and to find the transactions for the previous year of type alpha
  let alphaTransactions = getAlphaTxns(data.id, data.transactions, maxEmployee);
  //console.log(alphaTransactions);

  // (POST)
  postSubmissionData(alphaTransactions);
}

/**
 *
 * @returns {"id:": "81728ed3-25ff-473c-9491-4a2026dadd8c","transactions": ["TX_002",employee:{}...]}
 */
async function getData() {
  return await fetch("https://interview.adpeai.com/api/v2/get-task")
    .then((res) => res.json())
    .then((json) => {
      return json;
    });
}

/**
 *
 * @param {[Object]} txns
 * @returns [int: maxAmount, int: maxEmployeeID]
 * Function filters object with timeStamp by one year less than current
 * and tallys up the transactions of all employees to find the highest earner
 */
function processHighestEarner(txns) {
  // Get last year as an integer
  let targetYear = new Date().getFullYear() - 1;
  // Employee set that will contain the id and total sum spent by employees
  let employees = new Map();

  //Loop through all txns
  for (let i = 0; i < txns.length; i++) {
    // Get the timeStamp attribute and convert it to an integer year
    let year = new Date(txns[i].timeStamp).getFullYear();
    // Filter Only target year(2021)
    if (year === targetYear) {
      let employee = txns[i].employee;
      let amount = txns[i].amount;

      if (!employees.has(employee.id)) {
        employees.set(employee.id, amount);
      } else {
        let prevAmount = employees.get(employee.id);
        employees.set(employee.id, prevAmount + amount);
      }
    }
  }
  // call helper function
  // returns [maxAmount, maxEmployeeID]
  let maxEmployee = findMax(employees);
  return maxEmployee;
}

/**
 *
 * @param {*} employees
 * @returns [int: maxAmount, int: maxEmployeeID]
 * Helper function for processHighestEarner that takes in a
 * map of employees consisting of their id and the total amount
 * of transactions they made and returns the highest amount [amount, employeeid]
 */
function findMax(employees) {
  let maxAmount = Number.MIN_VALUE;
  let maxEmployeeID;
  employees.forEach((value, key) => {
    if (value > maxAmount) {
      maxAmount = value;
      maxEmployeeID = key;
    }
  });
  return [maxAmount, maxEmployeeID];
}

/**
 *
 * @param {string} id
 * @param {[Object]} txns
 * @param {[maxAmount, maxEmployeeID]} maxEmployee
 * @returns {"id:": "81728ed3-25ff-473c-9491-4a2026dadd8c","result": ["TX_002", "TX_003" ...]}
 * Function takes the highest earned employee and returns an id and their transactions
 * for the previous year that are of type alpha
 */
function getAlphaTxns(id, txns, maxEmployee) {
  let alphas = {
    id,
    result: [],
  };

  let targetEmployeeID = maxEmployee[1];
  // Get last year as an integer
  let targetYear = new Date().getFullYear() - 1;
  //Loop through all txns
  for (let i = 0; i < txns.length; i++) {
    // Get the timeStamp attribute and convert it to an integer year
    let year = new Date(txns[i].timeStamp).getFullYear();

    if (year === targetYear) {
      let employee = txns[i].employee;
      let type = txns[i].type;

      if (employee.id === targetEmployeeID && type === "alpha") {
        let txID = txns[i].transactionID;
        alphas.result.push(txID);
      }
    }
  }
  return alphas;
}

/**
 *
 * @param {"id:": "81728ed3-25ff-473c-9491-4a2026dadd8c","result": ["TX_002", "TX_003" ...]} alphas
 *
 */
function postSubmissionData(alphas) {
  fetch("https://interview.adpeai.com/api/v2/submit-task", {
    method: "POST",
    body: JSON.stringify(alphas),
    headers: { "Content-Type": "application/json" },
  }).then((res) => console.log("STATUS: " + res.status + " " + res.statusText));
}

main();
