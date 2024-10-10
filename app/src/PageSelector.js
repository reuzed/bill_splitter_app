import { Box, Button, IconButton } from "@mui/material";

import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AddIcon from "@mui/icons-material/Add";
import BalanceIcon from "@mui/icons-material/Balance";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

const page_data = [
  { page_name: "new_user", label: "New User", icon: <PersonAddIcon /> },
  { page_name: "new_transaction", label: "New Transaction", icon: <AddIcon /> },
  {
    page_name: "view_transactions",
    label: "View Transactions",
    icon: <ReceiptLongIcon />,
  },
  { page_name: "view_balances", label: "View Balances", icon: <BalanceIcon /> },
];

function PageSelector({ setPage }) {
  return (
    <Box className="pageSelector">
      {page_data.map((page) => (
        <IconButton onClick={() => setPage(page["page_name"])}>
          {page["icon"]}
        </IconButton>
      ))}
    </Box>
  );
}

{
  /* <Button onClick={() => setPage(page["page_name"])}>
          {page["label"]}
        </Button> */
}

export default PageSelector;
