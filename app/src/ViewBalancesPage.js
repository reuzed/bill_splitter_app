import { useState, useEffect } from "react";
import { getJson } from "./API_utils";
import { Table, TableCell, TableRow, TableHead } from "@mui/material";
import BalancesGraph from "./BalancesGraph";

import Grid from "@mui/material/Grid2";

function ViewBalancesPage() {
  const [names, setNames] = useState([]);
  useEffect(() => getJson("users", setNames), []);
  const [balances, setBalances] = useState({});
  useEffect(() => {
    getJson("balances", setBalances);
  }, []);

  let Pounds = Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  });

  let balance_rows = names.map((name) => {
    return (
      <TableRow>
        <TableCell>{name}</TableCell>
        <TableCell>{Pounds.format(balances[name])}</TableCell>
      </TableRow>
    );
  });

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
          <BalancesGraph names={names} balances={balances} />
        </Grid>
      </Grid>
    </>
  );
}

export default ViewBalancesPage;
