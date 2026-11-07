import vm from "node:vm";

export async function runPersonalScript(userCode: string, data: any) {
  // 1. Define only what the script is allowed to see
  const sandbox = {
    fetch: globalThis.fetch, // Pass native fetch
    console: { log: console.log, error: console.error },
    setTimeout,
    clearTimeout,
    data,
  };

  // 2. Turn sandbox object into a VM context
  const context = vm.createContext(sandbox);

  // 3. Wrap script in an async IIFE to support top-level await/fetch
  const wrappedCode = `(async () => { ${userCode} })()`;

  // 4. The vm timeout only covers sync execution, so race the whole async run against the same 5s
  const TIMEOUT_MS = 5000;
  const script = new vm.Script(wrappedCode);
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`Script timed out after ${TIMEOUT_MS}ms`)),
      TIMEOUT_MS,
    );
  });
  try {
    return await Promise.race([
      script.runInContext(context, { timeout: TIMEOUT_MS }),
      timeout,
    ]);
  } finally {
    clearTimeout(timer);
  }
}
