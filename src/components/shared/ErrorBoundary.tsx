import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary — catches uncaught React errors and shows a friendly UI
 * instead of a blank white screen.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#f0eaf5",
            color: "#2E2532",
            fontFamily: "sans-serif",
            gap: "1rem",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "2rem", color: "#631D76" }}>
            Algo salió mal 😕
          </h1>
          <p style={{ maxWidth: 480, color: "#555" }}>
            Ocurrió un error inesperado. Por favor recarga la página o vuelve al
            inicio.
          </p>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <pre
              style={{
                background: "#fff",
                border: "1px solid #ddd",
                padding: "1rem",
                borderRadius: "8px",
                fontSize: "0.75rem",
                maxWidth: 600,
                overflowX: "auto",
                textAlign: "left",
                color: "#c0392b",
              }}
            >
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={this.handleReload}
            style={{
              background: "#631D76",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Volver al inicio
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
