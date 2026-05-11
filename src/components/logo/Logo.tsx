import React from "react";
import "./Logo.css";

const LogoType = {
  extraSmall: "logo-extra-small",
  small: "logo-small",
  medium: "logo-medium",
  large: "logo-large",
};

const Logo = ({
  size = "extraSmall",
}: {
  size?: "extraSmall" | "small" | "medium" | "large";
}) => {
  return (
    <div className={`logo ${LogoType[size]}`}>
      <img src="/logo192.png" alt="Logo" className="logo-image" />
    </div>
  );
};

export default Logo;
