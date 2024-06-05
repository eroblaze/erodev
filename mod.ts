import { debounceFn, injectWebSocket } from "./util.ts";
import {
  path_join,
  serveFile,
  path_extname,
  green,
  red,
  bold,
  italic,
  blue,
  url_dirname,
  url_extname,
  path_dirname,
  Erowatch
} from "./dep.ts";
import { assert } from "jsr:@std/assert@^0.225.3/assert";

// Check the argument list
let PORT = 3000;
let PORT_OK = 0;

const argsList = Deno.args;
let filename: string = "";

if (argsList.length) {
  argsList.forEach((arg) => {
    if (!arg.startsWith("--port=")) {
      console.error(`${red(bold("error"))}: unexpected argument '${arg}' found`);
      Deno.exit(1);
    } else {
      if (PORT_OK) {
        console.error(
          `${red(bold("error"))}: the argument '--port=<PORT>' cannot be used multiple times`
        );
        Deno.exit(1);
      }
      const argSections = arg.split("=");
      if (argSections.length === 1 || argSections.length > 2 || !argSections[1].match(/^\d+$/g)) {
        console.error(
          `${red(bold("error"))}: unexpected value '${argSections.slice(1).join("=")}' found`
        );
        Deno.exit(1);
      } else {
        PORT = +argSections[1];
        PORT_OK = 1;
      }
    }
  });
}

Deno.serve(
  { port: PORT, onListen: () => console.log(italic(green(`Server is Started at port: ${PORT}`))) },
  async (req: Request) => {
    if (req.headers.get("upgrade") === "websocket") {
      const url = new URL(req.url);
      assert(url.pathname.endsWith("ws"), "url doesn't end with '/ws'");
      filename = path_join(Deno.cwd(), path_dirname(url.pathname));

      if (path_extname(filename) !== ".html") {
        filename = path_join(filename, "index.html");
      }

      const { socket, response } = Deno.upgradeWebSocket(req);

      let watcher: Deno.FsWatcher | null;

      socket.onopen = async () => {
        socket.send("Connected");
        console.log("connected from server", filename);

        watcher = Deno.watchFs(filename);

        for await (const event of watcher) {
          if (event.kind == "modify") {
            console.log("modify");
            // Multiple 'modify' events gets fired at the same time, so ensure only the first event invokes 'debounceFn()'
            debounceFn(socket, filename);
          }
        }
      };

      socket.onmessage = (e: MessageEvent<any>) => {
        console.log(`received: ${e.data}`);
      };

      socket.onclose = () => {
        console.log("disconnected");
        watcher?.close();
      };

      return response;
    } else {
      const url = new URL(req.url);
      filename = path_join(Deno.cwd(), url.pathname);

      console.log(`${blue("from other part:")} ${filename}`);

      if (url_extname(url) === ".html") {
        // serve `filename` from the current working dir

        let fileContent: string = "";

        try {
          fileContent = await Deno.readTextFile(filename);
        } catch {
          return new Response("Not Found", { status: 404 });
        }

        const injectedHtml = injectWebSocket(fileContent);
        return new Response(injectedHtml, {
          headers: {
            "Content-Type": "text/html"
          }
        });
      } else {
        /*
         * There are other two possibilites:
         * a) Other Resources like CSS, js, etc
         * b) A directory
         */
        try {
          // Check if that file exists
          const fileInfo = Deno.lstatSync(filename);
          if (!fileInfo.isFile) throw Deno.errors.NotFound;
          return serveFile(req, filename);
        } catch {
          filename = path_join(filename, "index.html");
          let fileContent: string = "";

          try {
            fileContent = await Deno.readTextFile(filename);
          } catch {
            return new Response("Not Found", { status: 404 });
          }

          const injectedHtml = injectWebSocket(fileContent);
          return new Response(injectedHtml, {
            headers: {
              "Content-Type": "text/html"
            }
          });
        }
      }
    }
  }
);
