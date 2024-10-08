import { Box, Button } from "@mui/material";

const page_data = [
  { page_name: "new_user", label: "New User" },
  { page_name: "new_transaction", label: "New Transaction" },
  { page_name: "view_transactions", label: "View Transactions" },
  { page_name: "view_balances", label: "View Balances" },
];

function PageSelector({ setPage }) {
  return (
    <Box className="pageSelector">
      {page_data.map((page) => (
        <Button onClick={() => setPage(page["page_name"])}>
          {page["label"]}
        </Button>
      ))}
    </Box>
  );
}

export default PageSelector;
