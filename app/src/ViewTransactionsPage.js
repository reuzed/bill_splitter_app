import { useState, useEffect } from "react";
import { Table, TableRow, TableCell } from "@mui/material";

function ViewTransactionsPage() {
  const [data, setData] = useState([]);
  useEffect(() => {
    fetch("http://127.0.0.1:5000/transactions")
      .then((response) => response.json())
      .then((json) => setData(json))
      .catch((error) => console.error(error));
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
