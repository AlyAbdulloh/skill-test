import React, { useState, useMemo } from "react";
import { Inbox } from "lucide-react";
import { BasePaginationDetail } from "./BasePaginationDetail";

export interface TableHeader {
  key: string;
  label: string;
  sortable?: boolean;
  class?: string;
  cellClass?: string;
  isBadge?: boolean;
}

export interface BaseTableWithPaginationProps {
  headers: TableHeader[];
  items: any[];
  collapsible?: boolean;
  loading?: boolean;
  usePagination?: boolean;
  currentPage?: number;
  lastPages?: number;
  perPage?: number;
  total?: number;
  perPageOptions?: number[];
  sortBy?: string;
  sortDir?: "asc" | "desc";
  onUpdatePage?: (page: number) => void;
  onUpdatePerPage?: (limit: number) => void;
  onSort?: (sortData: { sortBy: string; sortDir: "asc" | "desc" }) => void;
  onRowClick?: (item: any) => void;
  renderCell?: (
    header: TableHeader,
    item: any,
    index: number,
  ) => React.ReactNode;
}

const mainKeys = ["case_id", "region", "store", "pic", "status_case"];

export function BaseTableWithPagination({
  headers,
  items,
  collapsible = false,
  loading = false,
  usePagination = false,
  currentPage = 1,
  lastPages = 1,
  perPage = 10,
  total = 0,
  perPageOptions = [10, 25, 50, 100],
  sortBy = "",
  sortDir = "desc",
  onUpdatePage,
  onUpdatePerPage,
  onSort,
  onRowClick,
  renderCell,
}: BaseTableWithPaginationProps) {
  const [expandedRows, setExpandedRows] = useState<number[]>([]);

  const handleSort = (key: string) => {
    if (!onSort) return;
    let newDir: "asc" | "desc" = "asc";
    if (sortBy === key) {
      newDir = sortDir === "asc" ? "desc" : "asc";
    }
    onSort({ sortBy: key, sortDir: newDir });
  };

  const toggleRow = (index: number) => {
    setExpandedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const visibleHeaders = useMemo(() => {
    if (!collapsible) return headers;
    const matched = headers.filter((h) => mainKeys.includes(h.key));
    if (matched.length > 0) return matched;
    const fallbackCount = Math.min(5, headers.length);
    return headers.slice(0, fallbackCount);
  }, [headers, collapsible]);

  const hiddenHeaders = useMemo(() => {
    if (!collapsible) return [];
    return headers.filter((h) => !visibleHeaders.some((v) => v.key === h.key));
  }, [headers, visibleHeaders, collapsible]);

  const getBadgeClass = (value: any) => {
    if (!value) return "";
    const status = String(value).toLowerCase().trim();
    const successStatus = [
      "on target",
      "success",
      "lunas",
      "aktif",
      "done",
      "completed",
    ];
    const warningStatus = [
      "mendekati target",
      "warning",
      "pending",
      "proses",
      "on progress",
    ];
    const dangerStatus = [
      "below target",
      "danger",
      "failed",
      "gagal",
      "non-aktif",
      "cancel",
    ];

    if (successStatus.includes(status))
      return "bg-emerald-100 text-emerald-600";
    if (warningStatus.includes(status)) return "bg-orange-100 text-orange-600";
    if (dangerStatus.includes(status)) return "bg-rose-100 text-rose-600";
    return "bg-slate-100 text-slate-600";
  };

  return (
    <div className="w-full flex flex-col flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="w-full flex-1 overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-0 min-w-[320px]">
          <thead className="bg-slate-50">
            <tr>
              {collapsible && (
                <th className="w-12 px-4 py-3.5 border-b border-slate-200 bg-slate-50 sticky top-0 z-10" />
              )}
              {visibleHeaders.map((header, index) => (
                <th
                  key={index}
                  onClick={() =>
                    header.sortable ? handleSort(header.key) : null
                  }
                  className={`px-6 py-4 text-xs font-semibold text-slate-600 tracking-wider whitespace-nowrap bg-slate-50 border-b border-slate-200 sticky top-0 z-10 ${
                    header.class || ""
                  } ${header.sortable ? "cursor-pointer hover:bg-slate-100 transition-colors" : ""}`}
                >
                  <div className="flex items-center gap-1.5">
                    {header.label}
                    {header.sortable && (
                      <div className="flex flex-col text-[8px] text-slate-400">
                        <span
                          className={
                            sortBy === header.key && sortDir === "asc"
                              ? "text-sky-500 font-bold"
                              : ""
                          }
                        >
                          ▲
                        </span>
                        <span
                          className={
                            sortBy === header.key && sortDir === "desc"
                              ? "text-sky-500 font-bold"
                              : ""
                          }
                        >
                          ▼
                        </span>
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {loading ? (
            <tbody className="divide-y divide-slate-100">
              {Array.from({ length: 5 }).map((_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`}>
                  {collapsible && (
                    <td className="px-4 py-4 text-center">
                      <div className="w-5 h-5 bg-slate-200 rounded animate-pulse mx-auto" />
                    </td>
                  )}
                  {visibleHeaders.map((header, colIndex) => (
                    <td key={`skeleton-col-${colIndex}`} className="px-6 py-4">
                      <div
                        className={`h-4 bg-slate-200 rounded animate-pulse ${
                          header.isBadge ? "w-16 rounded-full" : "w-3/4"
                        }`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ) : items && items.length > 0 ? (
            <tbody className="divide-y divide-slate-100 bg-white">
              {items.map((item, rowIndex) => (
                <React.Fragment key={rowIndex}>
                  <tr
                    onClick={(e) => {
                      e.stopPropagation();
                      onRowClick?.(item);
                    }}
                    className="group hover:bg-slate-50/70 transition-colors duration-150 cursor-pointer"
                  >
                    {collapsible && (
                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRow(rowIndex);
                          }}
                          className="w-5 h-5 inline-flex items-center justify-center rounded border border-slate-200 text-slate-500 hover:text-sky-600 hover:border-sky-300 font-bold text-xs bg-white shadow-sm focus:outline-none transition-colors"
                        >
                          {expandedRows.includes(rowIndex) ? "−" : "+"}
                        </button>
                      </td>
                    )}
                    {visibleHeaders.map((header, colIndex) => (
                      <td
                        key={colIndex}
                        className={`px-6 py-4 text-sm text-slate-700 whitespace-nowrap ${header.cellClass || ""}`}
                      >
                        {renderCell ? (
                          renderCell(header, item, rowIndex)
                        ) : (
                          <>
                            {header.isBadge && item[header.key] ? (
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getBadgeClass(
                                  item[header.key],
                                )}`}
                              >
                                {item[header.key]}
                              </span>
                            ) : typeof item[header.key] === "boolean" ? (
                              <div className="flex items-center">
                                {item[header.key] ? (
                                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                                    ✓
                                  </span>
                                ) : (
                                  <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                                    ✕
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span>{item[header.key]}</span>
                            )}
                          </>
                        )}
                      </td>
                    ))}
                  </tr>

                  {collapsible && expandedRows.includes(rowIndex) && (
                    <tr className="bg-slate-50/60">
                      <td
                        colSpan={visibleHeaders.length + 1}
                        className="px-8 py-5 border-b border-slate-100"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                          {hiddenHeaders.map((hiddenHeader) => (
                            <div
                              key={hiddenHeader.key}
                              className="flex flex-col space-y-1.5"
                            >
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                {hiddenHeader.label}
                              </span>
                              <div className="text-sm text-slate-700 font-medium">
                                {renderCell
                                  ? renderCell(hiddenHeader, item, rowIndex)
                                  : item[hiddenHeader.key] || "-"}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          ) : (
            <tbody>
              <tr>
                <td
                  colSpan={headers.length + (collapsible ? 1 : 0)}
                  className="py-20"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-4 bg-slate-50 rounded-full">
                      <Inbox className="w-8 h-8 text-slate-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-base font-medium text-slate-700">
                        Tidak ada data
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        Belum ada data yang bisa ditampilkan saat ini.
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          )}
        </table>
      </div>

      {usePagination && onUpdatePage && onUpdatePerPage && (
        <div className="border-t border-slate-200 bg-slate-50">
          <BasePaginationDetail
            currentPage={currentPage}
            lastPages={lastPages}
            perPage={perPage}
            perPageOptions={perPageOptions}
            total={total}
            onUpdatePage={onUpdatePage}
            onUpdatePerPage={onUpdatePerPage}
          />
        </div>
      )}
    </div>
  );
}
