import { useState } from "react";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import ReceiptIcon from "@mui/icons-material/ReceiptLongOutlined";
import EntryPageTemplate from "../components/EntryPageTemplate";

export default function InvoicePage() {
  const [invoiceNo, setInvoiceNo] = useState("INV-2026-0142");
  const [amount, setAmount] = useState("2,50,000");

  return (
    <EntryPageTemplate
      entityType="INVOICE"
      entityId="demo-invoice-1"
      title="Invoice / Billing"
      subtitle="Billing address for an invoice raised to a client"
      icon={<ReceiptIcon />}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Invoice number" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Amount (INR)" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Grid>
      </Grid>
    </EntryPageTemplate>
  );
}
