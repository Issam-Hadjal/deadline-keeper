// The feature's public surface: the dashboard imports its classes, counters and
// labels from here, not from the modules one by one.
export { classifyDeadline, countByBucket, type DeadlineBucket } from "./buckets";
export { formatFrenchDate } from "./format";
export { relativeDelayLabel } from "./relative";
