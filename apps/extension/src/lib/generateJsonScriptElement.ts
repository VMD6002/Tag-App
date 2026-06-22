export function generateJsonScriptElement(id: string, data: Record<string, any>) {
    const scriptElement = document.createElement("script");
    scriptElement.type = "application/json";
    scriptElement.id = id;
    scriptElement.style.display = "none";
    scriptElement.textContent = JSON.stringify(data);
    return scriptElement
}