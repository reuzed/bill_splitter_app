import { useEffect, useState } from "react";
import {
  Checkbox,
  TextField,
  List,
  ListItem,
  Button,
  Typography,
  Alert,
} from "@mui/material";
import Grid from "@mui/material/Grid2";

import { postJson } from "./API_utils";
import { getJson } from "./API_utils";
let API_path = "users";

const errorCodes = {
  0: <></>,
  1: <Alert severity="success">Successfully submitted.</Alert>,
  2: <Alert severity="warning">The name provided is already in use.</Alert>,
  3: <Alert severity="error">No name was provided.</Alert>,
};

function isNumber(text) {
  const num = +text;
  return !isNaN(num);
}

function validateForm(formData, users) {
  console.log(formData);
  const formName = formData.name;
  if (formName === undefined || formName === "") {
    return { message: 3, success: false };
  }
  if (
    users
      .map((user) => user.name.toUpperCase())
      .includes(formName.toUpperCase())
  ) {
    return { message: 2, success: false };
  }
  console.log("made it to success");
  return { message: 1, success: true };
}

function handleSend(
  formData,
  setValidationMessage,
  refreshFormData,
  splitter_name,
  users
) {
  console.log("Sending to splitter: " + splitter_name + " data follows:");
  console.log(formData);
  const { message, success } = validateForm(formData, users);
  setValidationMessage(message);
  if (success) {
    refreshFormData();
    postJson(API_path + "/" + splitter_name, formData);
  }
}

function InitialDetails({ formData, addFormProperty }) {
  return (
    <>
      <List>
        <ListItem>
          <TextField
            label="Name"
            value={formData["name"]}
            onChange={(event) => addFormProperty("name", event.target.value)}
          />
        </ListItem>
        <ListItem>
          <TextField
            label="Name On Account"
            value={formData["name_on_account"]}
            onChange={(event) =>
              addFormProperty("name_on_account", event.target.value)
            }
          />
        </ListItem>
        <ListItem>
          <TextField
            label="Extra Payment Details"
            value={formData["paying_description"]}
            onChange={(event) =>
              addFormProperty("paying_description", event.target.value)
            }
          />
        </ListItem>
      </List>
    </>
  );
}

function PaymentDetails({ formData, addFormProperty }) {
  const [is_international, setIs_international] = useState(false);
  return (
    <List>
      UK Bank Account
      <Checkbox
        checked={!is_international}
        onChange={(event) => setIs_international(!event.target.checked)}
      />
      {is_international ? (
        <>
          <ListItem>
            <TextField
              label="BIC"
              value={formData["BIC_code"]}
              onChange={(event) =>
                addFormProperty("BIC_code", event.target.value)
              }
            />
          </ListItem>
          <ListItem>
            <TextField
              label="IBAN"
              value={formData["IBAN_number"]}
              onChange={(event) =>
                addFormProperty("IBAN_number", event.target.value)
              }
            />
          </ListItem>
        </>
      ) : (
        <>
          <ListItem>
            <TextField
              label="Sort Code"
              value={formData["sort_code"]}
              onChange={(event) => {
                const text = event.target.value;
                if (isNumber(text)) {
                  addFormProperty("sort_code", text);
                }
              }}
            />
          </ListItem>
          <ListItem>
            <TextField
              label="Account Number"
              value={formData["account_number"]}
              onChange={(event) => {
                const text = event.target.value;
                if (isNumber(text)) {
                  addFormProperty("account_number", text);
                }
              }}
            />
          </ListItem>
        </>
      )}
    </List>
  );
}
function NewUserPage({ splitter_name, isMobile }) {
  const [users, setUsers] = useState([]);
  useEffect(() => getJson("users/" + splitter_name, setUsers), [splitter_name]);

  const defaultForm = {
    name: "",
    name_on_account: "",
    paying_description: "",
    account_number: "",
    sort_code: "",
    IBAN_number: "",
    BIC_code: "",
  };
  const [formData, setFormData] = useState(defaultForm);
  function refreshFormData() {
    setFormData(defaultForm);
  }
  function addFormProperty(key, value) {
    setFormData({ ...formData, [key]: value });
  }
  const [validationMessage, setValidationMessage] = useState(0);

  return (
    <>
      {/* <Typography variant="h3">Add a New User:</Typography> */}
      <h1>Add a New User:</h1>
      <Typography variant="body">
        Enter your details below. Name is required, but bank details can be
        included if you want to be paid back more easily. (Don't enter bank
        details if you are worried about security for the moment)
      </Typography>
      {/* <Typography variant="body2">
        Note: I have not implemented any security for sending bank details, so
        in the worse case of this data leaking someone could try and set up a
        direct debit with your details, so maybe don't put them in.
      </Typography> */}
      <Grid container justify="center" alignItems="center" direction="column">
        <Grid container sx={{ outline: "0.2px solid gray", p: 1, m: 4 }}>
          <Grid
            container
            direction="column"
            alignItems="center"
            justify="center"
          >
            <InitialDetails
              formData={formData}
              addFormProperty={addFormProperty}
            />
          </Grid>
          <Grid
            container
            direction="column"
            alignItems="center"
            justify="center"
          >
            <PaymentDetails
              formData={formData}
              addFormProperty={addFormProperty}
            />
          </Grid>
        </Grid>
        <Button
          sx={{ width: "15em", mb: 3 }}
          variant="contained"
          onClick={() =>
            handleSend(
              formData,
              setValidationMessage,
              refreshFormData,
              splitter_name,
              users
            )
          }
        >
          Submit
        </Button>
        {errorCodes[validationMessage]}
      </Grid>
    </>
  );
}

export default NewUserPage;
