import { getLocal, type Mockttp } from "mockttp";

class MockApiServer {
  private readonly server: Mockttp;
  private readonly port: number;

  constructor() {
    this.server = getLocal();
    this.port = 9000; // < Make sure this matches the port in your custom API_URL env url
  }

  reset() {
    this.server.reset();
  }

  start() {
    this.server.start(this.port);
    this.server
      .forGet("/")
      .thenReply(200, "Mock API server is up")
      .then(() => {
        console.info(
          `\n📡 Mock API server running on http://localhost:${this.port}\n`
        );
      });
  }

  stop() {
    this.server.stop().then(() => {
      console.info(`📡 Mock API server stopped`);
    });
  }

  mockGetResponse({ path, data }: { path: string; data: object }) {
    console.debug(`Mock API server: GET ${path}`);
    this.server.forGet(path).thenJson(200, data);
  }
}

export default MockApiServer;
