const express = require("express");

const { getAll, get, add, replace, remove, updateStatus } = require("../data/invoice");
const { add: addActivity } = require("../data/activity");
const beneficiaryData = require("../data/beneficiary");
const { checkAuth } = require("../util/auth");
const {
  isValidText,
  isValidDate,
} = require("../util/validation");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const invoices = await getAll();
    res.json({ invoices: invoices });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const invoice = await get(req.params.id);
    res.json({ invoice: invoice });
  } catch (error) {
    next(error);
  }
});

router.use(checkAuth);

router.post("/", async (req, res, next) => {
  const data = req.body;

  let errors = {};

  if (!isValidText(data.title)) {
    errors.title = "Invalid title.";
  }

  if (!isValidText(data.clientName)) {
      errors.clientName = "Invalid client name.";
  }

  if (!isValidText(data.amount)) {
      errors.amount = "Invalid amount.";
  }

  if (!isValidDate(data.date)) {
    errors.date = "Invalid date.";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      message: "Adding the invoice failed due to validation errors.",
      errors,
    });
  }

  try {
    const newInvoice = await add(data);

    // Auto-save beneficiary if customer is new
    if (data.customer && data.customer.email) {
      const beneficiaries = await beneficiaryData.getAll(req.token.email);
      const exists = beneficiaries.find(b => b.email.toLowerCase() === data.customer.email.toLowerCase());
      if (!exists) {
        console.log('Auto-saving beneficiary from invoice:', data.customer.email);
        await beneficiaryData.create(req.token.email, {
          name: data.customer.name || 'Unnamed Client',
          email: data.customer.email,
          phone: data.customer.phone || '',
          accountName: data.accountName || '',
          accountNumber: data.accountNumber || '',
          bankName: data.bankAddress || ''
        });
      }
    }

    // Create activity
    const activity = await addActivity({
      type: 'create',
      message: `New invoice created: ${newInvoice.title}`,
      invoiceId: newInvoice.invoiceNumber,
      user: req.token?.email || 'System'
    });

    // Emit event with detailed invoice information
    if (req.io) {
      req.io.emit("invoice:activity", activity);
    }

    res.status(201).json({ message: "Invoice saved.", invoice: newInvoice });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  const data = req.body;

  let errors = {};

  if (!isValidText(data.title)) {
    errors.title = "Invalid title.";
  }

  if (!isValidText(data.clientName)) {
      errors.clientName = "Invalid client name.";
  }

  if (!isValidText(data.amount)) {
      errors.amount = "Invalid amount.";
  }

  if (!isValidDate(data.date)) {
    errors.date = "Invalid date.";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      message: "Updating the invoice failed due to validation errors.",
      errors,
    });
  }

  try {
    const updatedInvoice = await replace(req.params.id, data);
    res.json({ message: "Invoice updated.", invoice: updatedInvoice });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/status", async (req, res, next) => {
  const { status } = req.body;
  const allowed = ['draft', 'sent', 'paid', 'done', 'cancelled', 'overdue', 'pending payment', 'unpaid'];
  if (!status || !allowed.includes(status.toLowerCase())) {
    return res.status(422).json({ message: "Invalid status value." });
  }
  try {
    const updated = await updateStatus(req.params.id, status);

    // Create activity
    const activity = await addActivity({
      type: 'status_change',
      message: `Invoice ${updated.invoiceNumber} status updated to ${status}`,
      invoiceId: updated.invoiceNumber,
      user: req.token?.email || 'System'
    });

    // Emit activity
    if (req.io) {
      req.io.emit("invoice:activity", activity);
    }

    res.json({ message: "Invoice status updated.", invoice: updated });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await remove(req.params.id);
    res.json({ message: "Invoice deleted." });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
