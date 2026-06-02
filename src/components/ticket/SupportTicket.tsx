import React, { useState, useEffect, useCallback } from "react";
import {
  Send,
  MessageSquare,
  Trash2,
  ChevronDown,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  Plus,
} from "lucide-react";
import { ticketsApi, Ticket, TicketCategory, CreateTicketPayload } from "../../api/ticket";
import { useConfirmDialog } from "../../contexts/ConfirmDialogContext";
import "./SupportTicket.css";

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  open: {
    label: "Abierto",
    icon: <AlertCircle size={14} />,
    className: "st-status-open",
  },
  in_progress: {
    label: "En progreso",
    icon: <RefreshCw size={14} />,
    className: "st-status-progress",
  },
  resolved: {
    label: "Resuelto",
    icon: <CheckCircle size={14} />,
    className: "st-status-resolved",
  },
  closed: {
    label: "Cerrado",
    icon: <XCircle size={14} />,
    className: "st-status-closed",
  },
};

const SupportTicket: React.FC = () => {
  const [view, setView] = useState<"create" | "list">("list");
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const { confirm } = useConfirmDialog();

  const loadCategories = useCallback(async () => {
    try {
      const res = await ticketsApi.getCategories();
      setCategories(res.categories);
    } catch {
      setCategories([]);
    }
  }, []);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ticketsApi.getByUser();
      setTickets(res.tickets || []);
    } catch {
      setError("No se pudieron cargar tus tickets.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
    loadTickets();
  }, [loadCategories, loadTickets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!selectedCategory) {
      setFormError("Selecciona una categoría.");
      return;
    }

    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    if (trimmedSubject.length < 5) {
      setFormError("El asunto debe tener al menos 5 caracteres.");
      return;
    }
    if (trimmedMessage.length < 10) {
      setFormError("El mensaje debe tener al menos 10 caracteres.");
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateTicketPayload = {
        categoryId: selectedCategory,
        subject: trimmedSubject,
        message: trimmedMessage,
      };
      await ticketsApi.create(payload);
      setSubject("");
      setMessage("");
      setSelectedCategory("");
      setSuccessMsg("Ticket creado correctamente. Te notificaremos pronto.");
      setView("list");
      loadTickets();
    } catch (err: any) {
      setFormError(err?.response?.data?.error || "Error al crear el ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (ticket: Ticket) => {
    const accepted = await confirm({
      title: "Eliminar ticket",
      description: `¿Eliminar el ticket "${ticket.subject}"?`,
      confirmLabel: "Sí, eliminar",
      cancelLabel: "Cancelar",
      tone: "danger",
    });
    if (!accepted) return;

    try {
      await ticketsApi.delete(ticket.id);
      setSuccessMsg("Ticket eliminado.");
      loadTickets();
    } catch {
      setError("No se pudo eliminar el ticket.");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="st-page">
      <header className="st-header">
        <div className="st-header-left">
          <div className="st-header-icon">
            <MessageSquare size={22} />
          </div>
          <div>
            <h1>Soporte</h1>
            <p>Gestiona tus tickets de ayuda y consultas</p>
          </div>
        </div>
        <div className="st-view-toggle">
          <button
            className={`st-toggle-btn ${view === "list" ? "active" : ""}`}
            onClick={() => setView("list")}
          >
            <MessageSquare size={15} />
            <span>Mis tickets</span>
          </button>
          <button
            className={`st-toggle-btn ${view === "create" ? "active" : ""}`}
            onClick={() => setView("create")}
          >
            <Plus size={15} />
            <span>Crear ticket</span>
          </button>
        </div>
      </header>

      {successMsg && (
        <div className="st-success" role="status">
          <CheckCircle size={16} />
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg("")} aria-label="Cerrar">
            <XCircle size={14} />
          </button>
        </div>
      )}

      {error && (
        <div className="st-error" role="alert">
          {error}
          <button onClick={() => setError("")} aria-label="Cerrar">
            <XCircle size={14} />
          </button>
        </div>
      )}

      {view === "create" && (
        <section className="st-card">
          <h2 className="st-card-title">Nuevo ticket de soporte</h2>
          <p className="st-card-desc">
            Cuéntanos tu problema o consulta y te responderemos lo antes posible.
          </p>

          <form className="st-form" onSubmit={handleSubmit} noValidate>
            <div className="st-field">
              <label htmlFor="st-category">Categoría</label>
              <div className="st-select-wrap">
                <select
                  id="st-category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  disabled={submitting}
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="st-select-arrow" />
              </div>
            </div>

            <div className="st-field">
              <label htmlFor="st-subject">Asunto</label>
              <input
                id="st-subject"
                type="text"
                className="st-input"
                placeholder="Ej: Problema al generar flashcards"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={255}
                disabled={submitting}
                required
              />
              <span className="st-char-count">{subject.length}/255</span>
            </div>

            <div className="st-field">
              <label htmlFor="st-message">Mensaje</label>
              <textarea
                id="st-message"
                className="st-textarea"
                placeholder="Describe tu problema o consulta con el mayor detalle posible..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={5000}
                rows={6}
                disabled={submitting}
                required
              />
              <span className="st-char-count">{message.length}/5000</span>
            </div>

            {formError && (
              <div className="st-form-error" role="alert">
                {formError}
              </div>
            )}

            <div className="st-form-actions">
              <button
                type="button"
                className="st-btn-cancel"
                onClick={() => {
                  setView("list");
                  setSubject("");
                  setMessage("");
                  setSelectedCategory("");
                  setFormError("");
                }}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="st-btn-submit"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <RefreshCw size={15} className="st-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    Enviar ticket
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      )}

      {view === "list" && (
        <section className="st-card">
          <div className="st-list-header">
            <h2 className="st-card-title">Mis tickets</h2>
            <span className="st-count-badge">{tickets.length} ticket{tickets.length !== 1 ? "s" : ""}</span>
          </div>

          {loading ? (
            <div className="st-loading">
              <RefreshCw size={18} className="st-spin" />
              <span>Cargando tickets...</span>
            </div>
          ) : tickets.length === 0 ? (
            <div className="st-empty">
              <MessageSquare size={40} />
              <h3>No tienes tickets</h3>
              <p>¿Necesitas ayuda? Crea tu primer ticket de soporte.</p>
              <button className="st-btn-submit" onClick={() => setView("create")}>
                <Plus size={15} />
                Crear ticket
              </button>
            </div>
          ) : (
            <div className="st-ticket-list">
              {tickets.map((ticket) => {
                const status = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
                return (
                  <article key={ticket.id} className="st-ticket-item">
                    <div className="st-ticket-main">
                      <div className="st-ticket-top">
                        <span className={`st-status ${status.className}`}>
                          {status.icon}
                          {status.label}
                        </span>
                        <span className="st-ticket-category">
                          {ticket.category?.name || categories.find((c) => c.id === ticket.category_id)?.name || "General"}
                        </span>
                      </div>
                      <h3 className="st-ticket-subject">{ticket.subject}</h3>
                      <p className="st-ticket-preview">
                        {ticket.message.length > 160
                          ? ticket.message.slice(0, 160) + "..."
                          : ticket.message}
                      </p>
                      <span className="st-ticket-date">
                        <Clock size={12} />
                        {formatDate(ticket.createdAt)}
                      </span>
                    </div>
                    <div className="st-ticket-actions">
                      <button
                        className="st-delete-btn"
                        onClick={() => handleDelete(ticket)}
                        aria-label={`Eliminar ticket ${ticket.subject}`}
                        title="Eliminar ticket"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default SupportTicket;
