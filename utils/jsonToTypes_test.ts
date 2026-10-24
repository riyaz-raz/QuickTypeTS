import { assertEquals, assertMatch, assertThrows } from "$std/assert/mod.ts";
import { jsonToTypes } from "./jsonToTypes.ts";

Deno.test("primitive, null, and empty array roots have usable aliases", () => {
  for (
    const [value, type] of [
      [42, "number"],
      ["hello", "string"],
      [true, "boolean"],
      [null, "null"],
      [[], "unknown[]"],
    ]
  ) {
    assertEquals(jsonToTypes("Root", value), `type Root = ${type};\n`);
  }
});

Deno.test("nested objects and every mixed array element retain their types", () => {
  const output = jsonToTypes("Root", {
    nested: { active: true },
    values: [1, "two", null, { id: 1 }, { label: "three" }, [false]],
    empty: [],
  });
  assertMatch(output, /"nested": Nested;/);
  assertMatch(output, /"active": boolean;/);
  assertMatch(
    output,
    /"values": \(number \| string \| null \| ValuesItem \| ValuesItem2 \| \(boolean\)\[\]\)\[\];/,
  );
  assertMatch(output, /"id": number;/);
  assertMatch(output, /"label": string;/);
  assertMatch(output, /"empty": unknown\[\];/);
});

Deno.test("property names are escaped and interface identifiers cannot collide", () => {
  const output = jsonToTypes("123 invalid", {
    "a-b": { value: 1 },
    a_b: { value: "text" },
    "": { 'quote"\n\\': null },
    child: { child: { value: true } },
  });
  assertMatch(output, /interface Type123_invalid/);
  assertMatch(output, /"a-b": A_b;/);
  assertMatch(output, /"a_b": A_b2;/);
  assertMatch(output, /"": Type;/);
  assertMatch(output, /"child": Child2;/);
  assertEquals(output.includes(`${JSON.stringify('quote"\n\\')}: null;`), true);
  assertThrows(() => jsonToTypes("Root", undefined), TypeError);
});

Deno.test("generated declarations type-check and accept every observed shape", async () => {
  const samples: unknown[] = [
    42,
    "hello",
    false,
    null,
    [],
    {},
    [1, "two", null, { id: 1 }, { label: "three" }, [true]],
    {
      "a-b": { value: 1 },
      a_b: { value: "text" },
      "123": { 'quote"\n\\': null },
      child: { child: { value: true } },
      nested: { empty: [], nullable: null },
    },
  ];
  const directory = await Deno.makeTempDir();
  try {
    const path = `${directory}/declarations.ts`;
    const source = samples.map((sample, index) => {
      const name = `Sample${index}`;
      return "{\n" + jsonToTypes(name, sample) +
        `const sample${index}: ${name} = ${JSON.stringify(sample)};\n}\n`;
    }).join("\n");
    await Deno.writeTextFile(path, source);
    const result = await new Deno.Command(Deno.execPath(), {
      args: ["check", "--no-config", "--no-lock", path],
      stdout: "piped",
      stderr: "piped",
    }).output();
    assertEquals(result.code, 0, new TextDecoder().decode(result.stderr));
  } finally {
    await Deno.remove(directory, { recursive: true });
  }
});
