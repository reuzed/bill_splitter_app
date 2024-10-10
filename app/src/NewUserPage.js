import { useEffect, useState } from "react";
import SimpleForm from "./SimpleForm";

import { postJson } from "./API_utils";
let API_path = "users";
let questions = [
  { name: "Name", property: "name" },
  { name: "Bank Details", property: "bank_details" },
];

function NewUserPage() {
  const [results, setResults] = useState("");
  useEffect(() => {
    if (results) {
      postJson(API_path, results);
    }
  }, [results]);
  return (
    <>
      <h1>Add a New User:</h1>
      <SimpleForm questions={questions} setResults={setResults} />
    </>
  );
}

export default NewUserPage;
