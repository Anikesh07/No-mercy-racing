import express from "express";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    await import("../seedAdmin.js");

    res.json({
      success: true,
      message: "Admins seeded successfully"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;