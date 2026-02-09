# HTTP CONNECTION SIMULATION (for different versions of HTTP)

HTTP relies on transport layer protocol to send/recieve message over the network. TCP is a transport layer protocol, which does this job for HTTP. HTTP protocol defines the structure or format of message, and TCP does the heavy lifting of delivering it as it is and not loose it on the way(if it does it follows a courtersy of sending an error message).

With different versions of HTTP, establishing TCP connection has also evolved over time. Through the code contained in this repository, I tried to explore how TCP connection is created and destroyed over different versions of HTTP.

| HTTP Versions | Connection Model              |
| ------------- | ----------------------------- |
| HTTP/1.0      | New Connection per resquest   |
| HTTP/1.1      | Persistent Connections        |
| HTTP/2        | Single Multiplexed connection |

## HTTP/1.0 Implementation: Two Approaches

This projects demonstrates two different approaches to implement HTTP/1.0 server in Node.js.

In this repo, there are two files containing for this:

| File                       | Module Used | Approach           |
| -------------------------- | ----------- | ------------------ |
| src/servers/http1_0.js     | http        | Simulated HTTP/1.0 |
| src/servers/raw_http1_0.js | net         | True HTTP/1.0      |

## Approach 1: Using `http` Module (`http1_0.js`)

The initial implementation uses Node.js's built in `http` module with a workaround to simulate HTTP/1.0 behaviour:

```
res.setHeader("Connection", "close");
```

I wasn't convinced with implementation using `http` module since this module is implemented as http/1.1 under the hood. The protocol version in response is still http/1.1. This makes this experimenation inaccurate from a protocol perspective.

## Approach 2: Using the `net` Module (`raw_http1_0.js`)

In this approach I have utilised raw TCP socket from Node.js's net module this gives full control over request parsing, manually crafting the HTTP/1.0 response. Explicitly closing the connection after each reponse (`socket.end()`).

## Upcoming...

Later I will also simulate HTTP/1.1 connection handling.

## Running the Servers

1. Clone the repository.
2. `cd` to the directory.
3. Run the server:

```
# Run the net module version (true HTTP/1.0)
  node src/servers/raw_http1_0.js

# If you want you can run the http module version (simulated HTTP/1.0)
  node src/servers/http1_0.js
```

4. Open another terminal and send request to this http server:

```
curl -v http://localhost:3000/file1.txt
```
