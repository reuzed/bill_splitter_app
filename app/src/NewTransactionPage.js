import { useState, useEffect } from "react";
import SimpleForm from "./SimpleForm";

import { getJson, postJson } from "./API_utils";

const API_path = "transactions";

const initial_questions = [
  { name: "Payer New Title", property: "payer" },
  { name: "Amount", property: "amount" },
  { name: "Date", property: "date" },
];

function handleResults(results, users) {
  let json_data = {
    payer: results["payer"],
    amount: results["amount"],
    date: results["date"],
  };
  console.log(results);
  console.log(users);
  users.forEach((user) => {
    console.log(user);
    json_data[`share_${user}`] = results[`share_${user}`];
  });
  console.log(json_data);
  postJson(API_path, json_data);
}

function NewTransactionPage() {
  const [users, setUsers] = useState([]);
  useEffect(() => getJson("users", setUsers), []);

  const [results, setResults] = useState("");
  useEffect(() => {
    if (results) {
      handleResults(results, users);
    }
  }, [results]);

  let share_questions = users.map((user) => {
    return { name: `${user}'s share`, property: `share_${user}` };
  });
  let questions = initial_questions.concat(share_questions);

  return (
    <>
      <h1>Add a New Transaction:</h1>

      <SimpleForm questions={questions} setResults={setResults} />
    </>
  );
}

export default NewTransactionPage;
