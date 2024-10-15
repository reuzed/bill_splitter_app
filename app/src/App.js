import "./App.css";

import { useState, useEffect } from "react";

import ViewTransactionsPage from "./ViewTransactionsPage";
import NewUserPage from "./NewUserPage";
import NewTransactionPage from "./NewTransactionPage";
import ViewBalancesPage from "./ViewBalancesPage";

import PageSelector from "./PageSelector";
import { Box } from "@mui/material";

let pages = {
  view_balances: (splitter_name, isMobile) => (
    <ViewBalancesPage splitter_name={splitter_name} isMobile={isMobile} />
  ),
  view_transactions: (splitter_name, isMobile) => (
    <ViewTransactionsPage splitter_name={splitter_name} isMobile={isMobile} />
  ),
  new_user: (splitter_name, isMobile) => (
    <NewUserPage splitter_name={splitter_name} isMobile={isMobile} />
  ),
  new_transaction: (splitter_name, isMobile) => (
    <NewTransactionPage splitter_name={splitter_name} isMobile={isMobile} />
  ),
};

function App() {
  const [page, setPage] = useState("view_transactions");
  const [splitter_name, setSplitter_name] = useState("wasen");

  const [width, setWidth] = useState(window.innerWidth);

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }
  useEffect(() => {
    window.addEventListener("resize", handleWindowSizeChange);
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);
  const isMobile = width <= 768;
  return (
    <>
      <PageSelector
        setPage={setPage}
        splitter_name={splitter_name}
        setSplitter_name={setSplitter_name}
        isMobile={isMobile}
      />
      <Box className="mainPage">{pages[page](splitter_name, isMobile)}</Box>
    </>
  );
}

export default App;
