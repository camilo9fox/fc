import React from "react";
import { Link } from "react-router-dom";

type MobileHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  variant: "home" | "create" | "library" | "profile";
};

export const MobileHero: React.FC<MobileHeroProps> = ({
  eyebrow,
  title,
  description,
  variant,
}) => {
  return (
    <section className={`mb-hero mb-hero-${variant}`}>
      <p className="mb-eyebrow">{eyebrow}</p>
      <div className="mb-hero-bottom">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </section>
  );
};

type MobileSectionProps = {
  title: string;
  children: React.ReactNode;
};

export const MobileSection: React.FC<MobileSectionProps> = ({
  title,
  children,
}) => {
  return (
    <section className="mb-section">
      <div className="mb-section-head">
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
};

type MobileStatCardProps = {
  label: string;
  value: React.ReactNode;
  helper: string;
};

export const MobileStatCard: React.FC<MobileStatCardProps> = ({
  label,
  value,
  helper,
}) => {
  return (
    <article className="mb-stat-card">
      <span className="mb-stat-card-label">{label}</span>
      <span className="mb-stat-card-value">{value}</span>
      <span className="mb-stat-card-helper">{helper}</span>
    </article>
  );
};

type MobileActionCardProps = {
  label: string;
  onClick: () => void;
};

export const MobileActionCard: React.FC<MobileActionCardProps> = ({
  label,
  onClick,
}) => {
  return (
    <button className="mb-action-card" onClick={onClick}>
      {label}
    </button>
  );
};

type MobileListButtonProps = {
  label: string;
  subLabel?: string;
  badge: React.ReactNode;
  icon?: string;
  iconBg?: string;
  onClick: () => void;
};

export const MobileListButton: React.FC<MobileListButtonProps> = ({
  label,
  subLabel,
  badge,
  icon,
  iconBg = "linear-gradient(135deg, #631d76, #ee4266)",
  onClick,
}) => {
  return (
    <button className="mb-list-item" onClick={onClick}>
      <span className="mb-list-item-left">
        {icon && (
          <span className="mb-list-icon" style={{ background: iconBg }}>
            {icon}
          </span>
        )}
        <span className="mb-list-item-text">
          <span className="mb-list-item-title">{label}</span>
          {subLabel && <span className="mb-list-item-sub">{subLabel}</span>}
        </span>
      </span>
      <span className="mb-list-item-right">
        <em>{badge}</em>
        <span className="mb-list-chevron">›</span>
      </span>
    </button>
  );
};

type MobileCreateCardProps = {
  title: string;
  description: string;
  cta?: string;
  icon?: string;
  iconBg?: string;
  onClick: () => void;
};

export const MobileCreateCard: React.FC<MobileCreateCardProps> = ({
  title,
  description,
  cta = "Crear",
  icon,
  iconBg = "linear-gradient(135deg, #631d76, #ee4266)",
  onClick,
}) => {
  return (
    <button className="mb-create-card" onClick={onClick}>
      {icon && (
        <span className="mb-create-icon" style={{ background: iconBg }}>
          {icon}
        </span>
      )}
      <span className="mb-create-text">
        <strong>{title}</strong>
        <p>{description}</p>
      </span>
      <span className="mb-create-cta">{cta}</span>
    </button>
  );
};

type MobilePublicCardProps = {
  title: string;
  description: string;
  totalResources: number;
  onClick: () => void;
};

export const MobilePublicCard: React.FC<MobilePublicCardProps> = ({
  title,
  description,
  totalResources,
  onClick,
}) => {
  return (
    <button className="mb-public-card" onClick={onClick}>
      <span className="mb-public-icon">📚</span>
      <span className="mb-public-card-info">
        <strong>{title}</strong>
        <p>{description}</p>
        <span className="mb-public-card-badge">{totalResources} recursos</span>
      </span>
      <span className="mb-public-chevron">›</span>
    </button>
  );
};

type MobileProfileShortcutProps = {
  to: string;
  label: string;
  badge?: React.ReactNode;
};

export const MobileProfileShortcut: React.FC<MobileProfileShortcutProps> = ({
  to,
  label,
  badge = "›",
}) => {
  return (
    <Link to={to} className="mb-list-item">
      <span className="mb-list-item-left">
        <span className="mb-list-item-title">{label}</span>
      </span>
      <span className="mb-list-item-right">
        <span className="mb-list-chevron">{badge}</span>
      </span>
    </Link>
  );
};
