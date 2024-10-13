import "./App.css";

import { useState, useEffect } from "react";

import ViewTransactionsPage from "./ViewTransactionsPage";
import NewUserPage from "./NewUserPage";
import NewTransactionPage from "./NewTransactionPage";
import ViewBalancesPage from "./ViewBalancesPage";

import PageSelector from "./PageSelector";
import { Box } from "@mui/material";

let pages = {
  view_balances: (splitter_name) => (
    <ViewBalancesPage splitter_name={splitter_name} />
  ),
  view_transactions: (splitter_name) => (
    <ViewTransactionsPage splitter_name={splitter_name} />
  ),
  new_user: (splitter_name) => <NewUserPage splitter_name={splitter_name} />,
  new_transaction: (splitter_name) => (
    <NewTransactionPage splitter_name={splitter_name} />
  ),
};

function App() {
  const [page, setPage] = useState("view_transactions");
  const [splitter_name, setSplitter_name] = useState("debug");
  return (
    <>
      <PageSelector
        setPage={setPage}
        splitter_name={splitter_name}
        setSplitter_name={setSplitter_name}
      />
      <Box className="mainPage">{pages[page](splitter_name)}</Box>
    </>
  );
}

export default App;
