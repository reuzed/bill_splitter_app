import { useState, useEffect } from "react";
import {
  Table,
  TableRow,
  TableCell,
  Collapse,
  IconButton,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

import { getJson } from "./API_utils";

const Pounds = Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

function MiniTable({ shares }) {
  return (
    <Table size="small">
      {Object.entries(shares).map((pair) => {
        let [person, amount] = pair;
        return (
          <TableRow>
            <TableCell padding="none">{person}</TableCell>
            <TableCell padding="none">{Pounds.format(amount)}</TableCell>
          </TableRow>
        );
      })}
    </Table>
  );
}

function TransactionRow({ transaction }) {
  const [open, setOpen] = useState(false);
  return (
    <TableRow>
      <TableCell>{transaction.payer}</TableCell>
      <TableCell>{Pounds.format(transaction.amount)}</TableCell>
      <TableCell>{transaction.date}</TableCell>
      <TableCell>
        <IconButton onClick={() => setOpen(!open)}>
          {open ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
        </IconButton>
        <Collapse in={open}>
          <MiniTable shares={transaction.shares} />
        </Collapse>
      </TableCell>
    </TableRow>
  );
}
function ViewTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  useEffect(() => {
    getJson("transactions", setTransactions);
  }, []);
  let transactionRows = transactions.map((transaction) => (
    <TransactionRow transaction={transaction} />
  ));
  return (
    <>
      <h1>Here are the transactions:</h1>
      <Grid container direction="column" alignItems="center" justify="center">
        <Table>
          <TableRow>
            <TableCell>Payer</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Shares</TableCell>
          </TableRow>
          {transactionRows}
        </Table>
      </Grid>
    </>
  );
}

export default ViewTransactionsPage;
