import React from "react";
import TermsPoliciesTemplate from "./TermsPoliciesTemplate";

function Policies() {
  return (
    <TermsPoliciesTemplate
      title="Política de Privacidad"
      date="Junio 2026"
      description="En FlashyLab, la protección y confidencialidad de sus datos personales es una prioridad fundamental. Al registrarse, acceder o utilizar nuestra Aplicación, usted (el Usuario) acepta de manera libre, informada y expresa el tratamiento de su información conforme a las disposiciones establecidas en esta Política de Privacidad. Si no está de acuerdo con las prácticas descritas en este documento, debe abstenerse de utilizar la Aplicación de manera inmediata."
      termsPoliciesList={[
        {
          id: "introduccion",
          title: "1. Introducción y Responsable del Tratamiento",
          content: [
            "La presente Política de Privacidad describe de manera detallada cómo FlashyLab recopila, utiliza, almacena, procesa, comparte y protege la información y los datos personales de los usuarios que acceden a nuestra plataforma.",
            "Al registrarse y utilizar la Aplicación, el Usuario otorga su consentimiento expreso e inequívoco para el tratamiento de sus datos personales conforme a los términos estipulados en este documento y de acuerdo con las leyes de protección de datos aplicables.",
            "El tratamiento de los datos se realiza con el único propósito de proveer, personalizar, optimizar y asegurar el correcto funcionamiento del servicio de asistencia al estudio ofrecido por FlashyLab.",
          ],
        },
        {
          id: "datos-recopilados",
          title: "2. Datos Personales que Recopilamos",
          content: [
            "Datos de registro y autenticación: dirección de correo electrónico, nombre de usuario y credenciales de acceso. Estos datos son indispensables para la creación y el mantenimiento de la cuenta del Usuario.",
            "Datos de perfil: nombre, apellidos, preferencias de estudio, nivel académico, objetivos de aprendizaje y configuraciones de la cuenta. Estos datos permiten personalizar la experiencia de estudio y son proporcionados voluntariamente por el Usuario.",
            "Contenido de estudio: Categorías, Flashcards, Cuestionarios, conjuntos de Verdadero y Falso, Guías de estudio, Simulaciones de examen y puntuaciones. Este contenido es generado por el Usuario manualmente o mediante las herramientas de IA de la Aplicación.",
            "Datos de uso y actividad: interacciones con la plataforma, sesiones de estudio completadas, puntuaciones en juegos y cuestionarios, progreso en el sistema de repaso espaciado (SM-2), rachas de estudio y frecuencia de uso. Estos datos se recopilan automáticamente para fines de análisis y mejora del servicio.",
            "Datos técnicos: dirección IP, tipo de navegador, sistema operativo, identificadores de dispositivo, marcas de tiempo de las solicitudes y datos de diagnóstico para la prevención de abusos y la optimización del rendimiento.",
          ],
        },
        {
          id: "supabase",
          title: "3. Almacenamiento y Procesamiento con Supabase",
          content: [
            "Toda la información de cuentas, perfiles, datos de estudio estructurados y metadatos de actividad se almacena de forma segura utilizando los servidores y la infraestructura de base de datos de Supabase, un proveedor externo de servicios de backend.",
            "Las contraseñas de acceso son sometidas a un proceso de hash y salting del lado del servidor mediante los protocolos estándar de seguridad de Supabase, impidiendo que los desarrolladores de FlashyLab o terceros no autorizados tengan acceso directo a las credenciales en texto plano.",
            "Supabase aplica medidas de seguridad a nivel de infraestructura que incluyen cifrado de datos en reposo, cifrado en tránsito mediante TLS, controles de acceso basados en roles y firewalls de red. Sin embargo, FlashyLab no puede garantizar la inviolabilidad absoluta de los sistemas de terceros.",
          ],
        },
        {
          id: "groq-ia",
          title: "4. Procesamiento de Datos por Inteligencia Artificial (Groq)",
          content: [
            "Cuando el Usuario solicita la generación automatizada de recursos de estudio, los textos de origen o los contextos temáticos proporcionados son enviados de forma temporal a través de la API de Groq Cloud para su procesamiento inmediato por parte de los modelos de lenguaje.",
            "Los datos enviados a la API de Groq se transmiten con el único fin técnico de generar respuestas educativas y no se utilizan de manera predeterminada para el entrenamiento o la mejora de modelos de IA públicos, de acuerdo con las directrices operativas de la API de Groq para desarrolladores.",
            "FlashyLab no almacena copias permanentes de las solicitudes enviadas a Groq más allá de lo necesario para entregar el resultado al Usuario. No obstante, el Usuario debe ser consciente de que la naturaleza del procesamiento en la nube implica la transmisión de datos fuera del entorno controlado de FlashyLab.",
            "Se recomienda a los usuarios no incluir información personal sensible, datos financieros, contraseñas o documentos de identidad en los textos enviados para generación mediante IA.",
          ],
        },
        {
          id: "rendimiento",
          title: "5. Datos de Infraestructura y Rendimiento",
          content: [
            "La Aplicación recopila y analiza de forma interna metadatos técnicos relacionados con el uso del sistema de regulación de créditos, incluyendo marcas de tiempo de las recargas, cantidad y frecuencia de solicitudes por sesión, e identificadores anonimizados de dispositivo.",
            "Estos datos se procesan de forma automatizada y son estrictamente necesarios para auditorías de seguridad, prevención de fraudes, mitigación de ataques de denegación de servicio (DoS), optimización del rendimiento de la base de datos y cumplimiento de los límites de cuota de los proveedores de API.",
            "Esta información técnica de consumo no es comercializada ni compartida con entidades externas con fines comerciales, y se utiliza exclusivamente para el mantenimiento de la estabilidad y la seguridad del servidor.",
          ],
        },
        {
          id: "cookies-publicidad",
          title: "6. Cookies, Publicidad y Tecnologías de Rastreo",
          content: [
            "FlashyLab utiliza cookies propias esenciales para el funcionamiento técnico de la plataforma, tales como el mantenimiento de sesiones de usuario, la persistencia de preferencias de tema (claro u oscuro) y la configuración de idioma de la interfaz.",
            "Se pueden utilizar cookies de funcionalidad adicional para recordar preferencias del Usuario y mejorar la experiencia de navegación. Estas cookies no recopilan información personal identificable y pueden ser desactivadas desde la configuración del navegador, aunque esto podría afectar la funcionalidad de la Aplicación.",
            "Como parte del modelo de financiación gratuita, FlashyLab integra redes de publicidad de terceros (actualmente Google AdSense en la versión web y potencialmente Google AdMob en dispositivos móviles). Estos proveedores pueden utilizar cookies, identificadores de dispositivo y tecnologías de rastreo para mostrar anuncios personalizados.",
            "La recopilación de datos con fines publicitarios por parte de terceros se rige exclusivamente por las políticas de privacidad de dichos proveedores. El Usuario puede gestionar, limitar o desactivar la personalización de anuncios desde la configuración de su navegador, su cuenta de Google o su sistema operativo móvil.",
          ],
        },
        {
          id: "retencion",
          title: "7. Retención y Eliminación de Datos",
          content: [
            "FlashyLab conserva los datos personales del Usuario y su progreso de estudio únicamente mientras la cuenta permanezca activa en la plataforma. Los datos de uso y actividad se conservan con fines estadísticos internos mientras la cuenta esté activa.",
            "El Usuario conserva en todo momento el derecho de solicitar la eliminación total de su cuenta y de toda la información asociada a ella a través de la sección de configuración de su perfil o mediante los canales oficiales de soporte.",
            "Una vez ejecutada la orden de eliminación, los datos alojados en las tablas de Supabase serán borrados de forma definitiva y permanente en un plazo máximo de treinta (30) días naturales. Se exceptúan aquellos registros técnicos agregados y completamente anonimizados necesarios para la prevención histórica de fraudes.",
            "Los datos transmitidos a la API de Groq durante las sesiones de generación no son retenidos por FlashyLab tras la entrega del resultado al Usuario, aunque pueden persistir temporalmente en los registros operativos de Groq conforme a sus propias políticas de retención.",
          ],
        },
        {
          id: "derechos-usuario",
          title: "8. Derechos del Usuario sobre sus Datos",
          content: [
            "De acuerdo con las normativas de protección de datos aplicables (incluyendo principios del GDPR europeo y legislación equivalente), el Usuario dispone de los siguientes derechos:",
            "Derecho de acceso: el Usuario puede solicitar en cualquier momento un informe detallado sobre los datos personales que FlashyLab ha recopilado y almacenado en relación con su cuenta.",
            "Derecho de rectificación: el Usuario puede corregir, actualizar o completar sus datos personales inexactos o incompletos directamente desde la sección de edición de perfil de la Aplicación.",
            "Derecho de supresión (derecho al olvido): el Usuario puede solicitar la eliminación definitiva de sus datos personales mediante la opción de eliminación de cuenta, tal como se describe en la sección de retención de esta política.",
            "Derecho a la portabilidad de los datos: el Usuario puede solicitar una copia de sus datos de estudio (Categorías, Flashcards, Cuestionarios y demás recursos generados) en un formato estructurado, de uso común y lectura mecánica (CSV o JSON).",
            "Derecho de oposición y limitación: el Usuario puede oponerse al tratamiento de sus datos para fines específicos y solicitar la limitación del procesamiento en determinadas circunstancias previstas por la ley.",
          ],
        },
        {
          id: "menores",
          title: "9. Privacidad de Menores de Edad",
          content: [
            "FlashyLab no recopila ni solicita intencionadamente información personal de niños menores de 13 años. Si se detecta que un menor de 13 años ha proporcionado datos personales sin el consentimiento verificable de sus padres o tutores, dichos datos serán eliminados de inmediato.",
            "Para usuarios entre 13 y 17 años, se requiere el consentimiento explícito y verificable de un padre, madre o tutor legal para el tratamiento de sus datos personales. El tutor legal podrá ejercer los derechos de acceso, rectificación y supresión en nombre del menor en cualquier momento.",
            "Los padres o tutores que tengan conocimiento de que un menor a su cargo ha proporcionado datos personales sin su consentimiento pueden contactar al equipo de FlashyLab a través de los canales de soporte para solicitar la eliminación inmediata de dicha información.",
          ],
        },
        {
          id: "transferencias",
          title: "10. Transferencias Internacionales de Datos",
          content: [
            "Los datos personales de los usuarios pueden ser procesados y almacenados en servidores ubicados fuera del país de residencia del Usuario, incluyendo Estados Unidos y otras jurisdicciones donde Supabase y Groq mantienen sus centros de datos.",
            "FlashyLab se compromete a garantizar que dichas transferencias internacionales cuenten con las salvaguardas adecuadas y se realicen únicamente a países que ofrezcan un nivel de protección de datos equiparable al exigido por la legislación aplicable en el país de origen del Usuario.",
          ],
        },
        {
          id: "brechas-seguridad",
          title: "11. Notificación de Brechas de Seguridad",
          content: [
            "En caso de producirse una violación de seguridad que comprometa los datos personales de los usuarios, FlashyLab se compromete a notificar a los usuarios afectados y a las autoridades de protección de datos competentes en un plazo máximo de setenta y dos (72) horas desde la confirmación del incidente.",
            "La notificación incluirá la naturaleza de la brecha, las categorías de datos afectados, las medidas adoptadas para mitigar los efectos y las recomendaciones para que los usuarios protejan su información.",
          ],
        },
        {
          id: "seguridad",
          title: "12. Medidas de Seguridad Técnicas y Organizativas",
          content: [
            "FlashyLab implementa y mantiene medidas de seguridad técnicas y organizativas estándar en la industria, incluyendo pero no limitándose a: cifrado de comunicaciones mediante HTTPS y TLS, almacenamiento de contraseñas con hash y salting, controles de acceso basados en roles y monitoreo continuo de actividad sospechosa.",
            "A pesar de estas medidas, el Usuario debe ser consciente de que ningún método de transmisión por Internet o de almacenamiento electrónico es absolutamente seguro. FlashyLab no puede garantizar la invulnerabilidad total frente a ataques informáticos sofisticados, filtraciones de datos derivadas de brechas en infraestructura de terceros o accesos no autorizados que escapen a controles técnicos razonables.",
          ],
        },
        {
          id: "cambios",
          title: "13. Modificaciones a esta Política de Privacidad",
          content: [
            "Esta Política de Privacidad puede ser actualizada periódicamente para reflejar cambios en nuestras prácticas de manejo de datos, optimizaciones de seguridad en los servicios de Supabase, modificaciones en los lineamientos de la API de Groq o adaptaciones a nuevos requisitos legales.",
            "Cualquier modificación sustancial será notificada de forma destacada dentro de la interfaz de la Aplicación, mediante la actualización visible de la fecha de vigencia de este documento y, cuando sea materialmente significativa, a través de una comunicación directa a los usuarios registrados.",
            "El uso continuado de los servicios de FlashyLab tras la publicación de los cambios constituye la aceptación y el consentimiento del Usuario hacia los nuevos términos de privacidad. Se recomienda revisar periódicamente esta página.",
          ],
        },
        {
          id: "contacto",
          title: "14. Contacto para Cuestiones de Privacidad",
          content: [
            "Para cualquier consulta, solicitud de ejercicio de derechos, reporte de incidentes de seguridad o preguntas relacionadas con esta Política de Privacidad, el Usuario puede contactar al equipo de FlashyLab a través de la funcionalidad de tickets de soporte disponible en la sección de Ayuda de la Aplicación.",
          ],
        },
      ]}
    />
  );
}

export default Policies;
