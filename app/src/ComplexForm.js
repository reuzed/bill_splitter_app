import { TextField, Box, ListItemButton, List, ListItem } from "@mui/material";
import { useState } from "react";
import "./App.css";

function sendRequest(API_domain, json_data) {
  fetch(API_domain, {
    method: "POST",
    body: JSON.stringify(json_data),
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  }).catch((error) => console.error(error));
}

function handleSend(API_domain, questions, responses) {
  let question_count = responses.length;
  let json_data = {};
  for (let i = 0; i < question_count; i++) {
    if (responses[i] === "") {
      return () => alert("Fill in the form to send!");
    }
    json_data[questions[i]["property"]] = responses[i];
  }
  return () => {
    sendRequest(API_domain, json_data);
  };
}

function SimpleForm({ API_domain, questions }) {
  //Takes an API_domain to which the form results will be passed on
  //Takes a list of question,property dicts, forms this into a question list
  const question_count = questions.length;
  const [responses, setResponses] = useState(Array(question_count).fill(""));

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
            onClick={handleSend(API_domain, questions, responses)}
          >
            Click here to submit the form.
          </ListItemButton>
        </List>
      </Box>
    </Box>
  );
}

export default SimpleForm;
