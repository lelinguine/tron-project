const LEVELS = ["error", "warn", "info", "debug"];

const currentLevel =
  LEVELS.indexOf(process.env.LOG_LEVEL?.toLowerCase()) !== -1
    ? process.env.LOG_LEVEL.toLowerCase()
    : "info";

const shouldLog = (level) => LEVELS.indexOf(level) <= LEVELS.indexOf(currentLevel);

const formatMessage = (level, message, meta) => {
  const time = new Date().toISOString();
  const base = `[${time}] [${level.toUpperCase()}] ${message}`;
  if (!meta) {
    return base;
  }
  if (meta instanceof Error) {
    return `${base} :: ${meta.stack || meta.message}`;
  }
  if (typeof meta === "object") {
    return `${base} :: ${JSON.stringify(meta)}`;
  }
  return `${base} :: ${meta}`;
};

export const logger = {
  info(message, meta) {
    if (shouldLog("info")) {
      console.log(formatMessage("info", message, meta));
    }
  },
  warn(message, meta) {
    if (shouldLog("warn")) {
      console.warn(formatMessage("warn", message, meta));
    }
  },
  error(message, meta) {
    if (shouldLog("error")) {
      console.error(formatMessage("error", message, meta));
    }
  },
  debug(message, meta) {
    if (shouldLog("debug")) {
      console.debug(formatMessage("debug", message, meta));
    }
  },
};
