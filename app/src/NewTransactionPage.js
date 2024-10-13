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
} from "@mui/material";

import Grid from "@mui/material/Grid2";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import "dayjs/locale/en-gb";

function handleResults(results, splitter_name) {
  console.log(results);
  postJson("transactions/" + splitter_name, results);
}

function NumberField({ label, property, addFormProperty, inputAdornment }) {
  return (
    <TextField
      fullWidth
      label={label}
      onChange={(event) => {
        let value = event.target.value;
        value = +value;
        if (!isNaN(value)) {
          addFormProperty(property, value);
        }
      }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">{inputAdornment}</InputAdornment>
          ),
        },
      }}
    />
  );
}

function SplitsForm({ users, addFormProperty }) {
  const [sharesData, setSharesData] = useState({});
  useEffect(() => addFormProperty("shares", sharesData), [sharesData]);
  function setShare(name, amount) {
    setSharesData({ ...sharesData, [name]: amount });
  }
  const items = users.map((user) => (
    <ListItem>
      {user.name}'s share:
      <NumberField
        label={user.name}
        property={user.user_id}
        addFormProperty={setShare}
      />
    </ListItem>
  ));

  return <List>{items}</List>;
}
function PayerSelect({ users, addFormProperty }) {
  const [payer, setPayer] = useState("");
  return (
    <FormControl fullWidth>
      <InputLabel>Payer</InputLabel>
      <Select
        value={payer}
        onChange={(event) => {
          const selected = event.target.value;
          addFormProperty("payer_id", selected);
          setPayer(selected);
        }}
      >
        {users.map((user) => {
          console.log(user);
          return <MenuItem value={user.user_id}>{user.name}</MenuItem>;
        })}
      </Select>
    </FormControl>
  );
}

function InitialDetails({ users, addFormProperty }) {
  return (
    <List>
      <ListItem>
        <PayerSelect users={users} addFormProperty={addFormProperty} />
      </ListItem>
      <ListItem>
        <NumberField
          label="Amount"
          property="amount"
          addFormProperty={addFormProperty}
          inputAdornment="£"
        />
      </ListItem>
    </List>
  );
}

function BonusDetails({ addFormProperty }) {
  return (
    <List>
      <ListItem>
        <TextField
          fullWidth
          label="Title"
          onChange={(event) => addFormProperty("title", event.target.value)}
        />
      </ListItem>
      <ListItem>
        <TextField
          fullWidth
          label="Descripiton"
          onChange={(event) =>
            addFormProperty("description", event.target.value)
          }
        />
      </ListItem>
    </List>
  );
}

function LastDetails({ addFormProperty }) {
  return (
    <List>
      <ListItem>
        <FormControl fullWidth>
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale="en-gb"
          >
            <DatePicker label="Enter the date" />
          </LocalizationProvider>
        </FormControl>
      </ListItem>
      <ListItem>See below!</ListItem>
    </List>
  );
}

function NewTransactionPage({ splitter_name }) {
  const [users, setUsers] = useState([]);
  useEffect(() => getJson("users/" + splitter_name, setUsers), [splitter_name]);

  const [formData, setFormData] = useState({});
  function addFormProperty(key, value) {
    setFormData({ ...formData, [key]: value });
  }

  return (
    <>
      <h1>Add a New Transaction:</h1>
      <Grid container>
        <Grid size={4}>
          <InitialDetails users={users} addFormProperty={addFormProperty} />
        </Grid>
        <Grid size={4}>
          <BonusDetails addFormProperty={addFormProperty} />
        </Grid>
        <Grid size={4}>
          <LastDetails addFormProperty={addFormProperty} />
        </Grid>
        <Grid size={8}>
          <SplitsForm users={users} addFormProperty={addFormProperty} />
        </Grid>
        <Grid size={4}>
          <Button
            onClick={() => handleResults(formData, splitter_name)}
            variant="contained"
          >
            Submit New Transaction
          </Button>
        </Grid>
      </Grid>
    </>
  );
}

export default NewTransactionPage;
