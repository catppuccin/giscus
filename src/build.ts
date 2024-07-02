import less from "npm:less";
import { join } from "std/path/mod.ts";
import { flavorEntries } from "npm:@catppuccin/palette@1.1.0";

const THEME_DIR = join(import.meta.dirname as string, "../themes/");

await Deno.remove(THEME_DIR, { recursive: true })
  .catch(() => {})
  .finally(() => Deno.mkdir(THEME_DIR));

for (const [flavor, { colorEntries }] of flavorEntries) {
  const src = await Deno.readTextFile(
    join(import.meta.dirname as string, "base.css")
  );

  const vars = {
    globalVars: {
      ...Object.fromEntries(colorEntries.map(([name, { hex }]) => [name, hex])),
      loader: false,
    },
  };

  const { css: noLoader } = await less.render(src, vars);
  await Deno.writeTextFile(
    join(THEME_DIR, flavor + "-no-loader.css"),
    noLoader
  );

  vars.globalVars.loader = true;
  const { css: withLoader } = await less.render(src, vars);
  await Deno.writeTextFile(join(THEME_DIR, flavor + ".css"), withLoader);
}
