import {
  TextField,
  Box,
  ListItemButton,
  List,
  ListItem,
  Alert,
} from "@mui/material";
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
    <Box>
      <Box>
        <List>
          {text_fields.map((text_field) => (
            <ListItem>{text_field}</ListItem>
          ))}
          <ListItemButton
            onClick={handleSend(
              questions,
              setResults,
              responses,
              resetResponses,
              setJustSubmitted
            )}
          >
            Click here to submit the form.
          </ListItemButton>
          {justSubmitted && (
            <Alert icon={<CheckIcon />} severity="success">
              Successfully Submitted.
            </Alert>
          )}
        </List>
      </Box>
    </Box>
  );
}

export default SimpleForm;
