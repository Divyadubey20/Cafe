"use client";

import { useState, useEffect } from "react";
import { Plus, QrCode, Trash2, Printer, Download, Eye, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTables, createTable, updateTable, deleteTable } from "@/lib/api";
import type { Table } from "@/types";

interface TableData extends Table {}

export default function TablesManagement() {
  const [tables, setTables] = useState<TableData[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [capacity, setCapacity] = useState("4");
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Host detection for QR generation
  const [hostUrl, setHostUrl] = useState("http://localhost:3000");

  useEffect(() => {
    const loadTables = async () => {
      try {
        const list = await getTables();
        setTables(list);
      } catch (err) {
        console.error("Failed to load tables:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTables();

    if (typeof window !== "undefined") {
      setHostUrl(`${window.location.protocol}//${window.location.host}`);
    }
  }, []);

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableNumber) return;

    const num = parseInt(tableNumber, 10);
    if (isNaN(num)) return;

    if (tables.some((t) => t.tableNumber === num)) {
      alert(`Table ${num} already exists!`);
      return;
    }

    try {
      const newTable = await createTable({
        tableNumber: num,
        capacity: parseInt(capacity, 10) || 4,
        qrCode: `${hostUrl}/welcome?table=${num}`,
        isActive: true,
      });
      setTables((prev) => [...prev, newTable].sort((a, b) => a.tableNumber - b.tableNumber));
      setTableNumber("");
      setShowAddForm(false);
    } catch (err: any) {
      alert(err.message || "Failed to add table.");
    }
  };

  const handleDeleteTable = async (id: number) => {
    if (!confirm("Are you sure you want to delete this table? Orders mapped to this table may be affected.")) {
      return;
    }

    try {
      await deleteTable(id);
      setTables((prev) => prev.filter((t) => t.id !== id));
      if (selectedTable?.id === id) {
        setSelectedTable(null);
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete table.");
    }
  };

  const handleToggleActive = async (id: number) => {
    const target = tables.find((t) => t.id === id);
    if (!target) return;

    try {
      const updated = await updateTable(id, { isActive: !target.isActive });
      setTables((prev) => prev.map((t) => (t.id === id ? updated : t)));
      if (selectedTable?.id === id) {
        setSelectedTable(updated);
      }
    } catch (err: any) {
      alert(err.message || "Failed to update table status.");
    }
  };

  // Get QR URL for a table number
  const getTableUrl = (num: number) => {
    return `${hostUrl}/welcome?table=${num}`;
  };

  const getQrCodeApiUrl = (num: number) => {
    const url = getTableUrl(num);
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(url)}`;
  };

  // Trigger Print Window for QR Code
  const handlePrintQr = (table: TableData) => {
    const qrUrl = getQrCodeApiUrl(table.tableNumber);
    const tableUrl = getTableUrl(table.tableNumber);
    
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print the table QR Code.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR - Table ${table.tableNumber}</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              text-align: center;
              padding: 40px;
              color: #2D1810;
            }
            .card {
              max-width: 320px;
              margin: 0 auto;
              border: 2px border #F0E6DC;
              border-radius: 20px;
              padding: 30px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            }
            .logo {
              font-weight: 800;
              font-size: 24px;
              margin-bottom: 5px;
            }
            .tagline {
              font-size: 12px;
              color: #9B8577;
              margin-bottom: 25px;
            }
            .qr-img {
              width: 220px;
              height: 220px;
              margin: 0 auto 20px;
            }
            .pill {
              background: #FFF5EB;
              color: #D4880F;
              padding: 8px 16px;
              border-radius: 99px;
              font-weight: 700;
              display: inline-block;
              margin-bottom: 10px;
            }
            .instructions {
              font-size: 11px;
              color: #6B4F3A;
              line-height: 1.5;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="logo">Cafe</div>
            <div class="tagline">Delicious Food, Memorable Moments</div>
            <div class="pill">TABLE ${table.tableNumber}</div>
            <div>
              <img class="qr-img" src="${qrUrl}" alt="Table QR" />
            </div>
            <div class="instructions">
              Scan this QR code to view our digital menu and place an order directly from your table.
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#2D1810]">Tables & QR Generator</h1>
          <p className="text-sm font-semibold text-slate-400">Add restaurant tables and generate digital ordering QR codes.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 rounded-xl bg-[#E8981A] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#D4880F]"
        >
          <Plus className="h-4 w-4" />
          Add Table
        </button>
      </div>

      {/* Add Table form card */}
      {showAddForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm max-w-md">
          <h3 className="font-serif text-lg font-bold text-[#2D1810] mb-4">Create New Table</h3>
          <form onSubmit={handleAddTable} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Table Number</label>
              <input
                type="number"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="e.g. 13"
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-[#D4880F]"
                required
                min="1"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Seating Capacity</label>
              <select
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#D4880F]"
              >
                <option value="2">2 Seater</option>
                <option value="4">4 Seater</option>
                <option value="6">6 Seater</option>
                <option value="8">8 Seater</option>
              </select>
            </div>
            <div className="flex gap-3 justify-end mt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="rounded-xl bg-slate-200 hover:bg-slate-300 px-4 py-2.5 text-xs font-extrabold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#E8981A] hover:bg-[#D4880F] px-5 py-2.5 text-xs font-extrabold text-white"
              >
                Add Table
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid: Table list on left, selected QR overview on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Table List Cards */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-serif text-lg font-bold text-[#2D1810] mb-4">Existing Tables ({tables.length})</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tables.map((table) => (
              <div 
                key={table.id}
                onClick={() => setSelectedTable(table)}
                className={cn(
                  "rounded-xl border p-4 flex items-center justify-between shadow-sm cursor-pointer hover:border-[#D4880F] transition-all",
                  selectedTable?.id === table.id 
                    ? "border-[#D4880F] bg-[#FFF5EB]/30 ring-1 ring-[#D4880F]/10" 
                    : "border-slate-100 bg-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <QrCode className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800">Table {table.tableNumber}</h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{table.capacity} Seater</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Status Toggle indicator */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleActive(table.id);
                    }}
                    className={cn(
                      "rounded-lg px-2 py-1 text-[10px] font-extrabold uppercase border",
                      table.isActive 
                        ? "bg-emerald-50 border-emerald-300 text-emerald-600" 
                        : "bg-neutral-50 border-neutral-300 text-neutral-400"
                    )}
                  >
                    {table.isActive ? "Active" : "Inactive"}
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTable(table.id);
                    }}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Table QR Panel */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col items-center justify-center text-center self-start">
          {selectedTable ? (
            <div className="flex flex-col items-center w-full gap-4">
              <h3 className="font-serif text-lg font-bold text-[#2D1810]">Table {selectedTable.tableNumber} QR Code</h3>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Capacity: {selectedTable.capacity} Persons</span>
              
              {/* QR Image Frame */}
              <div className="relative border border-[#F0E6DC] p-3 rounded-2xl bg-white shadow-sm mt-2">
                <img
                  src={getQrCodeApiUrl(selectedTable.tableNumber)}
                  alt={`Table ${selectedTable.tableNumber} QR`}
                  className="h-44 w-44 object-contain"
                />
              </div>

              {/* URL String */}
              <div className="rounded-lg bg-slate-50 p-2 border border-slate-100 w-full text-left font-mono text-[9px] text-slate-400 break-all select-all">
                {getTableUrl(selectedTable.tableNumber)}
              </div>

              {/* Actions row */}
              <div className="grid grid-cols-2 gap-3 w-full mt-4">
                <button
                  onClick={() => handlePrintQr(selectedTable)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-[#F0E6DC] hover:bg-slate-50 py-2.5 px-3 font-bold text-xs text-slate-600 transition-all active:scale-95"
                >
                  <Printer className="h-4 w-4" />
                  Print Sign
                </button>
                <a
                  href={getQrCodeApiUrl(selectedTable.tableNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={`table-${selectedTable.tableNumber}-qr.png`}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-[#E8981A] hover:bg-[#D4880F] py-2.5 px-3 font-bold text-xs text-white transition-all active:scale-95 shadow-sm"
                >
                  <Download className="h-4 w-4" />
                  Get Image
                </a>
              </div>
            </div>
          ) : (
            <div className="py-12 text-slate-400 flex flex-col items-center justify-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-300">
                <QrCode className="h-8 w-8" />
              </div>
              <h4 className="font-extrabold text-slate-600">Select a Table</h4>
              <p className="text-xs max-w-[200px] leading-relaxed">
                Click any table card to view and print its dynamic digital ordering QR code.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
