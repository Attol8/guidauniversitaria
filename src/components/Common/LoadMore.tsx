// src/components/Common/LoadMore.tsx
"use client";

import { useRef } from "react";

interface LoadMoreProps {
  onLoadMore: () => void;
  isLoading: boolean;
  hasMore: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function LoadMore({
  onLoadMore,
  isLoading,
  hasMore,
  className = "",
  children,
}: LoadMoreProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    if (isLoading || !hasMore) return;
    onLoadMore();
  };

  if (!hasMore) {
    return (
      <div className={`flex justify-center text-gray-500 ${className}`}>
        <p>Tutti i risultati caricati</p>
      </div>
    );
  }

  return (
    <div className={`flex justify-center ${className}`}>
      <button
        ref={buttonRef}
        onClick={handleClick}
        disabled={isLoading || !hasMore}
        className="btn btn-primary"
        aria-live="polite"
        aria-describedby="load-more-status"
      >
        {children || (isLoading ? "Caricamento..." : "Carica altri")}
      </button>
      <div
        id="load-more-status"
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {isLoading ? "Caricamento in corso" : hasMore ? "Pronto per caricare più risultati" : "Tutti i risultati caricati"}
      </div>
    </div>
  );
}