import React, { useRef, useState } from "react";
import { X, Upload, Check } from "lucide-react";
import { flashCardsApi } from "../../api/flashcards";
import "./CsvImportModal.css";

interface Category {
  id: string;
  title: string;
}

interface ParsedRow {
  question: string;
  answer: string;
  categoryTitle?: string;
}

interface Props {
  categories: Category[];
  onClose: () => void;
  onImported: () => void;
}

function parseCsv(text: string): ParsedRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length === 0) return [];

  // Detect if first line is a header (contains "question" or "pregunta")
  const firstLower = lines[0].toLowerCase();
  const hasHeader =
    firstLower.includes("question") ||
    firstLower.includes("pregunta") ||
    firstLower.includes("answer") ||
    firstLower.includes("respuesta");

  const dataLines = hasHeader ? lines.slice(1) : lines;

  return dataLines
    .map((line) => {
      // Simple CSV split respecting double-quoted fields
      const cols = splitCsvLine(line);
      const question = (cols[0] || "").trim();
      const answer = (cols[1] || "").trim();
      const categoryTitle = (cols[2] || "").trim() || undefined;
      return { question, answer, categoryTitle };
    })
    .filter((r) => r.question && r.answer);
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

const CsvImportModal: React.FC<Props> = ({
  categories,
  onClose,
  onImported,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [defaultCategoryId, setDefaultCategoryId] = useState<string>(
    categories[0]?.id || "",
  );
  const [parseError, setParseError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      setParseError("Por favor selecciona un archivo .csv");
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = parseCsv(text);
        if (parsed.length === 0) {
          setParseError("No se encontraron filas válidas en el archivo.");
          setRows([]);
          return;
        }
        setRows(parsed);
        setParseError(null);
      } catch {
        setParseError("Error al leer el archivo.");
      }
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleImport = async () => {
    if (rows.length === 0 || !defaultCategoryId) return;
    setImporting(true);
    setImportError(null);
    try {
      const flashcards = rows.map((r) => {
        // If a categoryTitle is provided in CSV, try to match by name
        const matchedCat = r.categoryTitle
          ? categories.find(
              (c) => c.title.toLowerCase() === r.categoryTitle!.toLowerCase(),
            )
          : null;
        return {
          question: r.question,
          answer: r.answer,
          categoryId: matchedCat?.id || defaultCategoryId,
        };
      });
      await flashCardsApi.createManualFlashCards(flashcards);
      onImported();
      onClose();
    } catch (err: any) {
      setImportError(err?.response?.data?.error || "Error al importar.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div
      className="csv-modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="csv-modal">
        <div className="csv-modal-header">
          <h2 className="csv-modal-title">Importar desde CSV</h2>
          <button
            className="csv-modal-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="csv-modal-body">
          <p className="csv-hint">
            Formato esperado: <code>pregunta, respuesta, tema (opcional)</code>.
            La primera fila puede ser cabecera.
          </p>

          {/* Drop zone */}
          <div
            className="csv-drop-zone"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
          >
            <Upload size={24} className="csv-drop-icon" />
            <span className="csv-drop-text">
              {fileName
                ? fileName
                : "Arrastra un archivo CSV o haz clic para seleccionar"}
            </span>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </div>

          {parseError && <p className="csv-parse-error">{parseError}</p>}

          {rows.length > 0 && (
            <>
              <p className="csv-count">{rows.length} tarjetas detectadas</p>

              <div className="csv-category-row">
                <label className="csv-label" htmlFor="csv-cat">
                  Tema por defecto
                </label>
                <select
                  id="csv-cat"
                  className="csv-select"
                  value={defaultCategoryId}
                  onChange={(e) => setDefaultCategoryId(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="csv-preview">
                <table className="csv-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Pregunta</th>
                      <th>Respuesta</th>
                      <th>Tema CSV</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 10).map((r, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{r.question}</td>
                        <td>{r.answer}</td>
                        <td>{r.categoryTitle || "—"}</td>
                      </tr>
                    ))}
                    {rows.length > 10 && (
                      <tr>
                        <td colSpan={4} className="csv-more">
                          … y {rows.length - 10} más
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {importError && <p className="csv-import-error">{importError}</p>}
        </div>

        <div className="csv-modal-footer">
          <button
            className="csv-btn-cancel"
            onClick={onClose}
            disabled={importing}
          >
            Cancelar
          </button>
          <button
            className="csv-btn-import"
            onClick={handleImport}
            disabled={rows.length === 0 || !defaultCategoryId || importing}
          >
            {importing ? (
              "Importando…"
            ) : (
              <>
                <Check size={15} /> Importar{" "}
                {rows.length > 0 ? `${rows.length} tarjetas` : ""}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CsvImportModal;
