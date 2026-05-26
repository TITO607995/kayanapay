"use client";

import { useSearchParams } from "next/navigation";

export default function GamePage() {
  const searchParams = useSearchParams();
  const targetSku = searchParams.get("sku");

  // Di dalam useEffect fetch produk game:
  useEffect(() => {
    if (products.length > 0 && targetSku) {
      const selected = products.find(p => p.buyer_sku_code === targetSku);
      if (selected) {
        setChosenProduct(selected); // Otomatis terpilih
        // Opsional: Scroll ke element produknya
        document.getElementById(targetSku)?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [products, targetSku]);
}