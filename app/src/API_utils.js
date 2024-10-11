const BACKEND_PATH = "https://reuzed.pythonanywhere.com";
//"http://127.0.0.1:5000";

export function getJson(path, setter) {
  fetch(BACKEND_PATH + "/" + path)
    .then((response) => {
      console.log(response);
      return response.json();
    })
    .then((result) => {
      console.log(result);
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
