import SimpleForm from "./SimpleForm";

let API_DOMAIN = "http://127.0.0.1:5000/users";
let questions = [
  { name: "Name", property: "name" },
  { name: "Bank Details", property: "bank_details" },
];

function NewUserPage() {
  return (
    <>
      <h1>New user page</h1>
      <SimpleForm API_domain={API_DOMAIN} questions={questions} />
    </>
  );
}

export default NewUserPage;
