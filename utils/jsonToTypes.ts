/** Infer declarations from a JSON value, retaining every observed array shape. */
export function jsonToTypes(name: string, value: unknown): string {
  const declarations: string[] = [];
  const names = new Set<string>();

  function identifier(candidate: string): string {
    const cleaned = candidate.replace(/[^a-zA-Z0-9_$]/g, "_");
    const capitalized = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    const base = /^[a-zA-Z_$]/.test(capitalized)
      ? capitalized
      : `Type${capitalized}`;
    let result = base;
    let suffix = 2;
    while (names.has(result)) result = `${base}${suffix++}`;
    names.add(result);
    return result;
  }

  function objectDeclaration(typeName: string, obj: object): string {
    const fields = Object.entries(obj).map(([key, item]) => {
      const type = infer(key, item);
      return `  ${JSON.stringify(key)}: ${type};`;
    });
    declarations.push(`interface ${typeName} {\n${fields.join("\n")}\n}`);
    return typeName;
  }

  function infer(hint: string, item: unknown): string {
    if (item === null) return "null";
    if (Array.isArray(item)) {
      const types = [
        ...new Set(item.map((entry: unknown) => infer(`${hint}Item`, entry))),
      ];
      return types.length === 0 ? "unknown[]" : `(${types.join(" | ")})[]`;
    }
    if (typeof item === "object") {
      return objectDeclaration(identifier(hint), item);
    }
    if (
      typeof item === "string" || typeof item === "number" ||
      typeof item === "boolean"
    ) return typeof item;
    throw new TypeError("Expected a JSON value");
  }

  const rootName = identifier(name);
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    objectDeclaration(rootName, value);
  } else {
    const type = infer(rootName, value);
    declarations.push(`type ${rootName} = ${type};`);
  }
  return declarations.reverse().join("\n\n") + "\n";
}
