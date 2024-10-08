import "./App.css";

import { useState, useEffect } from "react";
import SimpleForm from "./SimpleForm";

function App() {
  const [data, setData] = useState("");
  useEffect(() => {
    fetch("http://127.0.0.1:5000/transactions/1")
      .then((response) => response.json())
      .then((json) => setData(json))
      .catch((error) => console.error(error));
  }, []);
  return (
    <>
      <div className="App">Here is the json: {JSON.stringify(data)}</div>
      <SimpleForm></SimpleForm>
    </>
  );
}

export default App;
