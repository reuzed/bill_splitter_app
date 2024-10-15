import { useState, useEffect } from "react";

import { getJson, postJson } from "./API_utils";

import {
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  TextField,
  InputAdornment,
  List,
  ListItem,
  Button,
  Alert,
  Typography,
} from "@mui/material";

import Grid from "@mui/material/Grid2";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import "dayjs/locale/en-gb";

const errorCodes = {
  0: <></>,
  1: <Alert severity="error">Choose a Payer</Alert>,
  2: <Alert severity="error">Enter an amount</Alert>,
  3: <Alert severity="error">Enter some shares</Alert>,
  4: <Alert severity="success">Successfully Submitted</Alert>,
};
function validateForm(formData) {
  if (formData["payer_id"] === undefined || formData["payer_id"] === "") {
    return { code: 1, success: false };
  }
  if (formData["amount"] === undefined || formData["amount"] === "") {
    return { code: 2, success: false };
  }
  console.log(`Validating form, shares: ${JSON.stringify(formData["shares"])}`);
  if (
    formData["shares"] === undefined ||
    Object.keys(formData["shares"]).length === 0
  ) {
    return { code: 3, success: false };
  }
  return { code: 4, success: true };
}

function transformForm(formData) {
  formData["amount"] = Number(formData["amount"]);
  formData["payer_id"] = Number(formData["payer_id"]);
  let shares = formData["shares"];
  let shareEntries = Object.entries(shares);
  shareEntries = shareEntries.map((pair) => [pair[0], Number(pair[1])]);
  shares = Object.fromEntries(shareEntries);
  formData["shares"] = shares;
  return formData;
}

function handleResults(
  formData,
  refreshFormData,
  setValidationCode,
  splitter_name
) {
  const { code, success } = validateForm(formData);
  setValidationCode(code);
  console.log(`Transaction data is ${JSON.stringify(formData)}`);
  if (success) {
    refreshFormData();
    formData = transformForm(formData);
    postJson("transactions/" + splitter_name, formData);
  }
}

function isNumber(text) {
  const num = +text;
  return !isNaN(num) && num >= 0;
}

function SplitsForm({ users, formData, addFormProperty }) {
  function setShare(id, amount) {
    addFormProperty("shares", { ...formData["shares"], [id]: amount });
  }
  function emptyIfUndef(value) {
    console.log(value);
    if (value === undefined) {
      return "";
    }
    return value;
  }
  const items = users.map((user) => (
    <ListItem>
      <Typography sx={{ width: "7em", textAlign: "right", p: 1 }}>
        {user.name}:
      </Typography>
      <TextField
        fullWidth
        label="Share"
        value={emptyIfUndef(formData["shares"][user.user_id])}
        onChange={(event) => {
          const text = event.target.value;
          if (isNumber(text)) {
            setShare(user.user_id, text);
          }
        }}
      />
    </ListItem>
  ));

  return <List>{items}</List>;
}
function PayerSelect({ users, formData, addFormProperty }) {
  return (
    <FormControl fullWidth>
      <InputLabel>Payer</InputLabel>
      <Select
        value={formData["payer_id"]}
        onChange={(event) => {
          const selected = event.target.value;
          addFormProperty("payer_id", selected);
        }}
      >
        {users.map((user) => {
          return <MenuItem value={user.user_id}>{user.name}</MenuItem>;
        })}
      </Select>
    </FormControl>
  );
}

function InitialDetails({ users, formData, addFormProperty }) {
  return (
    <List>
      <ListItem>
        <PayerSelect
          users={users}
          formData={formData}
          addFormProperty={addFormProperty}
        />
      </ListItem>
      <ListItem>
        <TextField
          label="Amount"
          fullWidth
          value={formData["amount"]}
          onChange={(e) => {
            let text = e.target.value;
            if (isNumber(text)) {
              addFormProperty("amount", text);
            }
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">£</InputAdornment>
              ),
            },
          }}
        />
      </ListItem>
    </List>
  );
}

function BonusDetails({ formData, addFormProperty }) {
  return (
    <List>
      <ListItem>
        <TextField
          fullWidth
          label="Title"
          value={formData["title"]}
          onChange={(event) => addFormProperty("title", event.target.value)}
        />
      </ListItem>
      <ListItem>
        <TextField
          fullWidth
          label="Descripiton"
          value={formData["description"]}
          onChange={(event) =>
            addFormProperty("description", event.target.value)
          }
        />
      </ListItem>
    </List>
  );
}

function LastDetails({ formData, addFormProperty }) {
  return (
    <List>
      <ListItem>
        <FormControl fullWidth>
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale="en-gb"
          >
            <DatePicker
              label="Enter the date"
              value={formData["date"]}
              onChange={(newValue) => addFormProperty("date", newValue)}
            />
          </LocalizationProvider>
        </FormControl>
      </ListItem>
      <ListItem>See below!</ListItem>
    </List>
  );
}

function NewTransactionPage({ splitter_name, isMobile }) {
  const [users, setUsers] = useState([]);
  useEffect(() => getJson("users/" + splitter_name, setUsers), [splitter_name]);

  const [validationCode, setValidationCode] = useState(0);

  const defaultFormData = {
    payer_id: "",
    amount: "",
    title: "",
    description: "",
    shares: {},
  };

  const [formData, setFormData] = useState(defaultFormData);
  function refreshFormData() {
    setFormData(defaultFormData);
  }
  function addFormProperty(key, value) {
    setFormData({ ...formData, [key]: value });
  }

  return (
    <>
      <h1>Add a New Transaction:</h1>
      <Grid container>
        <Grid size={isMobile ? 12 : 4}>
          <InitialDetails
            users={users}
            formData={formData}
            addFormProperty={addFormProperty}
          />
        </Grid>
        <Grid size={isMobile ? 12 : 4}>
          <BonusDetails formData={formData} addFormProperty={addFormProperty} />
        </Grid>
        <Grid size={isMobile ? 12 : 4}>
          <LastDetails formData={formData} addFormProperty={addFormProperty} />
        </Grid>
        <Grid size={isMobile ? 12 : 8}>
          <SplitsForm
            users={users}
            formData={formData}
            addFormProperty={addFormProperty}
          />
        </Grid>
        <Grid size={isMobile ? 12 : 4}>
          <Button
            onClick={() =>
              handleResults(
                formData,
                refreshFormData,
                setValidationCode,
                splitter_name
              )
            }
            variant="contained"
          >
            Submit New Transaction
          </Button>
        </Grid>
        {errorCodes[validationCode]}
      </Grid>
    </>
  );
}

export default NewTransactionPage;
