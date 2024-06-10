import { debounce, blue, dim, underline, green, italic, red, bold } from "./dep.ts";

export function injectWebSocket(fileContent: string): string {
  const websocketjs = `
<!-- Code injected by EroDev -->
<script>
if ("WebSocket" in window) {

  function refreshCSS() {
    const sheets = Array.from(document.getElementsByTagName("link"));
    const head = document.getElementsByTagName("head")[0];
    for (let i = 0; i < sheets.length; ++i) {
      let elem = sheets[i];
      const parent = elem.parentElement || head;
      parent.removeChild(elem);
      const rel = elem.rel;
      if ( (elem.href && typeof rel != "string") || rel.length == 0 || rel.toLowerCase() == "stylesheet") {
        elem.href = !(elem.href.endsWith("?q=erodev"))? elem.href+"?q=erodev": elem.href;
      }
      parent.appendChild(elem);
    }
  }

  const protocol = window.location.protocol === "http:"?"ws://":"wss://";
  const socket = new WebSocket(protocol + window.location.host + window.location.pathname + "/ws");

  socket.onmessage = (msg) => {
    if (msg.data === "refreshCSS") refreshCSS()
    else if (msg.data === "reload") {
      socket.close();
      window.location.reload();
    }
  }

  socket.onopen = () => {
    console.log("CONNECTED FROM CLIENT");
  }

  socket.onclose = () => {
    console.log("CLOSED FROM CLIENT");
  }

  socket.onerror = () => {
    console.log("ERROR FROM CLIENT");
  }

} else {
  console.error("Upgrade your browser. This browser DOES NOT support WebSocket for live reloading");
}
</script>
`;
  return fileContent.replace(/\<\/body/, `${websocketjs}$&`);
}

export const debounceFn = debounce((socket: WebSocket, filename: string) => {
  console.log(`${blue("[erodev]")} ${underline(dim(filename))} change detected! Reloading!`);
  socket.send("reload");
}, 200);

export function eroListen(text: string) {
  return italic(green(`[erodev] ${text}`));
}

export function eroError(text: string) {
  return red(`${bold("error")} ${text}`);
}

export function eroLog(...text: string[]) {
  return `${blue("[erodev]")} ${text.join()}`;
}
