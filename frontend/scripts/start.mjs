process.env.PORT ||= "4173";
process.env.HOSTNAME ||= "0.0.0.0";
await import("../.next/standalone/server.js");
