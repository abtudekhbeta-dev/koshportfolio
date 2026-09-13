import { createContext, useContext, type ReactNode } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import type { Book, Portfolio } from "@/lib/kosh/types";

type Ctx = {
  portfolio: Portfolio;
  query: UseQueryResult<Book, Error>;
};

const BookCtx = createContext<Ctx | null>(null);

export function BookProvider({
  portfolio,
  query,
  children,
}: {
  portfolio: Portfolio;
  query: UseQueryResult<Book, Error>;
  children: ReactNode;
}) {
  return <BookCtx.Provider value={{ portfolio, query }}>{children}</BookCtx.Provider>;
}

export function useBookCtx() {
  const v = useContext(BookCtx);
  if (!v) throw new Error("BookProvider missing");
  return v;
}
