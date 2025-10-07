import pino from "pino";
export const logger = pino({
  level: process.env.LOG_LEVEL || "debug",
  base: {
    pid: false,
    hostname: false,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: label => ({level: label}),
  },
  serializers: {
    err: pino.stdSerializers.err,
  },
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
    },
  },
});
