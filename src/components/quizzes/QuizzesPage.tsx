import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCategories } from "../../hooks/useCategories";
import {
  quizApi,
  Quiz,
  QuizQuestion,
  CreateQuizRequest,
  CreateQuizQuestionRequest,
} from "../../api/quiz";
import "./QuizzesPage.css";

// ─── Study Session ─────────────────────────────────────────────────────────────

interface QuizStudyProps {
  quiz: Quiz;
  onClose: () => void;
}

const QuizStudySession: React.FC<QuizStudyProps> = ({ quiz, onClose }) => {
  const questions = quiz.questions || [];
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = questions[index];

  const handleAnswer = (option: string) => {
    if (selected !== null) return;
    setSelected(option);
    if (option === current.correct_answer) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (index + 1 >= questions.length) {
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
    }
  };

  const handleRestart = () => {
    setIndex(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="qz-overlay">
        <div className="qz-result-card">
          <div
            className={`qz-score-circle ${pct >= 70 ? "good" : pct >= 40 ? "mid" : "low"}`}
          >
            <span className="qz-score-pct">{pct}%</span>
            <span className="qz-score-label">Aciertos</span>
          </div>
          <h2 className="qz-result-title">{quiz.title}</h2>
          <p className="qz-result-sub">
            {score} de {questions.length} preguntas correctas
          </p>
          <div className="qz-result-actions">
            <button className="qz-btn-primary" onClick={handleRestart}>
              Intentar de nuevo
            </button>
            <button className="qz-btn-secondary" onClick={onClose}>
              Volver al listado
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="qz-overlay">
      <header className="qz-study-header">
        <h2 className="qz-study-title">{quiz.title}</h2>
        <div className="qz-study-meta">
          <span className="qz-counter">
            {index + 1} / {questions.length}
          </span>
          <button
            className="qz-close-btn"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
      </header>

      <div className="qz-progress-track">
        <div
          className="qz-progress-fill"
          style={{ width: `${((index + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="qz-study-body">
        <div className="qz-question-card">
          <p className="qz-question-text">{current.question}</p>

          <div className="qz-options-grid">
            {current.options.map((opt) => {
              let cls = "qz-option";
              if (selected !== null) {
                if (opt === current.correct_answer) cls += " correct";
                else if (opt === selected) cls += " wrong";
                else cls += " dimmed";
              }
              return (
                <button
                  key={opt}
                  className={cls}
                  onClick={() => handleAnswer(opt)}
                  disabled={selected !== null}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {selected !== null && current.explanation && (
            <div className="qz-explanation">
              <strong>Explicación:</strong> {current.explanation}
            </div>
          )}

          {selected !== null && (
            <button className="qz-btn-primary qz-next-btn" onClick={handleNext}>
              {index + 1 >= questions.length ? "Ver resultado" : "Siguiente →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Generate Form (IA) ────────────────────────────────────────────────────────

interface GenerateQuizFormProps {
  onCreated: (quiz: Quiz) => void;
  onCancel: () => void;
}

const GenerateQuizForm: React.FC<GenerateQuizFormProps> = ({
  onCreated,
  onCancel,
}) => {
  const { categories } = useCategories();
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [quantity, setQuantity] = useState(5);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) return setError("El título es obligatorio.");
    if (!categoryId) return setError("Debes seleccionar una categoría.");
    if (!file && !text.trim())
      return setError("Proporciona un archivo o texto de estudio.");

    setGenerating(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("categoryId", categoryId);
      formData.append("quantity", String(quantity));
      if (file) formData.append("file", file);
      if (text.trim()) formData.append("text", text.trim());

      const created = await quizApi.generate(formData);
      onCreated(created);
    } catch (err: any) {
      setError(
        err?.response?.data?.error || "Error al generar el cuestionario.",
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <form className="qz-form" onSubmit={handleSubmit}>
      <div className="qz-form-header">
        <h2>Generar cuestionario con IA</h2>
        <button type="button" className="qz-close-btn" onClick={onCancel}>
          ✕
        </button>
      </div>

      <div className="qz-form-meta">
        <div className="qz-field">
          <label>Título</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Historia de Chile — Capítulo 3"
          />
        </div>
        <div className="qz-field">
          <label>Categoría</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Selecciona una categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
        <div className="qz-field">
          <label>Número de preguntas (1 – 20)</label>
          <input
            type="number"
            min={1}
            max={20}
            value={quantity}
            onChange={(e) =>
              setQuantity(
                Math.min(20, Math.max(1, parseInt(e.target.value) || 5)),
              )
            }
          />
        </div>
      </div>

      <div className="qz-field">
        <label>Texto de estudio</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder="Pega aquí el contenido del que quieres generar preguntas..."
        />
      </div>

      <div className="qz-field">
        <label>O sube un archivo (PDF / TXT)</label>
        <div className="qz-file-row">
          <button
            type="button"
            className="qz-btn-secondary qz-file-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            {file ? `📄 ${file.name}` : "Seleccionar archivo"}
          </button>
          {file && (
            <button
              type="button"
              className="qz-remove-btn"
              onClick={() => {
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            >
              Quitar
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </div>

      {error && <p className="qz-error">{error}</p>}

      {generating && (
        <p className="qz-generating-msg">
          ✨ Generando {quantity} preguntas con IA…
        </p>
      )}

      <div className="qz-form-actions">
        <button
          type="button"
          className="qz-btn-secondary"
          onClick={onCancel}
          disabled={generating}
        >
          Cancelar
        </button>
        <button type="submit" className="qz-btn-primary" disabled={generating}>
          {generating ? "Generando..." : "Generar cuestionario"}
        </button>
      </div>
    </form>
  );
};

// ─── Create Form ───────────────────────────────────────────────────────────────

interface CreateQuizFormProps {
  onCreated: (quiz: Quiz) => void;
  onCancel: () => void;
}

const CreateQuizForm: React.FC<CreateQuizFormProps> = ({
  onCreated,
  onCancel,
}) => {
  const { categories } = useCategories();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [questions, setQuestions] = useState<CreateQuizQuestionRequest[]>([
    {
      question: "",
      options: ["", "", "", ""],
      correct_answer: "",
      explanation: "",
    },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateQuestion = (
    qi: number,
    field: keyof CreateQuizQuestionRequest,
    value: any,
  ) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[qi] = { ...next[qi], [field]: value };
      return next;
    });
  };

  const updateOption = (qi: number, oi: number, value: string) => {
    setQuestions((prev) => {
      const next = [...prev];
      const opts = [...next[qi].options];
      opts[oi] = value;
      next[qi] = { ...next[qi], options: opts };
      return next;
    });
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        question: "",
        options: ["", "", "", ""],
        correct_answer: "",
        explanation: "",
      },
    ]);
  };

  const removeQuestion = (qi: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== qi));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) return setError("El título es obligatorio.");
    if (!categoryId) return setError("Debes seleccionar una categoría.");
    if (questions.length === 0)
      return setError("Agrega al menos una pregunta.");

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim())
        return setError(`Pregunta ${i + 1}: el enunciado es obligatorio.`);
      const validOpts = q.options.filter((o) => o.trim());
      if (validOpts.length < 2)
        return setError(`Pregunta ${i + 1}: necesitas al menos 2 opciones.`);
      if (!q.correct_answer.trim())
        return setError(`Pregunta ${i + 1}: selecciona la respuesta correcta.`);
      if (!validOpts.includes(q.correct_answer))
        return setError(
          `Pregunta ${i + 1}: la respuesta correcta debe ser una de las opciones.`,
        );
    }

    setSaving(true);
    try {
      const payload: CreateQuizRequest = {
        title: title.trim(),
        category_id: categoryId,
        description: description.trim() || undefined,
        questions: questions.map((q, i) => ({
          question: q.question.trim(),
          options: q.options.filter((o) => o.trim()),
          correct_answer: q.correct_answer.trim(),
          explanation: q.explanation?.trim() || undefined,
          order_index: i,
        })),
      };
      const created = await quizApi.create(payload);
      onCreated(created);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Error al crear el cuestionario.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="qz-form" onSubmit={handleSubmit}>
      <div className="qz-form-header">
        <h2>Nuevo cuestionario</h2>
        <button type="button" className="qz-close-btn" onClick={onCancel}>
          ✕
        </button>
      </div>

      <div className="qz-form-meta">
        <div className="qz-field">
          <label>Título</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Historia de Chile — Capítulo 3"
          />
        </div>
        <div className="qz-field">
          <label>Descripción (opcional)</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Breve descripción del cuestionario"
          />
        </div>
        <div className="qz-field">
          <label>Categoría</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Selecciona una categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="qz-questions-list">
        {questions.map((q, qi) => (
          <div key={qi} className="qz-question-block">
            <div className="qz-question-block-header">
              <span className="qz-q-number">Pregunta {qi + 1}</span>
              {questions.length > 1 && (
                <button
                  type="button"
                  className="qz-remove-btn"
                  onClick={() => removeQuestion(qi)}
                >
                  Eliminar
                </button>
              )}
            </div>

            <div className="qz-field">
              <label>Enunciado</label>
              <textarea
                value={q.question}
                onChange={(e) => updateQuestion(qi, "question", e.target.value)}
                rows={2}
                placeholder="¿Cuál es la capital de Francia?"
              />
            </div>

            <div className="qz-options-form-grid">
              {q.options.map((opt, oi) => (
                <div key={oi} className="qz-option-input-row">
                  <input
                    value={opt}
                    onChange={(e) => updateOption(qi, oi, e.target.value)}
                    placeholder={`Opción ${oi + 1}`}
                  />
                  <label className="qz-radio-label">
                    <input
                      type="radio"
                      name={`correct-${qi}`}
                      checked={q.correct_answer === opt && opt.trim() !== ""}
                      onChange={() =>
                        opt.trim() && updateQuestion(qi, "correct_answer", opt)
                      }
                    />
                    Correcta
                  </label>
                </div>
              ))}
            </div>

            <div className="qz-field">
              <label>Explicación (opcional)</label>
              <input
                value={q.explanation || ""}
                onChange={(e) =>
                  updateQuestion(qi, "explanation", e.target.value)
                }
                placeholder="¿Por qué esta es la respuesta correcta?"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="qz-btn-add-question"
        onClick={addQuestion}
      >
        + Agregar pregunta
      </button>

      {error && <p className="qz-error">{error}</p>}

      <div className="qz-form-actions">
        <button type="button" className="qz-btn-secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="qz-btn-primary" disabled={saving}>
          {saving ? "Guardando..." : "Crear cuestionario"}
        </button>
      </div>
    </form>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────

const QuizzesPage: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createMode, setCreateMode] = useState<"manual" | "ai">("manual");
  const [studyQuiz, setStudyQuiz] = useState<Quiz | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await quizApi.getAll();
        setQuizzes(res.quizzes);
      } catch {
        setError("No se pudieron cargar los cuestionarios.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCreated = (quiz: Quiz) => {
    setQuizzes((prev) => [quiz, ...prev]);
    setShowCreate(false);
  };

  const handleStudy = async (quiz: Quiz) => {
    if (quiz.questions && quiz.questions.length > 0) {
      setStudyQuiz(quiz);
      return;
    }
    setLoadingDetail(quiz.id);
    try {
      const full = await quizApi.getById(quiz.id);
      setStudyQuiz(full);
    } catch {
      setError("No se pudo cargar el cuestionario.");
    } finally {
      setLoadingDetail(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar este cuestionario?")) return;
    try {
      await quizApi.delete(id);
      setQuizzes((prev) => prev.filter((q) => q.id !== id));
    } catch {
      setError("No se pudo eliminar el cuestionario.");
    }
  };

  if (studyQuiz) {
    return (
      <QuizStudySession quiz={studyQuiz} onClose={() => setStudyQuiz(null)} />
    );
  }

  if (showCreate) {
    return (
      <div className="qz-page">
        <div className="qz-mode-toggle">
          <button
            className={`qz-mode-btn ${createMode === "manual" ? "active" : ""}`}
            onClick={() => setCreateMode("manual")}
          >
            ✏️ Manual
          </button>
          <button
            className={`qz-mode-btn ${createMode === "ai" ? "active" : ""}`}
            onClick={() => setCreateMode("ai")}
          >
            ✨ Generar con IA
          </button>
        </div>

        {createMode === "manual" ? (
          <CreateQuizForm
            onCreated={handleCreated}
            onCancel={() => setShowCreate(false)}
          />
        ) : (
          <GenerateQuizForm
            onCreated={handleCreated}
            onCancel={() => setShowCreate(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="qz-page">
      <div className="qz-page-header">
        <div>
          <h1 className="qz-page-title">Cuestionarios</h1>
          <p className="qz-page-sub">
            Crea y practica cuestionarios de múltiple opción
          </p>
        </div>
        <button className="qz-btn-primary" onClick={() => setShowCreate(true)}>
          + Nuevo cuestionario
        </button>
      </div>

      {error && <p className="qz-error">{error}</p>}

      {loading ? (
        <div className="qz-loading">Cargando cuestionarios...</div>
      ) : quizzes.length === 0 ? (
        <div className="qz-empty">
          <div className="qz-empty-icon">📝</div>
          <h3>Aún no tienes cuestionarios</h3>
          <p>Crea tu primer cuestionario de múltiple opción</p>
          <button
            className="qz-btn-primary"
            onClick={() => setShowCreate(true)}
          >
            Crear cuestionario
          </button>
        </div>
      ) : (
        <div className="qz-grid">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="qz-card">
              <div className="qz-card-header">
                {quiz.category && (
                  <span className="qz-card-category">
                    {quiz.category.title}
                  </span>
                )}
                <button
                  className="qz-card-delete"
                  onClick={() => handleDelete(quiz.id)}
                  aria-label="Eliminar"
                >
                  ✕
                </button>
              </div>
              <h3 className="qz-card-title">{quiz.title}</h3>
              {quiz.description && (
                <p className="qz-card-desc">{quiz.description}</p>
              )}
              <div className="qz-card-footer">
                <span className="qz-card-count">
                  {quiz.questions?.length ?? "?"} preguntas
                </span>
                <button
                  className="qz-btn-study"
                  onClick={() => handleStudy(quiz)}
                  disabled={loadingDetail === quiz.id}
                >
                  {loadingDetail === quiz.id ? "Cargando..." : "Estudiar →"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizzesPage;
