export function generateFake<T>(type: string, obj: T) {
  console.debug(`Generating fake ${type}: ${JSON.stringify(obj, null, 2)}`);

  return obj;
}

export function fakeArray<T>(num: number, fn: () => T): T[] {
  return new Array(num).fill({}).map(fn);
}
