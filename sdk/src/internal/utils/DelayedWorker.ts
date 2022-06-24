export type DelayedWorker = {
  doDelayed: (delayMs: number, action: () => Promise<void>, ignoreExistingJob?: boolean) => void;

  doImmediately: (action: () => Promise<void>) => void;

  cancel: () => void;

  isInProgress: () => boolean;
};

export class DelayedWorkerImpl implements DelayedWorker {
  private timeoutId: any | undefined; // timeout type differs for different engines

  doDelayed(delayMs: number, action: () => Promise<void>, ignoreExistingJob: boolean = false): void {
    if (ignoreExistingJob && this.isInProgress()) {
      this.cancel();
    }

    if (!this.isInProgress()) {
      this.timeoutId = setTimeout(async () => {
        try {
          await action();
        } finally {
          this.timeoutId = undefined;
        }
      }, delayMs);
    }
  }

  doImmediately(action: () => Promise<void>): void {
    this.cancel();
    action().then(() => {/* do nothing */});
  }

  cancel(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
  }

  isInProgress(): boolean {
    return !!this.timeoutId;
  }
}
