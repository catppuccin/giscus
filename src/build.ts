import less from "npm:less";
import { join } from "std/path/mod.ts";
import { flavorEntries } from "npm:@catppuccin/palette@1.1.0";

const THEME_DIR = join(import.meta.dirname as string, "../themes/");
const DEFAULT_ACCENT = "mauve";

await Deno.remove(THEME_DIR, { recursive: true })
  .catch(() => {})
  .finally(() => Deno.mkdir(THEME_DIR));

const base = await Deno.readTextFile(
  join(import.meta.dirname as string, "base.less")
);

for (const [flavor, { colorEntries }] of flavorEntries) {
  for (const [accent, { hex }] of colorEntries.filter(
    ([_, { accent }]) => accent
  )) {
    const vars = {
      globalVars: {
        ...Object.fromEntries(
          colorEntries.map(([name, { hex }]) => [name, hex])
        ),
        accent: hex,
        loader: false,
      },
    };

    const { css: noLoader } = await less.render(base, vars);
    vars.globalVars.loader = true;
    const { css: withLoader } = await less.render(base, vars);

    await Deno.writeTextFile(
      join(THEME_DIR, `${flavor}-${accent}-no-loader.css`),
      noLoader
    );
    await Deno.writeTextFile(
      join(THEME_DIR, `${flavor}-${accent}.css`),
      withLoader
    );

    if (accent === DEFAULT_ACCENT) {
      await Deno.writeTextFile(
        join(THEME_DIR, flavor + "-no-loader.css"),
        noLoader
      );
      await Deno.writeTextFile(join(THEME_DIR, flavor + ".css"), withLoader);
    }
  }
}
