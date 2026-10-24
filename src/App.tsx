import { useState } from "react";
import { jsonToTypes } from "./utils/jsonToTypes.ts";

export default function App() {
  const [jsonInput, setJsonInput] = useState("");
  const [tsOutput, setTsOutput] = useState("");

  function convertJsonToTS() {
    try {
      const obj = JSON.parse(jsonInput);
      const ts = jsonToTypes("Root", obj);
      setTsOutput(ts);
    } catch {
      setTsOutput("// Invalid JSON");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">JSON ➡ TypeScript Converter</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <textarea
          placeholder="Paste JSON here..."
          className="w-full p-3 border rounded-md font-mono text-sm h-96"
          value={jsonInput}
          onInput={(e) => setJsonInput((e.target as HTMLTextAreaElement).value)}
        />
        <textarea
          placeholder="TypeScript output..."
          className="w-full p-3 border rounded-md font-mono text-sm h-96 bg-gray-100"
          value={tsOutput}
          readOnly
        />
      </div>
      <div className="text-center mt-4">
        <button
          type="button"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          onClick={convertJsonToTS}
        >
          Convert
        </button>
      </div>
    </div>
  );
}
