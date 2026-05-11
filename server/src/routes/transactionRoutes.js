const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");

router.get("/", transactionController.getAllTransactions);
router.get("/:id/detail", transactionController.getTransactionDetail);
router.get("/:id/invoice", transactionController.getInvoicePDF);
router.get("/:id", transactionController.getTransactionById);
router.patch("/:id/refund", transactionController.refundTransaction);
router.delete("/:id", transactionController.deleteTransaction);

module.exports = router;
