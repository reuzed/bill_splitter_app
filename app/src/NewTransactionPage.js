import { useState, useEffect } from "react";
import SimpleForm from "./SimpleForm";

import { postJson } from "./API_utils";

const API_path = "transactions";

let questions = [
  { name: "Payer New Title", property: "payer" },
  { name: "Amount", property: "amount" },
  { name: "Date", property: "date" },
  { name: "Bonus Question", property: "extra" },
];

function handleResults(results) {
  let payer_data = {
    payer: results["payer"],
    amount: results["amount"],
    date: results["date"],
  };
  postJson(API_path, payer_data);
}

function NewTransactionPage() {
  const [results, setResults] = useState("");
  useEffect(() => {
    if (results) {
      handleResults(results);
    }
  }, [results]);
  return (
    <>
      <h1>On the new transaction form.</h1>
      <SimpleForm questions={questions} setResults={setResults} />
    </>
  );
}

export default NewTransactionPage;
