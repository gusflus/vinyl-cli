import { SingleBar } from "cli-progress";

export const bar = (title: string) =>
  new SingleBar({
    format: title + " [{bar}] {percentage}% | {value}/{total}",
    hideCursor: true,
    stopOnComplete: true,
  });
