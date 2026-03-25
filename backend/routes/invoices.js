const express = require("express");

const { getAll, get, add, replace, remove } = require("../data/invoice");
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

    // Emit event with detailed invoice information
    if (req.io) {
      req.io.emit("invoice:created", {
        message: `New invoice created: ${newInvoice.title}`,
        invoice: newInvoice,
      });
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

router.delete("/:id", async (req, res, next) => {
  try {
    await remove(req.params.id);
    res.json({ message: "Invoice deleted." });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
