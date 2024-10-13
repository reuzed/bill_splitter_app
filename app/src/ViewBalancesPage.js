import { useState, useEffect } from "react";
import { getJson } from "./API_utils";
import {
  Table,
  TableCell,
  TableRow,
  TableHead,
  List,
  ListItem,
} from "@mui/material";
import BalancesGraph from "./BalancesGraph";

import Grid from "@mui/material/Grid2";

function ViewBalancesPage({ splitter_name }) {
  const [users, setUsers] = useState([]);
  useEffect(() => getJson("users/" + splitter_name, setUsers), [splitter_name]);
  const [balances, setBalances] = useState({});
  useEffect(() => {
    getJson("balances/" + splitter_name, setBalances);
  }, [splitter_name]);
  const [repayments, setRepayments] = useState([]);
  useEffect(() => {
    getJson("repayments/" + splitter_name, setRepayments);
  }, [splitter_name]);

  let Pounds = Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  });

  let balance_rows = users.map((user) => {
    return (
      <TableRow>
        <TableCell>{user.name}</TableCell>
        <TableCell>{Pounds.format(balances[user.user_id])}</TableCell>
      </TableRow>
    );
  });

  let repayment_items = repayments.map((repayment) => (
    <ListItem>
      {repayment.payer} needs to pay {repayment.receiver} the value of{" "}
      {Pounds.format(repayment.amount)}
    </ListItem>
  ));

  return (
    <>
      <h1>View Balances Below:</h1>
      <Grid container spacing={2}>
        <Grid size={6} alignItems="center" justify="center">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Balance</TableCell>
              </TableRow>
            </TableHead>
            {balance_rows}
          </Table>
        </Grid>
        <Grid size={6} alignItems="center" justify="center">
          <BalancesGraph users={users} balances={balances} />
        </Grid>
      </Grid>
      <h1>Repayments:</h1>
      <List>{repayment_items}</List>
    </>
  );
}

export default ViewBalancesPage;
