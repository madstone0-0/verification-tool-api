import express from "express";
import { Configuration, OpenAIApi } from "openai";
import { MODEL, TEMP, PERSONA } from "./constants.js";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(morgan("dev"));
app.use(cors({ origin: "*", credentials: true }));

const PORT = 3000;
const HOST = "localhost";

app.set("port", process.env.port || PORT);
app.use(express.json());

const chatConfig = new Configuration({
    apiKey: process.env.OPENAI_KEY,
});

const openai = new OpenAIApi(chatConfig);

const getAIResponse = async (messages) => {
    const completion = await openai.createChatCompletion({
        model: MODEL,
        messages: [{ role: "system", content: `${PERSONA}` }, ...messages],
        temperature: TEMP,
    });
    return completion;
};

app.get("/info", (req, res, next) => {
    res.send("HealthVerifyX proxy server");
});

app.use("", (req, res, next) => {
    if (req.headers.authorization == "baller") {
        next();
    } else {
        res.sendStatus(403);
    }
});

app.post("/api/:token", (req, res, next) => {
    const token = req.params.token;
    if (token == "baller") {
        const messages = req.body;
        console.log({ messages });
        getAIResponse(messages).then((data) => {
            console.log(data.data);
            res.json(data.data);
        });
    } else {
        res.sendStatus(401).send("Invalid token");
    }
});

app.listen(PORT, HOST, () => {
    console.log(`Server running on ${HOST}:${app.get("port")}`);
});
