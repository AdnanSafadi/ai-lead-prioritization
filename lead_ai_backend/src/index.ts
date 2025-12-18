import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

const PORT = Number(process.env.PORT || 4001);

app.use("/", routes);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
