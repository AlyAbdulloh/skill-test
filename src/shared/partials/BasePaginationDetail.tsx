import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface BasePaginationDetailProps {
  currentPage?: number;
  lastPages?: number;
  perPage?: number;
  perPageOptions?: number[];
  total?: number;
  delta?: number;
  onUpdatePage: (page: number) => void;
  onUpdatePerPage: (limit: number) => void;
}

export function BasePaginationDetail({
  currentPage = 1,
  lastPages = 1,
  perPage = 10,
  perPageOptions = [10, 25, 50, 100],
  total = 0,
  delta = 3,
  onUpdatePage,
  onUpdatePerPage,
}: BasePaginationDetailProps) {
  const displayedPages = useMemo(() => {
    const totalPages = lastPages || 1;
    const pages: (number | string)[] = [];

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  }, [currentPage, lastPages, delta]);

  const startEntry = total === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const endEntry = Math.min(currentPage * perPage, total);

  const changePage = (page: number | string) => {
    if (typeof page === "number" && page >= 1 && page <= lastPages) {
      onUpdatePage(page);
    }
  };

  return (
    <div className="w-full bg-white px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="flex flex-col sm:flex-row items-center gap-4 text-sm">
        <div className="flex items-center gap-2 text-slate-600">
          <span>Show</span>
          <select
            value={perPage}
            onChange={(e) => onUpdatePerPage(Number(e.target.value))}
            className="border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 text-slate-700 font-semibold bg-slate-50 cursor-pointer transition-all"
          >
            {perPageOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <span>entries</span>
        </div>
        <div className="text-slate-500 text-sm">
          Showing{" "}
          <span className="font-semibold text-slate-700">{startEntry}</span> to{" "}
          <span className="font-semibold text-slate-700">{endEntry}</span> of{" "}
          <span className="font-semibold text-slate-700">{total}</span> entries
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => changePage(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-sky-500" />
        </button>

        <div className="flex items-center gap-1.5">
          {displayedPages.map((page, index) => (
            <React.Fragment key={index}>
              {page !== "..." ? (
                <button
                  onClick={() => changePage(page)}
                  className={`min-w-[36px] h-9 px-2 flex items-center justify-center rounded-lg font-bold transition-all text-sm ${
                    currentPage === page
                      ? "bg-sky-500 text-white shadow-sm"
                      : "border border-slate-200 text-sky-600 hover:border-sky-300 hover:bg-sky-50"
                  }`}
                >
                  {page}
                </button>
              ) : (
                <span className="text-slate-400 px-1 font-bold">...</span>
              )}
            </React.Fragment>
          ))}
        </div>

        <button
          onClick={() => changePage(currentPage + 1)}
          disabled={currentPage === lastPages}
          className="p-2 rounded-lg border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-sky-500" />
        </button>
      </div>
    </div>
  );
}
