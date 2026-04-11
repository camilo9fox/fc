import React, { useState } from "react";
import { useCategories } from "../../hooks/useCategories";

const CategoryManager: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [newCategoryTitle, setNewCategoryTitle] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { categories, createCategory, deleteCategory } = useCategories();

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryTitle.trim()) {
      setError("El título de la categoría es obligatorio");
      return;
    }

    try {
      await createCategory({
        title: newCategoryTitle.trim(),
        description: newCategoryDescription.trim() || undefined,
      });
      setNewCategoryTitle("");
      setNewCategoryDescription("");
      setIsCreating(false);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta categoría? Las flashcards asociadas no se eliminarán.")) {
      try {
        await deleteCategory(categoryId);
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="category-manager">
      <div className="category-manager-header">
        <h3>Gestionar categorías</h3>
        <button
          className="primary-button small"
          onClick={() => setIsCreating(!isCreating)}
        >
          {isCreating ? "Cancelar" : "Nueva categoría"}
        </button>
      </div>

      {isCreating && (
        <form className="category-form" onSubmit={handleCreateCategory}>
          <div className="form-row">
            <label htmlFor="categoryTitle">Título</label>
            <input
              id="categoryTitle"
              type="text"
              value={newCategoryTitle}
              onChange={(e) => setNewCategoryTitle(e.target.value)}
              placeholder="Nombre de la categoría"
              required
            />
          </div>

          <div className="form-row">
            <label htmlFor="categoryDescription">Descripción (opcional)</label>
            <textarea
              id="categoryDescription"
              value={newCategoryDescription}
              onChange={(e) => setNewCategoryDescription(e.target.value)}
              rows={2}
              placeholder="Descripción de la categoría"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="primary-button">Crear</button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setIsCreating(false);
                setNewCategoryTitle("");
                setNewCategoryDescription("");
                setError(null);
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="categories-list">
        {categories.length === 0 ? (
          <p className="flashcards-empty">No tienes categorías creadas.</p>
        ) : (
          categories.map((category) => (
            <div key={category.id} className="category-item">
              <div className="category-info">
                <strong>{category.title}</strong>
                {category.description && <p>{category.description}</p>}
              </div>
              <button
                className="delete-button"
                onClick={() => handleDeleteCategory(category.id)}
                title="Eliminar categoría"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      {error && <p className="field-error">{error}</p>}
    </div>
  );
};

export default CategoryManager;