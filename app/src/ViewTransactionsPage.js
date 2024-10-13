import { useState, useEffect } from "react";
import {
  Table,
  TableRow,
  TableCell,
  Collapse,
  IconButton,
  Button,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

import { getJson, deleteRequest } from "./API_utils";

const Pounds = Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

function deleteTransaction(transaction_id, splitter_name) {
  deleteRequest("/transactions/" + splitter_name + "/" + transaction_id);
}

function ConfirmationBox() {
  return "A pop up that makes sure you want to delete.";
}

function MiniTable({ shares, users }) {
  function nameFromId(id) {
    for (let i = 0; i < users.length; i++) {
      if (users[i].user_id == id) {
        return users[i].name;
      }
    }
    return "Unknown";
  }
  return (
    <Table size="small">
      {Object.entries(shares).map((share) => {
        let [user_id, amount] = share;
        return (
          <TableRow>
            <TableCell padding="none">{nameFromId(user_id)}</TableCell>
            <TableCell padding="none">{Pounds.format(amount)}</TableCell>
          </TableRow>
        );
      })}
    </Table>
  );
}

function TransactionRow({ users, transaction, setRerender }) {
  const [open, setOpen] = useState(false);
  return (
    <TableRow>
      <TableCell>{transaction.payer}</TableCell>
      <TableCell>{transaction.title}</TableCell>
      <TableCell>{Pounds.format(transaction.amount)}</TableCell>
      <TableCell>{transaction.date}</TableCell>
      <TableCell>
        <IconButton onClick={() => setOpen(!open)}>
          {open ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
        </IconButton>
        <Collapse in={open}>
          <MiniTable users={users} shares={transaction.shares} />
        </Collapse>
      </TableCell>
      <TableCell>
        <Button
          onClick={() => {
            console.log(transaction);
            console.log(
              "trying to delete a transaction with id " +
                transaction.transaction_id
            );
            deleteTransaction(transaction.transaction_id, "debug");
            setRerender((x) => x + 1);
          }}
        >
          Delete
        </Button>
      </TableCell>
    </TableRow>
  );
}
function ViewTransactionsPage({ splitter_name }) {
  const [rerender, setRerender] = useState(0);

  const [users, setUsers] = useState({});
  useEffect(() => {
    getJson("users/" + splitter_name, setUsers);
  }, []);

  const [transactions, setTransactions] = useState([]);
  useEffect(() => {
    getJson("transactions/" + splitter_name, setTransactions);
  }, [rerender]);
  let transactionRows = transactions.map((transaction) => (
    <TransactionRow
      users={users}
      transaction={transaction}
      setRerender={setRerender}
    />
  ));
  return (
    <>
      <h1>Here are the transactions:</h1>
      <Grid container direction="column" alignItems="center" justify="center">
        <Table>
          <TableRow>
            <TableCell>Payer</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Shares</TableCell>
            <TableCell>Delete</TableCell>
          </TableRow>
          {transactionRows}
        </Table>
      </Grid>
    </>
  );
}

export default ViewTransactionsPage;
