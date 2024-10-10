const BACKEND_PATH = "http://127.0.0.1:5000";

export function getJson(path, setter) {
  fetch(BACKEND_PATH + "/" + path)
    .then((response) => response.json())
    .then((result) => {
      setter(result);
      return result;
    })
    .catch((error) => console.error(error));
}

export function postJson(path, json) {
  fetch(BACKEND_PATH + "/" + path, {
    method: "POST",
    body: JSON.stringify(json),
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  }).catch((error) => console.error(error));
}
