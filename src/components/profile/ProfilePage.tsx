import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { authApi } from "../../api/auth";
import "./ProfilePage.css";

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwStatus, setPwStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [pwError, setPwError] = useState("");

  // Profile editing state
  const [profileName, setProfileName] = useState<string>(
    user?.metadata?.full_name || "",
  );
  const [profileEmail, setProfileEmail] = useState<string>(user?.email || "");
  const [profileStatus, setProfileStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [profileError, setProfileError] = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState<"idle" | "loading">("idle");
  const [deleteError, setDeleteError] = useState("");

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "US";
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileStatus("loading");
    try {
      const updates: { name?: string; email?: string } = {};
      if (
        profileName.trim() &&
        profileName !== (user?.metadata?.full_name || "")
      )
        updates.name = profileName.trim();
      if (profileEmail.trim() && profileEmail !== user?.email)
        updates.email = profileEmail.trim();

      if (Object.keys(updates).length === 0) {
        setProfileStatus("idle");
        return;
      }
      await authApi.updateProfile(updates);
      setProfileStatus("success");
    } catch (err: any) {
      setProfileStatus("error");
      setProfileError(
        err?.response?.data?.error || "No se pudo actualizar el perfil.",
      );
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");

    if (newPassword.length < 6) {
      setPwError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Las contraseñas no coinciden.");
      return;
    }

    setPwStatus("loading");
    try {
      await authApi.updatePassword(newPassword);
      setPwStatus("success");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPwStatus("error");
      setPwError(
        err?.response?.data?.error || "No se pudo actualizar la contraseña.",
      );
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleDeleteAccount = async () => {
    setDeleteError("");
    setDeleteStatus("loading");
    try {
      await authApi.deleteAccount();
      logout();
      navigate("/login");
    } catch (err: any) {
      setDeleteStatus("idle");
      setDeleteError(
        err?.response?.data?.error || "No se pudo eliminar la cuenta.",
      );
    }
  };

  return (
    <div className="prf-page">
      {/* Hero */}
      <div className="prf-hero">
        <div className="prf-avatar">{initials}</div>
        <div className="prf-hero-info">
          <h2 className="prf-email">{user?.email}</h2>
          <p className="prf-member-since">Miembro desde {memberSince}</p>
        </div>
      </div>

      {/* Quick-access cards */}
      <section className="prf-section">
        <h3 className="prf-section-title">Acceso rápido</h3>
        <div className="prf-cards">
          {/* Estadísticas */}
          <button className="prf-card" onClick={() => navigate("/dashboard")}>
            <div className="prf-card-icon prf-icon-stats">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </div>
            <div className="prf-card-body">
              <p className="prf-card-title">Panel de estadísticas</p>
              <p className="prf-card-desc">
                Revisa tu progreso y rendimiento de estudio.
              </p>
            </div>
            <div className="prf-card-arrow">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </button>

          {/* Historial */}
          <button className="prf-card" onClick={() => navigate("/historial")}>
            <div className="prf-card-icon prf-icon-history">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="prf-card-body">
              <p className="prf-card-title">Historial de actividad</p>
              <p className="prf-card-desc">
                Consulta todos tus intentos y sesiones anteriores.
              </p>
            </div>
            <div className="prf-card-arrow">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </button>
        </div>
      </section>

      {/* Profile info edit */}
      <section className="prf-section">
        <h3 className="prf-section-title">Editar perfil</h3>
        <div className="prf-pw-card">
          <form className="prf-pw-form" onSubmit={handleProfileUpdate}>
            <div className="prf-field">
              <label className="prf-label" htmlFor="prf-name">
                Nombre
              </label>
              <input
                id="prf-name"
                type="text"
                className="prf-input"
                placeholder="Tu nombre"
                value={profileName}
                maxLength={100}
                onChange={(e) => {
                  setProfileName(e.target.value);
                  setProfileStatus("idle");
                }}
                autoComplete="name"
              />
            </div>
            <div className="prf-field">
              <label className="prf-label" htmlFor="prf-email">
                Correo electrónico
              </label>
              <input
                id="prf-email"
                type="email"
                className="prf-input"
                placeholder="tu@correo.com"
                value={profileEmail}
                maxLength={255}
                onChange={(e) => {
                  setProfileEmail(e.target.value);
                  setProfileStatus("idle");
                }}
                autoComplete="email"
              />
            </div>

            {profileError && <p className="prf-pw-error">{profileError}</p>}
            {profileStatus === "success" && (
              <p className="prf-pw-success">
                ¡Perfil actualizado correctamente!
              </p>
            )}

            <button
              type="submit"
              className="prf-pw-btn"
              disabled={profileStatus === "loading"}
            >
              {profileStatus === "loading" ? "Guardando…" : "Guardar cambios"}
            </button>
          </form>
        </div>
      </section>

      {/* Password change */}
      <section className="prf-section">
        <h3 className="prf-section-title">Cambiar contraseña</h3>
        <div className="prf-pw-card">
          <form className="prf-pw-form" onSubmit={handlePasswordChange}>
            <div className="prf-field">
              <label className="prf-label" htmlFor="prf-new-pw">
                Nueva contraseña
              </label>
              <input
                id="prf-new-pw"
                type="password"
                className="prf-input"
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPwStatus("idle");
                }}
                autoComplete="new-password"
              />
            </div>
            <div className="prf-field">
              <label className="prf-label" htmlFor="prf-confirm-pw">
                Confirmar contraseña
              </label>
              <input
                id="prf-confirm-pw"
                type="password"
                className="prf-input"
                placeholder="Repite la nueva contraseña"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPwStatus("idle");
                }}
                autoComplete="new-password"
              />
            </div>

            {pwError && <p className="prf-pw-error">{pwError}</p>}
            {pwStatus === "success" && (
              <p className="prf-pw-success">
                ¡Contraseña actualizada correctamente!
              </p>
            )}

            <button
              type="submit"
              className="prf-pw-btn"
              disabled={pwStatus === "loading"}
            >
              {pwStatus === "loading" ? "Guardando…" : "Guardar contraseña"}
            </button>
          </form>
        </div>
      </section>

      {/* Logout */}
      <section className="prf-section">
        <h3 className="prf-section-title">Sesión</h3>
        <div className="prf-action-card">
          <div className="prf-action-info">
            <p className="prf-action-title">Cerrar sesión</p>
            <p className="prf-action-desc">
              Salir de tu cuenta en este dispositivo.
            </p>
          </div>
          <button className="prf-logout-btn" onClick={handleLogout}>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </section>

      {/* Danger zone */}
      <section className="prf-section">
        <h3 className="prf-section-title prf-danger-title">Zona de peligro</h3>
        <div className="prf-danger-card">
          {!deleteConfirm ? (
            <div className="prf-action-card prf-danger-row">
              <div className="prf-action-info">
                <p className="prf-action-title">Eliminar cuenta</p>
                <p className="prf-action-desc">
                  Borra permanentemente tu cuenta y todos tus datos. Esta acción
                  no se puede deshacer.
                </p>
              </div>
              <button
                className="prf-delete-btn"
                onClick={() => setDeleteConfirm(true)}
              >
                Eliminar cuenta
              </button>
            </div>
          ) : (
            <div className="prf-delete-confirm">
              <p className="prf-delete-warning">
                ¿Estás seguro? Esta acción eliminará tu cuenta y todos tus datos
                de forma permanente.
              </p>
              {deleteError && <p className="prf-pw-error">{deleteError}</p>}
              <div className="prf-delete-actions">
                <button
                  className="prf-cancel-btn"
                  onClick={() => {
                    setDeleteConfirm(false);
                    setDeleteError("");
                  }}
                  disabled={deleteStatus === "loading"}
                >
                  Cancelar
                </button>
                <button
                  className="prf-delete-confirm-btn"
                  onClick={handleDeleteAccount}
                  disabled={deleteStatus === "loading"}
                >
                  {deleteStatus === "loading"
                    ? "Eliminando…"
                    : "Sí, eliminar mi cuenta"}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;
