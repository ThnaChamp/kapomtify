const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");

// GET /api/transactions?search=&status=&page=
router.get("/", transactionController.getAllTransactions);

// GET /api/transactions/:id
router.get("/:id", transactionController.getTransactionById);

// DELETE /api/transactions/:id
router.delete("/:id", transactionController.deleteTransaction);

module.exports = router;
