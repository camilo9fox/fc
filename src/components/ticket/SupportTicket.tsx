import { useState } from "react";

function SupportTicket() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí puedes agregar la lógica para enviar el ticket de soporte, como hacer una solicitud a tu backend o mostrar un mensaje de éxito.
    alert(
      "Ticket de soporte enviado. Nos pondremos en contacto contigo pronto.",
    );
  };

  return <div className="support-ticket-container">
    

  </div>;
}

export default SupportTicket;
