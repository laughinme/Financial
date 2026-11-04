import { createServer } from "node:http";
import { once } from "node:events";
import { spawn } from "node:child_process";
import {
  mkdtemp,
  mkdir,
  readFile,
  writeFile,
  symlink,
  rm,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";
const frontend = fileURLToPath(new URL("../", import.meta.url));
const listen = async (server) => {
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  return server.address().port;
};
export async function startProxyFixture({ configText } = {}) {
  const calls = [];
  const backend = createServer(async (req, res) => {
    const url = new URL(req.url, "http://backend.test");
    let body = "";
    for await (const chunk of req) body += chunk;
    calls.push({
      url: req.url,
      method: req.method,
      cookie: req.headers.cookie,
      body,
    });
    if (url.pathname === "/api/v1/users/me") {
      res.writeHead(307, { location: "/api/v1/users/me/" + url.search });
      res.end();
      return;
    }
    if (!req.headers.cookie?.includes("session=proxy-test")) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end('{"detail":"Not authorized"}');
      return;
    }
    if (req.method === "POST") {
      if (url.pathname.endsWith("/")) {
        res.writeHead(307, { location: url.pathname.slice(0, -1) });
        res.end();
        return;
      }
      res.writeHead(204);
      res.end();
      return;
    }
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Set-Cookie": "session=refreshed-test; Path=/; HttpOnly",
    });
    res.end('{"id":"proxy-test-user"}');
  });
  const backendPort = await listen(backend);
  const reserve = createServer();
  const port = await listen(reserve);
  await new Promise((resolve) => reserve.close(resolve));
  const directory = await mkdtemp(join(tmpdir(), "financial-api-proxy-"));
  let process,
    output = "";
  const close = async () => {
    if (process && process.exitCode === null) {
      const exited = once(process, "exit");
      process.kill("SIGTERM");
      if (
        !(await Promise.race([
          exited.then(() => true),
          delay(5000).then(() => false),
        ]))
      ) {
        process.kill("SIGKILL");
        await exited;
      }
    }
    backend.closeAllConnections();
    await new Promise((resolve) => backend.close(resolve));
    await rm(directory, { recursive: true, force: true });
  };
  try {
    await mkdir(join(directory, "app"));
    await symlink(
      join(frontend, "node_modules"),
      join(directory, "node_modules"),
    );
    await writeFile(
      join(directory, "package.json"),
      await readFile(join(frontend, "package.json")),
    );
    await writeFile(
      join(directory, "next.config.ts"),
      configText ?? (await readFile(join(frontend, "next.config.ts"))),
    );
    await writeFile(
      join(directory, "app/layout.tsx"),
      "export default function Layout({children}) { return <html><body>{children}</body></html>; }",
    );
    await writeFile(
      join(directory, "app/page.tsx"),
      "export default function Page() { return <p>Proxy test</p>; }",
    );
    process = spawn(
      globalThis.process.execPath,
      [
        join(frontend, "node_modules/next/dist/bin/next"),
        "dev",
        "--webpack",
        "--hostname",
        "127.0.0.1",
        "--port",
        String(port),
      ],
      {
        cwd: directory,
        env: {
          ...globalThis.process.env,
          NODE_ENV: "development",
          NEXT_TELEMETRY_DISABLED: "1",
          API_PROXY_URL: `http://127.0.0.1:${backendPort}`,
        },
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    process.stdout.on("data", (chunk) => (output += chunk));
    process.stderr.on("data", (chunk) => (output += chunk));
    const origin = `http://127.0.0.1:${port}`;
    for (let attempt = 0; attempt < 80; attempt++) {
      try {
        const response = await fetch(origin, {
          signal: AbortSignal.timeout(1000),
        });
        await response.text();
        if (response.ok) return { origin, calls, close };
      } catch {
        /* Wait for the isolated Next.js server to start. */
      }
      if (process.exitCode !== null) break;
      await delay(250);
    }
    throw new Error(`Proxy fixture did not start:\n${output}`);
  } catch (error) {
    await close();
    throw error;
  }
}
