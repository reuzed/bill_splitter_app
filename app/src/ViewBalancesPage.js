import { useState, useEffect } from "react";
import { getJson } from "./API_utils";

function ViewBalancesPage() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    getJson("users", setUsers);
  }, []);
  return (
    <>
      <h1>View Balances Below</h1>
      <ul>
        {users.map((x) => {
          return <li>{x}</li>;
        })}
      </ul>
    </>
  );
}

export default ViewBalancesPage;
