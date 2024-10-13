import { useEffect, useState } from "react";
import { Checkbox, TextField, List, ListItem, Button } from "@mui/material";
import Grid from "@mui/material/Grid2";

import { postJson } from "./API_utils";

let API_path = "users";

function handleSend(formData, splitter_name) {
  console.log("Sending to splitter: " + splitter_name + " data follows:");
  console.log(formData);
  postJson(API_path + "/" + splitter_name, formData);
}

function InitialDetails({ addFormProperty }) {
  return (
    <>
      <List>
        <ListItem>
          <TextField
            label="Name"
            onChange={(event) => addFormProperty("name", event.target.value)}
          />
        </ListItem>
        <ListItem>
          <TextField
            label="Name On Account"
            onChange={(event) =>
              addFormProperty("name_on_account", event.target.value)
            }
          />
        </ListItem>
        <ListItem>
          <TextField
            label="Extra Payment Details"
            onChange={(event) =>
              addFormProperty("paying_description", event.target.value)
            }
          />
        </ListItem>
      </List>
    </>
  );
}

function PaymentDetails({ addFormProperty }) {
  const [is_international, setIs_international] = useState(false);
  return (
    <>
      UK Bank Account
      <Checkbox
        checked={!is_international}
        onChange={(event) => setIs_international(!event.target.checked)}
      />
      {is_international ? (
        <>
          <TextField
            label="BIC"
            onChange={(event) =>
              addFormProperty("BIC_code", event.target.value)
            }
          />
          <TextField
            label="IBAN"
            onChange={(event) =>
              addFormProperty("IBAN_number", event.target.value)
            }
          />
        </>
      ) : (
        <>
          <TextField
            label="Sort Code"
            onChange={(event) =>
              addFormProperty("sort_code", event.target.value)
            }
          />
          <TextField
            label="Account Number"
            onChange={(event) =>
              addFormProperty("account_number", event.target.value)
            }
          />
        </>
      )}
    </>
  );
}
function NewUserPage({ splitter_name }) {
  const [formData, setFormData] = useState({});
  function addFormProperty(key, value) {
    setFormData({ ...formData, [key]: value });
  }
  return (
    <>
      <h1>Add a New User:</h1>
      <Grid container>
        <Grid
          sx={{ border: "0.2px solid gray" }}
          container
          //size={3}
          direction="column"
          alignItems="center"
          justify="center"
        >
          <InitialDetails addFormProperty={addFormProperty} />
        </Grid>
        <Grid
          container
          size={3}
          direction="column"
          alignItems="center"
          justify="center"
        >
          <PaymentDetails addFormProperty={addFormProperty} />
        </Grid>
        <Button
          variant="contained"
          fullWidth
          onClick={() => handleSend(formData, splitter_name)}
        >
          Submit
        </Button>
      </Grid>
    </>
  );
}

export default NewUserPage;
