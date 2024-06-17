import { assert } from "../dep.ts";
import { serveHandler } from "../mod.ts";

let URL = "http://localhost:5502";

Deno.test("Can serve an html file", { permissions: { read: true } }, async () => {
  URL = "http://localhost:5502/index.html";
  const req = new Request(URL);
  const res = await serveHandler(req);

  const htmlFile = await res.text();
  assert(htmlFile.includes("erodev test"), "Wrong File!");
});

Deno.test(
  "Can serve an 'index.html' file as the default entry file in a dir",
  { permissions: { read: true } },
  async () => {
    const req = new Request(URL);
    const res = await serveHandler(req);

    const htmlFile = await res.text();
    assert(htmlFile.includes("erodev test"), "Wrong File!");
  }
);

Deno.test("Can serve other types of file", { permissions: { read: true } }, async (t: Deno.TestContext) => {
  await t.step("CSS file", async () => {
    URL = "http://localhost:5502/style.css";
    const req = new Request(URL);
    const res = await serveHandler(req);

    const htmlFile = await res.text();
    assert(htmlFile.includes("color"), "Wrong File!");
  });

  await t.step("JavaScript file", async () => {
    URL = "http://localhost:5502/script.js";
    const req = new Request(URL);
    const res = await serveHandler(req);

    const htmlFile = await res.text();
    assert(htmlFile.includes("console"), "Wrong File!");
  });
});

Deno.test("Returns 404 when the requested page isn't found", { permissions: { read: true } }, async () => {
  URL = "http://localhost/notfound.html";
  const req = new Request(URL);
  const res = await serveHandler(req);

  assert(res.status == 404);
});
