# Country flag SVGs

4x3 flag SVGs vendored from lipis/flag-icons (https://github.com/lipis/flag-icons),
MIT licensed (see LICENSE in this directory). Consumed by
src/components/player/CountryFlag.astro via import.meta.glob; to support a new
country, drop its lowercase ISO 3166-1 alpha-2 `<code>.svg` here. Codes without
an SVG fall back to the emoji flag (which Windows renders as letter pairs).
