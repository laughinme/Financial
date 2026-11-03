import { cp } from "node:fs/promises";
await cp(
  new URL("../.next/static/", import.meta.url),
  new URL("../.next/standalone/.next/static/", import.meta.url),
  { recursive: true },
);
