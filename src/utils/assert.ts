export function assertNonNull<T>(
  obj: T,
  name = "obj",
): asserts obj is NonNullable<T> {
  if (obj == null) {
    throw new Error(`Expected "${name}" to be defined, but received ${obj}`);
  }
}
