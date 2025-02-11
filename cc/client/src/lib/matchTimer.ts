export class MatchTimer {
  private timeRemaining: number;
  private isRunning: boolean;
  private timer: NodeJS.Timeout | null;
  private onTick: (timeRemaining: number) => void;
  private onComplete: () => void;

  constructor(initialTime: number, onTick: (timeRemaining: number) => void, onComplete: () => void) {
    this.timeRemaining = initialTime;
    this.isRunning = false;
    this.timer = null;
    this.onTick = onTick;
    this.onComplete = onComplete;
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.timer = setInterval(() => this.tick(), 1000);
    }
  }

  pause() {
    if (this.isRunning) {
      this.isRunning = false;
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    }
  }

  reset(newTime: number = 600) {
    this.timeRemaining = newTime;
    this.pause();
    this.onTick(this.timeRemaining);
  }

  private tick() {
    if (this.timeRemaining > 0) {
      this.timeRemaining--;
      this.onTick(this.timeRemaining);
    } else {
      this.complete();
    }
  }

  private complete() {
    this.pause();
    this.onComplete();
  }

  getTimeRemaining() {
    return this.timeRemaining;
  }
}
