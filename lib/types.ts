export type StyleTag = "old_money" | "streetwear" | "minimalist" | "sporty";

export type Category = "outerwear" | "shirt" | "pants" | "dress" | "shoes" | "bag";

export type Product = {
  id: string;
  name: string;
  brand: string;
  source: "awin" | "curated" | "crawler";
  nicheScore: number;
  imageUrl: string;
  price: number;
  category: Category;
  styleTags: StyleTag[];
  colorHex: string;
  affiliateUrl: string;
  material: string;
};

export type RankedProduct = Product & {
  delta: number;
  matchScore: number;
};
