import SimpleForm from "./SimpleForm";

let API_DOMAIN = "http://127.0.0.1:5000/transactions";
let questions = [
  { name: "Payer New Title", property: "payer" },
  { name: "Amount", property: "amount" },
  { name: "Date", property: "date" },
];
function NewTransactionPage() {
  return (
    <>
      <h1>On the new transaction form.</h1>
      <SimpleForm API_domain={API_DOMAIN} questions={questions} />
    </>
  );
}

export default NewTransactionPage;
