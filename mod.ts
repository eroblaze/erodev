import { eroError, eroListen, eroLog, injectWebSocket } from "./util.ts";
import {
  Erowatch,
  path_join,
  path_extname,
  path_dirname,
  url_extname,
  serveFile,
  assert,
  bold,
  italic,
  underline,
  dim,
  red,
  blue,
  green
} from "./dep.ts";

// For erowatch stuff
let watcher: Erowatch | undefined;

// Check the argument list
let PORT = 3000;
let PORT_OK = 0;

const argsList = Deno.args;
let filename: string = "";

if (argsList.length) {
  argsList.forEach((arg) => {
    if (!arg.startsWith("--port=")) {
      console.error(eroError(`unexpected argument '${arg}' found`));
      Deno.exit(1);
    } else {
      if (PORT_OK) {
        console.error(eroError(`the argument '--port=<PORT>' cannot be used multiple times`));
        Deno.exit(1);
      }
      const argSections = arg.split("=");
      if (argSections.length === 1 || argSections.length > 2 || !argSections[1].match(/^\d+$/g)) {
        console.error(eroError(`unexpected value '${argSections.slice(1).join("=")}' found`));
        Deno.exit(1);
      } else {
        PORT = +argSections[1];
        PORT_OK = 1;
      }
    }
  });
}
const serveOptions = {
  port: PORT,
  onListen: ({ port, hostname }: { port: number; hostname: string }) =>
    console.log(eroListen(`Server started at http://${hostname}:${port}`))
};

Deno.serve(serveOptions, async (req: Request) => {
  const url = new URL(req.url);

  if (req.headers.get("upgrade") === "websocket") {
    assert(url.pathname.endsWith("ws"), eroError("url doesn't end with '/ws'"));
    filename = path_join(Deno.cwd(), path_dirname(url.pathname));

    if (path_extname(filename) !== ".html") {
      filename = path_join(filename, "index.html");
    }

    const { socket, response } = Deno.upgradeWebSocket(req);

    socket.onopen = () => {
      socket.send("Connected");
      console.log(eroLog("Connected"));

      assert(watcher, eroError("watcher should not be undefined"));
      watcher
        .add(filename)
        .watch()
        .on("modify", (w_paths) => {
          console.log(
            `${blue("[erodev]")}: ${underline(dim(w_paths.join()))} change detected! Reloading!`
          );
          socket.send("reload");
        });
    };

    socket.onmessage = (e: MessageEvent) => {
      console.log(`received: ${e.data}`);
    };

    socket.onclose = () => {
      console.log(eroLog("Disconnected"));
      watcher?.close();
      watcher = undefined;
    };

    socket.onerror = () => {
      watcher?.close();
      watcher = undefined;
    };

    return response;
  } else {
    filename = path_join(Deno.cwd(), url.pathname);

    console.log(eroLog(`${blue("from other part->")} ${filename}`));

    if (url_extname(url) === ".html") {
      // serve `filename` from the current working dir

      let fileContent: string = "";

      try {
        fileContent = await Deno.readTextFile(filename);
      } catch {
        return new Response("Not Found", { status: 404 });
      }

      const injectedHtml = injectWebSocket(fileContent);

      watcher = new Erowatch();

      return new Response(injectedHtml, {
        headers: {
          "Content-Type": "text/html",
          "Cache-Control": "max-age=0"
        }
      });
    } else {
      /*
       * There are either two possibilites:
       * a) Other Resources like CSS, js, etc
       * b) A directory
       */
      try {
        // Check if that file exists
        const fileInfo = Deno.lstatSync(filename);
        if (!fileInfo.isFile) throw Deno.errors.NotFound;

        // Add Files that are automatically requested by the browser (after an html page loads) to the watcher instance
        if (watcher) {
          watcher.add(filename);
        }

        const resp = await serveFile(req, filename);
        resp.headers.set("Cache-Control", "max-age=0");
        return resp;
      } catch {
        filename = path_join(filename, "index.html");
        let fileContent: string = "";

        try {
          fileContent = await Deno.readTextFile(filename);
          if (!url.pathname.endsWith("/")) {
            // localhost/src != localhost/src/, so ensure it is redirected
            return Response.redirect(url.href + "/");
          }
        } catch {
          return new Response("Not Found", { status: 404 });
        }

        const injectedHtml = injectWebSocket(fileContent);

        watcher = new Erowatch();

        return new Response(injectedHtml, {
          headers: {
            "Content-Type": "text/html",
            "Cache-Control": "max-age=0"
          }
        });
      }
    }
  }
});
