export function jsonToTypes(name: string, obj: any): string {
    const seen = new Map<string, string>();
  
    function parseType(name: string, value: any): string {
      if (value === null) return "any";
      if (Array.isArray(value)) {
        const itemType = value.length > 0 ? parseType(name + "Item", value[0]) : "any";
        return `${itemType}[]`;
      }
      if (typeof value === "object") {
        return parseObject(name, value);
      }
      return typeof value;
    }
  
    function parseObject(name: string, obj: any): string {
      if (seen.has(name)) return name;
  
      let output = `interface ${name} {\n`;
      for (const key in obj) {
        const type = parseType(capitalize(key), obj[key]);
        output += `  ${key}: ${type};\n`;
      }
      output += `}\n`;
      seen.set(name, output);
      return name;
    }
  
    function capitalize(s: string) {
      return s.charAt(0).toUpperCase() + s.slice(1);
    }
  
    parseType(name, obj);
    return [...seen.values()].reverse().join("\n");
  }
  