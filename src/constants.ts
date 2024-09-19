import { SingleBar } from "cli-progress";

export const bar = (title: string) =>
  new SingleBar({
    format: title + " [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}",
    hideCursor: true,
    stopOnComplete: true,
  });
