import { useState, useEffect } from "react";
import { Table, TableRow, TableCell } from "@mui/material";
import { getJson } from "./API_utils";

function ViewTransactionsPage() {
  const [data, setData] = useState([]);
  useEffect(() => {
    getJson("transactions", setData);
  }, []);
  let listItems = data.map((element) => (
    <TableRow>
      {element.map((e) => (
        <TableCell>{e}</TableCell>
      ))}
    </TableRow>
  ));
  return (
    <>
      <p>Here are the transactions.</p>
      <Table>
        <TableRow>
          <TableCell>Payer</TableCell>
          <TableCell>Amount</TableCell>
          <TableCell>Date</TableCell>
        </TableRow>
        {listItems}
      </Table>
    </>
  );
}

export default ViewTransactionsPage;
