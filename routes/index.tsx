import { h } from "preact";
import { useState } from "preact/hooks";
import { jsonToTypes } from "../utils/jsonToTypes.ts";

export default function Home() {
  const [jsonInput, setJsonInput] = useState("");
  const [tsOutput, setTsOutput] = useState("");

  function convertJsonToTS() {
    try {
      const obj = JSON.parse(jsonInput);
      const ts = jsonToTypes("Root", obj);
      setTsOutput(ts);
    } catch (e) {
      setTsOutput("// Invalid JSON");
    }
  }

  return (
    <div class="min-h-screen bg-gray-50 p-4">
      <h1 class="text-2xl font-bold mb-4 text-center">JSON ➡ TypeScript Converter</h1>
      <div class="grid md:grid-cols-2 gap-4">
        <textarea
          placeholder="Paste JSON here..."
          class="w-full p-3 border rounded-md font-mono text-sm h-96"
          value={jsonInput}
          onInput={(e) => setJsonInput((e.target as HTMLTextAreaElement).value)}
        />
        <textarea
          placeholder="TypeScript output..."
          class="w-full p-3 border rounded-md font-mono text-sm h-96 bg-gray-100"
          value={tsOutput}
          readOnly
        />
      </div>
      <div class="text-center mt-4">
        <button
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          onClick={convertJsonToTS}
        >
          Convert
        </button>
      </div>
    </div>
  );
}
