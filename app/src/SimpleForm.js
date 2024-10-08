let API_DOMAIN = "http://127.0.0.1:5000/transactions/0";

let test_data = {
  name: "Robert",
  amount: 123,
};

function sendRequest() {
  fetch(API_DOMAIN, {
    method: "POST",
    body: JSON.stringify({ a: 1 }),
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  });
}

function SimpleForm() {
  return <button onClick={sendRequest}>Click Me to send a request!</button>;
}

export default SimpleForm;
