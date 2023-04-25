import express from "express";
import { Configuration, OpenAIApi } from "openai";
import { MODEL, TEMP, PERSONA } from "./constants.js";
import { logger, httpLogger } from "./logging.js";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(httpLogger);
app.use(cors({ origin: "*", credentials: true }));

const PORT = 8080;
const HOST = "0.0.0.0";

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
        getAIResponse(messages)
            .then((data) => {
                res.json(data.data);
                logger.debug(JSON.stringify(messages));
                logger.debug(JSON.stringify(data.data));
                logger.info(JSON.stringify(messages[messages.length - 1]));
                logger.info(JSON.stringify(data.data.choices[0].message));
            })
            .catch((err) => {
                logger.error(JSON.stringify(err));
                next(err);
            });
    } else {
        res.sendStatus(401).send("Invalid token");
    }
});

app.listen(PORT, HOST, () => {
    logger.info(`Server running on ${HOST}:${app.get("port")}`);
});
