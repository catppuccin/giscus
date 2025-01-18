import less from "npm:less";
import { join } from "std/path/mod.ts";
import { flavorEntries } from "npm:@catppuccin/palette@1.1.0";

const SRC_DIR = import.meta.dirname as string;
const DIST_DIR = join(SRC_DIR, "../dist/");
const DIST_THEME_DIR = join(DIST_DIR, "themes/");
const DIST_ASSET_DIR = join(DIST_DIR, "assets/");
const DEFAULT_ACCENT = "mauve";

await Deno.remove(DIST_DIR, { recursive: true })
  .catch(() => {})
  .finally(() => Deno.mkdir(DIST_THEME_DIR, { recursive: true }));

const base = await Deno.readTextFile(join(SRC_DIR, "base.less"));

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
      join(DIST_THEME_DIR, `${flavor}-${accent}-no-loader.css`),
      noLoader
    );
    await Deno.writeTextFile(
      join(DIST_THEME_DIR, `${flavor}-${accent}.css`),
      withLoader
    );

    if (accent === DEFAULT_ACCENT) {
      await Deno.writeTextFile(
        join(DIST_THEME_DIR, flavor + "-no-loader.css"),
        noLoader
      );
      await Deno.writeTextFile(
        join(DIST_THEME_DIR, flavor + ".css"),
        withLoader
      );
    }
  }
}

await Deno.mkdir(DIST_ASSET_DIR);

const SRC_ASSET_DIR = join(SRC_DIR, "assets/");
for await (const entry of Deno.readDir(SRC_ASSET_DIR)) {
  await Deno.copyFile(
    join(SRC_ASSET_DIR, entry.name),
    join(DIST_ASSET_DIR, entry.name)
  );
}
