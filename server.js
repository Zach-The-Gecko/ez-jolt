import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import getShiftsForDateRange from "./getShiftsForDateRange.js";
// import { readFileSync } from "fs";

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(join(__dirname, "public")));

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/get-shifts-for-date-range", async (req, res) => {
  const { start, end } = JSON.parse(req.query.data);
  const shifts = await getShiftsForDateRange(start, end);
  res.send(JSON.stringify(shifts));

  // res.send(readFileSync(join(__dirname, "shifts.json"), "utf-8")); // Just used while developing frontend so we don't have to make a request to the Jolt API every time
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
