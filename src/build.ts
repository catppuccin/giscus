import less from "npm:less";
import { join } from "std/path/mod.ts";
import { flavorEntries } from "npm:@catppuccin/palette@1.1.0";

const THEME_DIR = join(import.meta.dirname as string, "../themes/");
await Deno.remove(THEME_DIR).catch(() => {});
await Deno.mkdir(THEME_DIR);

for (const [flavor, { colorEntries }] of flavorEntries) {
  const { css } = await less.render(
    await Deno.readTextFile(join(import.meta.dirname as string, "base.css")),
    {
      globalVars: Object.fromEntries(
        colorEntries.map(([name, { hex }]) => [name, hex])
      ),
    }
  );
  await Deno.writeTextFile(
    join(import.meta.dirname as string, "../themes/", flavor + ".css"),
    css
  );
}
