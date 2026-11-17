import "dotenv/config";
import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth.js";
import { devicesRouter } from "./routes/devices.js";
import { adminRouter } from "./routes/admin.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/devices", devicesRouter);
app.use("/api/admin", adminRouter);

const port = process.env.PORT || 3333;

app.listen(port, () => {
	console.log(`Servidor rodando em http://localhost:${port}`);
});
