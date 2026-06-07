/**
 * Serialize a value as JSON-LD that is safe to inject via `set:html`.
 *
 * Some values that reach the JSON-LD blocks are Liquipedia-sourced (player
 * handles, real names, opponent + tournament names) and so are not fully
 * trusted. JSON.stringify leaves `<` intact, so a value containing `</script>`
 * could close the script element early and inject markup. Escaping `<`, `>`,
 * `&` to their \uXXXX forms keeps the output valid JSON (parsers read the
 * escapes transparently) while making a script-context breakout impossible.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/[<>&]/g, (c) => '\\u00' + c.charCodeAt(0).toString(16));
}
