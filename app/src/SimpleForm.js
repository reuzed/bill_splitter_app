import {
  TextField,
  Box,
  Button,
  ListItemButton,
  List,
  ListItem,
  Alert,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import CheckIcon from "@mui/icons-material/Check";
import { useEffect, useState } from "react";
import "./App.css";

function handleSend(
  questions,
  setResults,
  responses,
  resetResponses,
  setJustSubmitted
) {
  let question_count = responses.length;
  let json_data = {};
  for (let i = 0; i < question_count; i++) {
    if (responses[i] === "") {
      return () => alert("Fill in the form to send!");
    }
    json_data[questions[i]["property"]] = responses[i];
  }
  return () => {
    setJustSubmitted(true);
    resetResponses();
    setResults(json_data);
  };
}

function SimpleForm({ questions, setResults }) {
  //Takes an API_domain to which the form results will be passed on
  //Takes a list of question,property dicts, forms this into a question list
  const [justSubmitted, setJustSubmitted] = useState(false);
  useEffect(() => {
    if (justSubmitted) {
      setTimeout(() => setJustSubmitted(false), 3000);
    }
  }, [justSubmitted]);

  const question_count = questions.length;
  const [responses, setResponses] = useState(Array(question_count).fill(""));
  const resetResponses = () => {
    setResponses(Array(question_count).fill(""));
  };

  function setResponse(i, value) {
    let copied_responses = structuredClone(responses);
    copied_responses[i] = value;
    setResponses(copied_responses);
  }

  let text_fields = questions.map((dict) => {
    let index = questions.indexOf(dict);
    return (
      <TextField
        label={dict["name"]}
        value={responses[index]}
        onChange={(event) => setResponse(index, event.target.value)}
      />
    );
  });

  return (
    <Grid container direction="column" alignItems="center" justify="center">
      <List style={{ border: "0.2px solid gray" }}>
        {text_fields.map((text_field) => (
          <ListItem>{text_field}</ListItem>
        ))}
        <ListItem>
          <Button
            variant="contained"
            fullWidth
            onClick={handleSend(
              questions,
              setResults,
              responses,
              resetResponses,
              setJustSubmitted
            )}
          >
            Submit
          </Button>
        </ListItem>
        {justSubmitted && (
          <Alert icon={<CheckIcon />} severity="success">
            Successfully Submitted.
          </Alert>
        )}
      </List>
    </Grid>
  );
}

export default SimpleForm;
