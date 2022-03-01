/* eslint-disable no-undef */
import pg from "pg";
// import express from "express";
// const app = express();
// const port = 80;
// app.listen(port);

const { Client } = pg;
const now = new Date();
const checkWeek = new Date() - 7;

// set the way we will connect to the server
const pgConnectionConfigs = {
  user: "aqifsariman",
  host: "localhost",
  database: "meal_tracker",
  port: 5432, // Postgres server always runs on this port
};

// create the var we'll use
const client = new Client(pgConnectionConfigs);

// make the connection to the server
client.connect();

// create the query done callback
const whenQueryDone = (error, result) => {
  // var used to calculate the percentage of drinks so far
  let totalMeals = 0;
  let frequencyOfAlcohol = 0;
  // this error is anything that goes wrong with the query
  if (error) {
    console.log("error", error);
  } else {
    // rows key has the data
    let value = process.argv[3];

    if (value === "drink") {
      let totalDrinks = 0;
      totalMeals = result.rows.length;

      for (let j = 0; j < totalMeals; j++) {
        totalDrinks += Number(result.rows[j].amount_of__alcohol);
      }
      frequencyOfAlcohol = (totalDrinks / totalMeals).toFixed(2);
      console.log(`Average number of drinks per meal: ${frequencyOfAlcohol}`);
    }

    for (let i = 0; i < result.rows.length; i++) {
      let hasValue = false;
      let hasBoolValue = false;
      let checkHunger = false;
      let checkInput = false;

      if (value === "hungry") {
        checkHunger = true;

        // @params hasBoolValue checks if user input is hungry/not-hungry
        hasBoolValue = Object.values(result.rows[i]).includes(checkHunger);
      }
      if (value === "not-hungry") {
        checkHunger = false;
        // @params hasBoolValue checks if user input is hungry/not-hungry
        hasBoolValue = Object.values(result.rows[i]).includes(checkHunger);
      }

      if (value !== "hungry" && value !== "not-hungry") {
        checkInput = value;
        // @params hasValue checks if user input type/description is included in the meal tracker
        hasValue = Object.values(result.rows[i]).includes(`${checkInput}`);
      }

      /*
      @category if statements
      @returns whether user's alcohol unit, hungry or not in a string and not just number and boolean
      */

      if (
        value === undefined ||
        hasValue === true ||
        hasBoolValue === true ||
        value === "past-week"
      ) {
        const sevenDaysAgo = new Date(
          new Date().setDate(new Date().getDate() - 8)
        );
        if (result.rows[i].amount_of__alcohol == 0) {
          result.rows[i].amount_of__alcohol = "No alcohol";
        }
        if (result.rows[i].amount_of__alcohol > 0) {
          result.rows[
            i
          ].amount_of__alcohol = `${result.rows[i].amount_of__alcohol} unit of alcohol`;
        }
        if (result.rows[i].amount_of__alcohol > 1) {
          result.rows[
            i
          ].amount_of__alcohol = `${result.rows[i].amount_of__alcohol} units of alcohol`;
        }
        if (result.rows[i].was_hungry__before_eating === true) {
          result.rows[i].was_hungry__before_eating = "Feeling hungry";
        }
        if (result.rows[i].was_hungry__before_eating === false) {
          result.rows[i].was_hungry__before_eating = "Not hungry";
        }
        if (value === "past-week") {
          if (
            result.rows[i].created_at === null ||
            sevenDaysAgo - result.rows[i].created_at > 0
          ) {
            continue;
          }
        }
        console.log(
          `${result.rows[i].id} - ${result.rows[i].description} -  ${result.rows[i].amount_of__alcohol} - ${result.rows[i].was_hungry__before_eating}`
        );
      }
    }
  }
  // close the connection
  client.end();
};

if (process.argv[2] === "log") {
  const inputData = [
    process.argv[3],
    process.argv[4],
    Number(process.argv[5]),
    process.argv[6],
    now,
  ];
  const sqlQuery =
    "INSERT INTO meal_tracker (type, description, amount_of__alcohol, was_hungry__before_eating, created_at) VALUES ($1, $2, $3, $4, $5)";
  client.query(sqlQuery, inputData, whenQueryDone);
} else if (process.argv[2] === "report") {
  const sqlQuery = "SELECT * FROM meal_tracker";
  client.query(sqlQuery, whenQueryDone);
} else if (process.argv[2] === "edit") {
  const sqlQuery = `UPDATE meal_tracker SET ${process.argv[4]} = '${process.argv[5]}' WHERE id=${process.argv[3]}`;
  client.query(sqlQuery, whenQueryDone);
}
