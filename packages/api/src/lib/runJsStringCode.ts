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

  // 4. Run with a sync execution timeout (e.g., 2000ms)
  const script = new vm.Script(wrappedCode);
  return await script.runInContext(context, { timeout: 5000 });
}
