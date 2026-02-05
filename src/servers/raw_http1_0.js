import net from "net";
import fs from "fs";
import path from "path";
import chalk from "chalk";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let connectionCount = 0;

const server = net.createServer((socket) => {
  const connId = ++connectionCount;
  console.log(
    chalk.green(
      `[HTTP/1.0] New TCP connection ${connId} established from ${socket.remoteAddress}:${socket.remotePort}`,
    ),
  );

  socket.on("data", (data) => {
    // Parse HTTP/1.0 request
    const request = data.toString();
    const [requestLine] = request.split("\r\n");
    const [method, url] = requestLine.split(" ");

    console.log(
      chalk.blueBright(`[HTTP/1.0] Connection ${connId} - ${method} ${url}`),
    );

    const filePath = path.join(__dirname, "../../public/static", url);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const content = fs.readFileSync(filePath);

      // Manually construct HTTP/1.0 response
      const header =
        "HTTP/1.0 200 OK\r\n" +
        "Content-Type: text/plain\r\n" +
        `Content-Length: ${content.length}\r\n` +
        "\r\n";

      socket.write(header);
      socket.write(content);
      console.log(
        chalk.bgBlue(
          `[HTTP/1.0] Connection ${connId} - 200 OK sent, closing connection`,
        ),
      );
    } else {
      const body = "File Not Found";
      const header =
        "HTTP/1.0 404 Not Found\r\n" +
        "Content-Type: text/plain\r\n" +
        `Content-Length: ${body.length}\r\n` +
        "\r\n";

      socket.write(header);
      socket.write(body);
      console.log(
        `[HTTP/1.0] Connection ${connId} - 404 Not Found sent, closing connection`,
      );
    }

    //  HTTP/1.0: Close connection after response
    socket.end();
  });

  socket.on("end", () => {
    console.log(chalk.redBright(`[TCP] connection ${connId} ended by client`));
  });

  socket.on("close", () => {
    console.log(chalk.gray(`[TCP] Connection ${connId} fully closed\n`));
  });

  socket.on("error", (err) => {
    console.log(
      chalk.yellow(`[TCP] Connection ${connId} error: ${err.message}`),
    );
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(
    chalk.blue(`HTTP/1.0 server running on http://localhost:${PORT}`),
  );
  console.log(
    chalk.red.bold("Behaviour: New TCP connection for EVERY Request"),
  );
});
