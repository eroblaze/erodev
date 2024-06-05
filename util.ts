import { debounce, blue, dim, gray, underline } from "./dep.ts";

export function injectWebSocket(fileContent: string): string {
  const websocketjs = `
<!-- Code injected by LiveDev -->
<script>
if ("WebSocket" in window) {
  const protocol = window.location.protocol === "http:"?"ws://":"wss://";
  const socket = new WebSocket(protocol + window.location.host + window.location.pathname + "/ws");

  socket.onmessage = (msg) => {
    if (msg.data === "reload") {
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
  console.log(`${blue("[Livedev]")}: ${underline(dim(filename))} change detected! Reloading!`);
  socket.send("reload");
}, 200);
