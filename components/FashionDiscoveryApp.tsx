"use client";

import { ChangeEvent, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Camera, Check, Droplets, Filter, Search, Sparkles, UploadCloud } from "lucide-react";
import { categories, products, styles } from "@/data/products";
import { deltaE, matchScore, normalizeHex } from "@/lib/color";
import type { Category, RankedProduct, StyleTag } from "@/lib/types";
import { cn, formatCurrency, labelize } from "@/lib/utils";

type FilterValue<T extends string> = "all" | T;

const samplePalettes = [
  ["#C7B99D", "#F4F2E8", "#4C3128"],
  ["#1D2733", "#6A6F68", "#D6F13F"],
  ["#D9A5A0", "#E8DDCA", "#5E1F24"],
];

const quickColors = ["#C7B99D", "#1D2733", "#D6F13F", "#5E1F24", "#2157B8", "#F4F2E8"];

export function FashionDiscoveryApp() {
  const [hexInput, setHexInput] = useState("#BDA886");
  const [style, setStyle] = useState<FilterValue<StyleTag>>("all");
  const [category, setCategory] = useState<FilterValue<Category>>("all");
  const [keyword, setKeyword] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [analysisIndex, setAnalysisIndex] = useState(0);

  const activeHex = normalizeHex(hexInput) ?? "#BDA886";
  const activePalette = samplePalettes[analysisIndex];

  const rankedProducts = useMemo<RankedProduct[]>(() => {
    const query = keyword.trim().toLowerCase();

    return products
      .map((product) => {
        const distance = deltaE(activeHex, product.colorHex);

        return {
          ...product,
          delta: distance,
          matchScore: matchScore(distance),
        };
      })
      .filter((product) => style === "all" || product.styleTags.includes(style))
      .filter((product) => category === "all" || product.category === category)
      .filter((product) => {
        if (!query) return true;
        return [product.name, product.brand, product.category, product.material, ...product.styleTags]
          .join(" ")
          .toLowerCase()
          .includes(query);
      })
      .sort((a, b) => b.matchScore - a.matchScore || b.nicheScore - a.nicheScore);
  }, [activeHex, category, keyword, style]);

  const topMatch = rankedProducts[0];
  const nicheCount = rankedProducts.filter((product) => product.nicheScore >= 0.8).length;

  function handleHexChange(value: string) {
    setHexInput(value.startsWith("#") ? value : `#${value}`);
  }

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPreview(URL.createObjectURL(file));
    setAnalysisIndex((file.name.length + file.size) % samplePalettes.length);
    setStyle(file.name.toLowerCase().includes("sport") ? "sporty" : "minimalist");
    setCategory(file.type.includes("image") ? "outerwear" : "all");
    setHexInput(samplePalettes[(file.name.length + file.size) % samplePalettes.length][0]);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-paper text-ink">
      <section className="relative grid min-h-screen grid-rows-[auto_1fr] border-b border-ink/10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_74%_18%,rgba(215,255,69,0.55),transparent_28%),linear-gradient(115deg,rgba(21,21,17,0.07),transparent_42%)]" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-[46vw] min-w-[420px] bg-ink [clip-path:polygon(24%_0,100%_0,100%_100%,0_100%)]" />
        <div className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-ink text-paper">
              <Sparkles size={18} />
            </span>
            <div>
              <p className="font-display text-xl tracking-tight">Chromatique</p>
              <p className="text-xs uppercase tracking-[0.3em] text-ink/50">AI fashion discovery</p>
            </div>
          </div>
          <a className="hidden items-center gap-2 rounded-full border border-ink/20 px-4 py-2 text-sm font-semibold transition hover:bg-ink hover:text-paper sm:flex" href="#results">
            View matches <ArrowUpRight size={16} />
          </a>
        </div>

        <div className="relative z-10 grid items-end gap-10 px-5 pb-8 sm:px-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(430px,0.68fr)] lg:px-12 lg:pb-12">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl self-center py-10 lg:py-0"
          >
            <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper shadow-editorial">
              <Droplets size={16} /> Delta-E color search, style tags, niche brands
            </p>
            <h1 className="font-display text-[clamp(4.3rem,13vw,12rem)] font-black leading-[0.78] tracking-[-0.08em]">
              Find the exact shade.
            </h1>
            <p className="mt-7 max-w-2xl text-balance text-lg leading-8 text-ink/70 sm:text-xl">
              Upload a reference or search by hex. The MVP ranks products by Lab color distance, then tightens results by aesthetic, category, and niche-brand signal.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 22 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-[2rem] bg-paper p-4 shadow-editorial ring-1 ring-ink/10 sm:p-5"
          >
            <div className="grid overflow-hidden rounded-[1.55rem] bg-ink text-paper sm:grid-cols-[0.9fr_1.1fr]">
              <div className="min-h-[340px] bg-cover bg-center" style={{ backgroundImage: `url(${topMatch?.imageUrl ?? products[0].imageUrl})` }} />
              <div className="flex min-h-[340px] flex-col justify-between p-6">
                <div>
                  <p className="mb-4 text-xs uppercase tracking-[0.26em] text-paper/50">Best live match</p>
                  <h2 className="font-display text-4xl font-black leading-none tracking-tight">{topMatch?.name}</h2>
                  <p className="mt-3 text-paper/65">{topMatch?.brand} · {topMatch ? formatCurrency(topMatch.price) : ""}</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-end justify-between border-t border-paper/15 pt-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-paper/45">Match score</p>
                      <p className="font-display text-6xl font-black">{topMatch?.matchScore ?? 0}</p>
                    </div>
                    <div className="size-16 rounded-full border border-paper/30" style={{ backgroundColor: activeHex }} />
                  </div>
                  <p className="text-sm leading-6 text-paper/60">Runtime AI is avoided here: color math and filters stay fast, while Gemini can enrich uploads offline later.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="results" className="grid gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[390px_1fr] lg:px-12 lg:py-14">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55 }}
            className="space-y-7 rounded-[2rem] bg-ink p-5 text-paper shadow-editorial sm:p-6"
          >
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-paper/45">Search console</p>
                <h2 className="mt-2 font-display text-4xl font-black tracking-tight">Tune the brief</h2>
              </div>
              <Filter className="mt-1 text-acid" />
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-paper/70">Keyword, brand, material</span>
              <span className="flex items-center gap-3 rounded-full bg-paper/10 px-4 py-3 ring-1 ring-paper/10 focus-within:ring-acid">
                <Search size={18} className="text-paper/45" />
                <input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="linen, sneaker, old money..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-paper/35"
                />
              </span>
            </label>

            <div>
              <span className="mb-3 block text-sm font-semibold text-paper/70">Exact color</span>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={activeHex}
                  onChange={(event) => handleHexChange(event.target.value)}
                  className="h-12 w-16 cursor-pointer rounded-2xl border-0 bg-transparent p-0"
                  aria-label="Choose product search color"
                />
                <input
                  value={hexInput}
                  onChange={(event) => handleHexChange(event.target.value)}
                  className={cn(
                    "min-w-0 flex-1 rounded-2xl bg-paper px-4 font-mono text-sm uppercase text-ink outline-none ring-2 ring-transparent focus:ring-acid",
                    !normalizeHex(hexInput) && "ring-clay"
                  )}
                  aria-label="Hex color"
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {quickColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setHexInput(color)}
                    className="size-9 rounded-full border border-paper/20 transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-acid"
                    style={{ backgroundColor: color }}
                    aria-label={`Use ${color}`}
                  />
                ))}
              </div>
            </div>

            <FilterGroup title="Style" value={style} values={styles} onChange={setStyle} />
            <FilterGroup title="Category" value={category} values={categories} onChange={setCategory} />

            <label className="group block cursor-pointer rounded-[1.5rem] border border-dashed border-paper/30 p-4 transition hover:border-acid hover:bg-paper/5">
              <input className="sr-only" type="file" accept="image/*" onChange={handleUpload} />
              <span className="flex items-center gap-3 text-sm font-semibold text-paper/70">
                <UploadCloud size={19} className="text-acid" /> Upload reference image
              </span>
              <span className="mt-2 block text-xs leading-5 text-paper/45">Local preview plus mocked palette/category output. Gemini and Supabase Storage can replace this seam cleanly.</span>
            </label>
          </motion.div>
        </aside>

        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid gap-4 border-b border-ink/10 pb-8 md:grid-cols-[1fr_auto] md:items-end"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-ink/45">Live product listing</p>
              <h2 className="mt-2 font-display text-5xl font-black tracking-[-0.04em] sm:text-6xl">{rankedProducts.length} ranked matches</h2>
              <p className="mt-3 max-w-2xl text-ink/60">Sorted by Lab color distance first, then boosted by niche score so smaller brands do not disappear behind marketplaces.</p>
            </div>
            <div className="grid grid-cols-3 divide-x divide-ink/10 rounded-full border border-ink/10 bg-white/35 px-5 py-3 text-center backdrop-blur">
              <Metric label="Niche" value={nicheCount} />
              <Metric label="Styles" value={styles.length} />
              <Metric label="Avg" value={`${Math.round(rankedProducts.reduce((sum, item) => sum + item.matchScore, 0) / Math.max(rankedProducts.length, 1))}%`} />
            </div>
          </motion.div>

          <AnimatePresence mode="popLayout">
            {preview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden rounded-[2rem] bg-white/50 p-4 ring-1 ring-ink/10"
              >
                <div className="grid gap-4 md:grid-cols-[160px_1fr] md:items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element -- Object URLs from local uploads are not stable remote image sources. */}
                  <img src={preview} alt="Uploaded reference" className="aspect-square w-full rounded-[1.4rem] object-cover" />
                  <div>
                    <p className="mb-2 flex items-center gap-2 text-sm font-bold"><Camera size={16} /> Mock image analysis</p>
                    <div className="flex flex-wrap gap-2">
                      {activePalette.map((color) => (
                        <button key={color} onClick={() => setHexInput(color)} className="flex items-center gap-2 rounded-full bg-ink px-3 py-2 text-xs font-bold text-paper">
                          <span className="size-4 rounded-full" style={{ backgroundColor: color }} /> {color}
                        </button>
                      ))}
                      <span className="rounded-full bg-acid px-3 py-2 text-xs font-bold text-ink">style: {style}</span>
                      <span className="rounded-full bg-ink/10 px-3 py-2 text-xs font-bold text-ink">category: {category}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <ProductGrid products={rankedProducts} activeHex={activeHex} />
        </div>
      </section>
    </main>
  );
}

function FilterGroup<T extends string>({
  title,
  value,
  values,
  onChange,
}: {
  title: string;
  value: FilterValue<T>;
  values: readonly T[];
  onChange: (value: FilterValue<T>) => void;
}) {
  return (
    <div>
      <span className="mb-3 block text-sm font-semibold text-paper/70">{title}</span>
      <div className="flex flex-wrap gap-2">
        {["all", ...values].map((item) => (
          <button
            key={item}
            onClick={() => onChange(item as FilterValue<T>)}
            className={cn(
              "rounded-full px-3 py-2 text-xs font-bold transition",
              value === item ? "bg-acid text-ink" : "bg-paper/10 text-paper/60 hover:bg-paper/20 hover:text-paper"
            )}
          >
            {labelize(item)}
          </button>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="px-3">
      <p className="font-display text-2xl font-black">{value}</p>
      <p className="text-[0.65rem] uppercase tracking-[0.22em] text-ink/45">{label}</p>
    </div>
  );
}

function ProductGrid({ products: rankedProducts, activeHex }: { products: RankedProduct[]; activeHex: string }) {
  if (rankedProducts.length === 0) {
    return (
      <div className="grid min-h-[320px] place-items-center rounded-[2rem] border border-dashed border-ink/20 text-center">
        <div>
          <p className="font-display text-4xl font-black">No matches yet</p>
          <p className="mt-2 text-ink/55">Loosen filters or try another shade.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div layout className="grid gap-x-5 gap-y-9 sm:grid-cols-2 xl:grid-cols-3">
      {rankedProducts.map((product, index) => (
        <motion.article
          layout
          key={product.id}
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ delay: Math.min(index * 0.035, 0.2), duration: 0.45 }}
          className="group"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.8rem] bg-fog">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
              className="object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-paper/90 px-3 py-2 text-xs font-black text-ink backdrop-blur">
              <Check size={14} /> {product.matchScore}%
            </div>
            <div className="absolute bottom-3 right-3 flex rounded-full bg-ink p-1 shadow-editorial">
              <span className="size-8 rounded-full border border-paper/25" style={{ backgroundColor: activeHex }} />
              <span className="-ml-2 size-8 rounded-full border border-paper/25" style={{ backgroundColor: product.colorHex }} />
            </div>
          </div>
          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-ink/45">{product.brand}</p>
              <h3 className="mt-1 font-display text-2xl font-black leading-none tracking-tight">{product.name}</h3>
            </div>
            <p className="font-display text-2xl font-black">{formatCurrency(product.price)}</p>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className="rounded-full bg-ink px-3 py-1.5 text-paper">Delta {product.delta.toFixed(1)}</span>
            <span className="rounded-full bg-white/60 px-3 py-1.5 text-ink/65">{labelize(product.category)}</span>
            <span className="rounded-full bg-white/60 px-3 py-1.5 text-ink/65">Niche {Math.round(product.nicheScore * 100)}</span>
          </div>
          <a
            href={product.affiliateUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-black underline decoration-ink/20 underline-offset-4 transition hover:decoration-ink"
          >
            Affiliate preview <ArrowUpRight size={16} />
          </a>
        </motion.article>
      ))}
    </motion.div>
  );
}
