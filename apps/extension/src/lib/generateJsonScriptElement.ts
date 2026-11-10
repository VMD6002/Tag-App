export function generateJsonScriptElement(id: string, data: unknown) {
  const scriptElement = document.createElement("script");
  scriptElement.type = "application/json";
  scriptElement.id = id;
  scriptElement.style.display = "none";
  scriptElement.textContent = JSON.stringify(data);
  return scriptElement;
}
