import "./App.css";

import { useState, useEffect } from "react";

import ViewTransactionsPage from "./ViewTransactionsPage";
import NewUserPage from "./NewUserPage";
import NewTransactionPage from "./NewTransactionPage";
import ViewBalancesPage from "./ViewBalancesPage";

import PageSelector from "./PageSelector";

let pages = {
  view_balances: <ViewBalancesPage />,
  view_transactions: <ViewTransactionsPage />,
  new_user: <NewUserPage />,
  new_transaction: <NewTransactionPage />,
};

function App() {
  const [page, setPage] = useState("view_transactions");

  return (
    <>
      <PageSelector setPage={setPage} />
      {pages[page]}
    </>
  );
}

export default App;