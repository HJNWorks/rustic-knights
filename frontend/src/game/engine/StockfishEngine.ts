const ENGINE_URL = '/stockfish/stockfish-19-lite-single.js';
const READY_TIMEOUT_MS = 20000;
const MOVE_TIMEOUT_MS = 15000;

export class StockfishEngine {
  private worker: Worker | null = null;
  private skillLevel = 5;
  private ready = false;
  private pending: { prefix: string; resolve: (line: string) => void } | null = null;

  public async init(skillLevel: number): Promise<void> {
    this.skillLevel = skillLevel;
    if (this.worker) {
      this.worker.postMessage('setoption name Skill Level value ' + String(this.skillLevel));
      await this.sendWait('isready', 'readyok');
      return;
    }
    this.worker = new Worker(ENGINE_URL);
    this.worker.onmessage = (event: MessageEvent<string>) => {
      const line = typeof event.data === 'string' ? event.data : String(event.data);
      if (!this.pending) {
        return;
      }
      if (line.startsWith(this.pending.prefix) || line === this.pending.prefix) {
        const { resolve } = this.pending;
        this.pending = null;
        resolve(line);
      }
    };
    this.worker.onerror = (event) => {
      console.error(event.message);
    };
    await this.sendWait('uci', 'uciok');
    this.worker.postMessage('setoption name Skill Level value ' + String(this.skillLevel));
    await this.sendWait('isready', 'readyok');
    this.worker.postMessage('ucinewgame');
    this.ready = true;
  }

  public async go(fen: string): Promise<string> {
    if (!this.worker || !this.ready) {
      throw new Error('Stockfish is not ready');
    }
    this.worker.postMessage('position fen ' + fen);
    const line = await this.sendWait('go movetime 500', 'bestmove', MOVE_TIMEOUT_MS);
    const parts = line.trim().split(/\s+/);
    const uci = parts[1];
    if (!uci || uci === '(none)') {
      throw new Error('Stockfish returned no move');
    }
    return uci;
  }

  public dispose(): void {
    if (this.worker) {
      try {
        this.worker.postMessage('stop');
        this.worker.postMessage('quit');
      } catch {
        void 0;
      }
      this.worker.terminate();
      this.worker = null;
    }
    this.ready = false;
    this.pending = null;
  }

  private sendWait(
    command: string,
    prefix: string,
    timeoutMs: number = READY_TIMEOUT_MS
  ): Promise<string> {
    if (!this.worker) {
      return Promise.reject(new Error('Stockfish worker missing'));
    }
    return new Promise((resolve, reject) => {
      const timer = window.setTimeout(() => {
        this.pending = null;
        reject(new Error('Stockfish timed out waiting for ' + prefix));
      }, timeoutMs);
      this.pending = {
        prefix,
        resolve: (line: string) => {
          window.clearTimeout(timer);
          resolve(line);
        },
      };
      this.worker!.postMessage(command);
    });
  }
}
