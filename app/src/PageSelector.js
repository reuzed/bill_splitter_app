import { Checkbox, IconButton, Tooltip, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";

import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AddIcon from "@mui/icons-material/Add";
import BalanceIcon from "@mui/icons-material/Balance";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { useEffect, useState } from "react";

import EditIcon from "@mui/icons-material/Edit";
import EditOffIcon from "@mui/icons-material/EditOff";

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
    <Grid container className="pageSelector">
      <Grid size={2}></Grid>
      <Grid size={8}>
        {page_data.map((page) => (
          <Tooltip title={page.label}>
            <IconButton onClick={() => setPage(page.page_name)}>
              {page.icon}
            </IconButton>
          </Tooltip>
        ))}
      </Grid>
      <Grid size={2}>
        <Grid container direction="vertical" justifyContent={"left"}>
          <Grid item>
            <Typography variant="body2">Splitter Name:</Typography>
          </Grid>
          <Grid item>
            <IconButton color="black" onClick={() => setEditable(!editable)}>
              {editable ? <EditOffIcon /> : <EditIcon />}
            </IconButton>
            <input
              className={
                editable
                  ? "transparentInput blackText"
                  : "transparentInput redText"
              }
              disabled={editable}
              type="text"
              value={tempName}
              onChange={(event) => setTempName(event.target.value)}
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default PageSelector;
