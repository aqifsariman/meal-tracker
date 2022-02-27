/* eslint-disable no-undef */
import pg from 'pg';

const { Client } = pg;
const now = new Date();

// set the way we will connect to the server
const pgConnectionConfigs = {
  user: 'aqifsariman',
  host: 'localhost',
  database: 'meal_tracker',
  port: 5432, // Postgres server always runs on this port
};

// create the var we'll use
const client = new Client(pgConnectionConfigs);

// make the connection to the server
client.connect();

// create the query done callback
const whenQueryDone = (error, result) => {
  let totalDrinks=0;
  // this error is anything that goes wrong with the query
  if (error) {
    console.log('error', error);
  } else {
    // rows key has the data
    for (let i = 0; i < result.rows.length; i++){
      let value = process.argv[3]
      totalDrinks += Number(result.rows[i].amount_of__alcohol);
      if(process.argv[3] === 'drink'){
        let totalMeals = result.rows.length;
        let frequencyOfAlcohol = Math.floor((totalDrinks/totalMeals) * 100)
        console.log(Number(result.rows[i].amount_of__alcohol))
        console.log(totalDrinks)
        console.log(totalMeals)
        console.log(`Percentage of drinks per week: ${frequencyOfAlcohol}%`)
      }
       if(value === 'hungry'){
      value = true;
    }
    else if(value === 'not-hungry'){
      value = false;
    }
    const hasValue = Object.values(result.rows[i]).includes(`${value}`);
    const hasBoolValue = Object.values(result.rows[i]).includes(value);
   
      if(hasValue === true || hasBoolValue === true){
        if(result.rows[i].amount_of__alcohol == 0){
        result.rows[i].amount_of__alcohol = 'No alcohol';
  }
    if(result.rows[i].amount_of__alcohol > 0){
    result.rows[i].amount_of__alcohol = `${result.rows[i].amount_of__alcohol} unit of alcohol`;
  }
  if(result.rows[i].amount_of__alcohol > 1){
    result.rows[i].amount_of__alcohol = `${result.rows[i].amount_of__alcohol} units of alcohol`;
  }
  if(result.rows[i].was_hungry__before_eating === true){
    result.rows[i].was_hungry__before_eating = 'Feeling hungry'
  }
  if(result.rows[i].was_hungry__before_eating === false){
    result.rows[i].was_hungry__before_eating = 'Not hungry'
  }
    console.log(`${result.rows[i].id} - ${result.rows[i].description} -  ${result.rows[i].amount_of__alcohol} - ${result.rows[i].was_hungry__before_eating}`) 
      }  

  }
  }
  // close the connection
  client.end();
};

if(process.argv[2] === 'log'){
const inputData = [process.argv[3], process.argv[4], Number(process.argv[5]), process.argv[6], now];
const sqlQuery = 'INSERT INTO meal_tracker (type, description, amount_of__alcohol, was_hungry__before_eating, created_at) VALUES ($1, $2, $3, $4, $5)';
client.query(sqlQuery, inputData, whenQueryDone);
}
else if(process.argv[2] === 'report'){
const sqlQuery = 'SELECT * FROM meal_tracker'
const inputData = process.argv[3];
client.query(sqlQuery, whenQueryDone);
}
else if(process.argv[2] === 'edit'){
const sqlQuery = `UPDATE meal_tracker SET ${process.argv[4]} = '${process.argv[5]}' WHERE id=${process.argv[3]}`
client.query(sqlQuery, whenQueryDone);
}
