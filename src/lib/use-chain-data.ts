import { useEffect, useState } from "react";
import { fetchAllProducts, fetchHistory, friendlyError, type HistoryEntry, type Product } from "./blockchain";
import { useBlockchain } from "./blockchain-context";

/** Loads all products + event history from the chain; reloads after every confirmed tx. */
export function useChainData() {
  const { refreshKey, configured } = useBlockchain();
  const [products, setProducts] = useState<Product[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      setError("Contract not deployed yet. Run the deploy script (see About page).");
      return;
    }
    let alive = true;
    setLoading(true);
    Promise.all([fetchAllProducts(), fetchHistory()])
      .then(([p, h]) => {
        if (!alive) return;
        setProducts(p);
        setHistory(h);
        setError(null);
      })
      .catch((e) => alive && setError(friendlyError(e)))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [refreshKey, configured]);

  return { products, history, loading, error };
}
