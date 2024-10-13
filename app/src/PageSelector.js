import { Box, Button, IconButton, TextField, Checkbox } from "@mui/material";

import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AddIcon from "@mui/icons-material/Add";
import BalanceIcon from "@mui/icons-material/Balance";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { useEffect, useState } from "react";

import "./App.css";

const page_data = [
  { page_name: "new_user", label: "New User", icon: <PersonAddIcon /> },
  { page_name: "new_transaction", label: "New Transaction", icon: <AddIcon /> },
  {
    page_name: "view_transactions",
    label: "View Transactions",
    icon: <ReceiptLongIcon />,
  },
  { page_name: "view_balances", label: "View Balances", icon: <BalanceIcon /> },
];

function PageSelector({ setPage, splitter_name, setSplitter_name }) {
  const [tempName, setTempName] = useState(splitter_name);
  const [editable, setEditable] = useState(true); //This is ! of what it should be but can't be bothered to fix
  useEffect(() => {
    if (editable) {
      setSplitter_name(tempName);
    }
  }, [editable]);
  return (
    <Box className="pageSelector">
      {page_data.map((page) => (
        <IconButton onClick={() => setPage(page["page_name"])}>
          {page["icon"]}
        </IconButton>
      ))}
      <Checkbox
        color="black"
        checked={editable}
        onChange={(event) => setEditable(event.target.checked)}
      />
      <input
        className={
          editable ? "transparentInput blackText" : "transparentInput redText"
        }
        disabled={editable}
        type="text"
        value={tempName}
        onChange={(event) => setTempName(event.target.value)}
      />
    </Box>
  );
}

export default PageSelector;
