import winston from "winston";
import morgan from "morgan";

const { combine, timestamp, printf, json, align, splat, errors, prettyPrint } =
    winston.format;

const logLevels = {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
    trace: 5,
};

const logger = winston.createLogger({
    levels: logLevels,
    level: process.env.LOG_LEVEL || "info",
    format: combine(
        errors({ stack: true }),
        timestamp({
            format: "YYYY-MM-DD hh:mm:ss.SSS A",
        }),
        json(),
    ),
    transports: [new winston.transports.Console()],
    exceptionHandlers: [new winston.transports.Console()],
    rejectionHandlers: [new winston.transports.Console()],
});

const httpLogger = new morgan("short", {
    stream: { write: (message) => logger.info(message.trim()) },
});

export { logger, httpLogger };
