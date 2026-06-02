import React from "react";
import TermsPoliciesTemplate from "./TermsPoliciesTemplate";

const Terms = () => {
  return (
    <TermsPoliciesTemplate
      title="Términos y Condiciones"
      description='Bienvenido a Flashy (en adelante, "la Aplicación"). Al registrarse, acceder o utilizar nuestra plataforma web o móvil, usted (en adelante, el "Usuario") acepta de manera expresa, voluntaria y sin reservas la totalidad de las cláusulas establecidas en este documento. Estos Términos y Condiciones constituyen un acuerdo legal vinculante entre el Usuario y los desarrolladores de Flashy. Si no está de acuerdo con alguna de las disposiciones aquí descritas, deberá abstenerse inmediatamente de utilizar la Aplicación.'
      date="Junio 2026"
      termsPoliciesList={[
        {
          id: "aceptacion",
          title: "1. Aceptación de los Términos",
          content: [
            "Al registrarse, acceder, descargar o utilizar Flashy, el Usuario acepta de manera expresa, voluntaria y sin reservas la totalidad de las cláusulas de este documento, así como cualquier modificación futura que sea debidamente notificada.",
            "Estos Términos y Condiciones constituyen un acuerdo legal vinculante entre el Usuario y los desarrolladores de Flashy. Se aplican a todas las interacciones con la Aplicación, incluyendo el acceso mediante navegador web, dispositivos móviles y cualquier otra plataforma compatible.",
            "Si el Usuario no está de acuerdo con alguna de las disposiciones aquí descritas, deberá abstenerse inmediatamente de acceder, utilizar o interactuar con la Aplicación, así como proceder a la eliminación de su cuenta y software asociado.",
          ],
        },
        {
          id: "elegibilidad",
          title: "2. Elegibilidad y Restricciones de Edad",
          content: [
            "Flashy está diseñado para usuarios mayores de 13 años. Los menores de 13 años no están autorizados a crear una cuenta ni a utilizar la Aplicación sin el consentimiento y la supervisión directa de un padre, madre o tutor legal.",
            "Los usuarios entre 13 y 17 años inclusive deben contar con el permiso explícito de su tutor legal para registrarse y utilizar la Aplicación. El tutor legal asume la plena responsabilidad por el cumplimiento de estos Términos y por las actividades realizadas por el menor dentro de la plataforma.",
            "Al crear una cuenta, el Usuario declara y garantiza que cumple con los requisitos de edad aplicables y que toda la información proporcionada durante el registro es veraz, precisa y completa.",
          ],
        },
        {
          id: "descripcion",
          title: "3. Descripción del Servicio",
          content: [
            "Flashy proporciona una plataforma digital interactiva diseñada para la asistencia al estudio y la organización del aprendizaje a través de herramientas como Flashcards, Cuestionarios, Verdadero o Falso, Guías de estudio, Simulaciones de examen y Juegos interactivos, potenciadas por tecnologías de Inteligencia Artificial.",
            "La Aplicación se reserva el derecho de modificar, suspender, actualizar o discontinuar cualquier funcionalidad, módulo o componente del servicio en cualquier momento, de forma temporal o permanente, con o sin previo aviso a los usuarios. Esto incluye, entre otros, cambios en la interfaz de usuario, los algoritmos de generación de contenido y los sistemas de créditos.",
            "El funcionamiento óptimo de Flashy requiere que todo recurso de estudio creado se asocie y estructure bajo una Categoría principal definida por el Usuario antes de su ejecución. La Aplicación no se responsabiliza por la organización o clasificación del contenido que el Usuario decida crear.",
          ],
        },
        {
          id: "cuentas",
          title: "4. Registro, Seguridad y Supabase",
          content: [
            "Para acceder a las funciones de almacenamiento, sincronización y persistencia de datos, el Usuario debe registrar una cuenta. La autenticación y el almacenamiento de datos son gestionados a través de la infraestructura de Supabase, un proveedor externo de servicios de backend.",
            "El Usuario es el único y exclusivo responsable de salvaguardar la confidencialidad de sus credenciales de acceso (correo electrónico y contraseña), asumiendo toda la responsabilidad por las actividades que ocurran bajo su cuenta. Se recomienda utilizar contraseñas robustas y únicas, y activar cualquier mecanismo de seguridad adicional que la plataforma ofrezca.",
            "Queda estrictamente prohibido realizar cualquier acción que busque vulnerar, descompilar, realizar ingeniería inversa, rastrear (crawl o scrape) o saturar las bases de datos y la infraestructura de Supabase que dan soporte a la Aplicación. La detección de dichas actividades resultará en la terminación inmediata y permanente de la cuenta.",
          ],
        },
        {
          id: "conducta",
          title: "5. Conducta del Usuario y Usos Prohibidos",
          content: [
            "El Usuario se compromete a utilizar Flashy exclusivamente para fines educativos lícitos, respetando en todo momento la legislación aplicable, los derechos de terceros y las normas de convivencia digital.",
            "Queda terminantemente prohibido: (a) introducir contenido difamatorio, obsceno, fraudulento, amenazante o que incite al odio; (b) suplantar la identidad de otras personas o entidades; (c) distribuir malware, virus o cualquier código malicioso; (d) utilizar la plataforma para actividades comerciales no autorizadas, spam o publicidad masiva; (e) extraer datos de otros usuarios mediante técnicas automatizadas.",
            "El Usuario es el único responsable del contenido que introduce manualmente en la Aplicación. Flashy no realiza moderación previa del contenido generado por los usuarios, pero se reserva el derecho de eliminar cualquier material que infrinja estos Términos sin previo aviso.",
          ],
        },
        {
          id: "inteligencia-artificial",
          title: "6. Integración de Inteligencia Artificial (Groq API)",
          content: [
            "Flashy integra modelos de lenguaje avanzados procesados a través de la API de Groq Cloud para automatizar la generación de recursos educativos tales como preguntas, opciones de respuesta, explicaciones y simulaciones de examen.",
            "El Usuario reconoce y acepta expresamente que los resultados generados por Inteligencia Artificial son el producto de un procesamiento estadístico automatizado y, por tanto, pueden contener imprecisiones, errores pedagógicos, contradicciones, sesgos o datos desactualizados conocidos técnicamente como alucinaciones de la IA.",
            "Flashy, sus desarrolladores y Groq no garantizan la veracidad, exactitud, idoneidad académica ni la validez oficial de ningún contenido generado por la IA. Es responsabilidad exclusiva del Usuario revisar, contrastar y verificar formalmente la información antes de utilizarla para fines escolares, universitarios, profesionales o de certificación.",
            "Queda terminantemente prohibido el uso de la interfaz de la Aplicación para introducir indicaciones (prompts) maliciosas, ofensivas, difamatorias, de contenido adulto, que violen derechos de autor, o que estén diseñadas para forzar a la IA a romper sus directrices de seguridad (jailbreaking). El incumplimiento derivará en la suspensión del servicio.",
          ],
        },
        {
          id: "creditos",
          title: "7. Sistema de Créditos y Política Anti-Abuso",
          content: [
            "Con el propósito de mantener la estabilidad operativa y respetar los límites de cuota de la API de Groq, Flashy implementa un sistema automatizado de créditos de generación de contenido. Cada Usuario dispone de una cuota inicial de 30 créditos de estudio principales, que se renovarán automáticamente cada doce (12) horas.",
            "Se establece un filtro de seguridad adicional consistente en un sub-sistema de 3 créditos que se recargan cada cinco (5) minutos, diseñado para impedir ráfagas automatizadas de peticiones y ataques de denegación de servicio (DoS) sobre la API de Groq.",
            "Está expresamente prohibido evadir, alterar, resetear o manipular este sistema de créditos mediante scripts, bots, extensiones de navegador, automatizaciones de software o la creación intencionada de múltiples cuentas. Cualquier conducta fraudulenta causará el baneo definitivo del dispositivo y la cuenta.",
          ],
        },
        {
          id: "publicidad",
          title: "8. Publicidad y Monetización",
          content: [
            "Flashy mantiene un modelo de acceso gratuito financiado mediante la inclusión de anuncios publicitarios. Se integran redes como Google AdSense en el entorno web y, potencialmente, Google AdMob en entornos móviles.",
            "Los anuncios se desplegarán de forma programada basándose en la actividad del Usuario, activándose aproximadamente cada dos (2) sesiones de estudio finalizadas. El Usuario acepta que Flashy no ejerce control sobre el contenido de los anuncios ni sobre las políticas de recopilación de datos de los proveedores de publicidad de terceros.",
            "Flashy se reserva el derecho de ofrecer planes de suscripción premium libres de publicidad en el futuro. Dichos cambios serán comunicados con la debida antelación.",
          ],
        },
        {
          id: "propiedad-intelectual",
          title: "9. Propiedad Intelectual y Derechos de Autor",
          content: [
            "La estructura de software, diseño de interfaz, código fuente, logotipos, nombre y la marca Flashy son propiedad intelectual protegida de sus respectivos desarrolladores. Queda prohibida su reproducción, distribución o modificación sin autorización previa por escrito.",
            "El Usuario retiene la propiedad intelectual exclusiva sobre los datos, textos y materiales que introduzca de forma manual en la Aplicación. Al subir contenido, el Usuario declara que posee los derechos necesarios sobre dicho material y que no infringe derechos de terceros.",
            "Al ingresar contenido en la Aplicación, el Usuario otorga a Flashy una licencia gratuita, mundial, no exclusiva y estrictamente técnica para almacenar, procesar, transmitir y mostrar dicha información con el único fin de proveer las funciones del servicio solicitadas.",
          ],
        },
        {
          id: "enlaces-terceros",
          title: "10. Enlaces y Servicios de Terceros",
          content: [
            "La Aplicación puede contener enlaces a sitios web o servicios de terceros que no son propiedad ni están controlados por Flashy. Estos enlaces se proporcionan únicamente para conveniencia del Usuario.",
            "Flashy no asume responsabilidad alguna por el contenido, las políticas de privacidad o las prácticas de los sitios web o servicios de terceros. El Usuario accede a dichos recursos bajo su propio riesgo y se recomienda revisar los términos y políticas de los mismos.",
          ],
        },
        {
          id: "terminacion",
          title: "11. Terminación y Suspensión de la Cuenta",
          content: [
            "Flashy se reserva el derecho de suspender o cancelar la cuenta de cualquier Usuario en cualquier momento, con o sin causa y con o sin previo aviso, especialmente en casos de violación de estos Términos, conducta fraudulenta o actividad que pueda perjudicar la integridad de la plataforma.",
            "El Usuario puede cancelar su cuenta en cualquier momento desde la sección de configuración de su perfil. Al cancelar la cuenta, los datos asociados serán eliminados conforme a lo establecido en nuestra Política de Privacidad.",
            "Tras la terminación de la cuenta, el Usuario pierde el acceso a todos los recursos de estudio, estadísticas y contenido almacenado en la plataforma, sin derecho a reembolso o compensación alguna.",
          ],
        },
        {
          id: "exclusion-garantias",
          title: "12. Exclusión de Garantías",
          content: [
            "Flashy se proporciona bajo el principio de tal cual (as is) y según disponibilidad (as available). No se otorga ninguna garantía, expresa o implícita, respecto al funcionamiento ininterrumpido, libre de errores o seguro de la Aplicación.",
            "No se garantiza que los resultados obtenidos mediante el uso de la IA sean precisos, completos o adecuados para ningún propósito específico. El Usuario utiliza la Aplicación bajo su propia responsabilidad y criterio.",
          ],
        },
        {
          id: "limitacion-responsabilidad",
          title: "13. Limitación de Responsabilidad",
          content: [
            "En la máxima medida permitida por las leyes aplicables, Flashy y sus desarrolladores no serán responsables por daños directos, indirectos, incidentales, especiales, punitivos o consecuentes derivados del uso o la imposibilidad de uso de la Aplicación.",
            "Esto incluye, de manera ilustrativa pero no limitativa, la reprobación de exámenes, la pérdida de becas u oportunidades académicas, la baja en el rendimiento escolar, perjuicios económicos, pérdida de datos, daños a dispositivos o cualquier perjuicio derivado de errores de la IA o indisponibilidad del servicio.",
            "La responsabilidad total de Flashy ante cualquier reclamación relacionada con el servicio no excederá, en ningún caso, la cantidad pagada por el Usuario a Flashy durante los doce (12) meses anteriores al evento que dio lugar a la reclamación.",
          ],
        },
        {
          id: "indemnizacion",
          title: "14. Indemnización",
          content: [
            "El Usuario acepta indemnizar, defender y eximir de toda responsabilidad a Flashy, sus desarrolladores, directivos y empleados frente a cualquier reclamación, demanda, daño, pérdida o gasto (incluidos honorarios legales razonables) que surja del incumplimiento de estos Términos o de la violación de derechos de terceros por parte del Usuario.",
          ],
        },
        {
          id: "resolucion-conflictos",
          title: "15. Legislación Aplicable y Resolución de Conflictos",
          content: [
            "Estos Términos y Condiciones se rigen e interpretan de acuerdo con las leyes de la República del Perú o la jurisdicción que resulte aplicable según las normas de conflicto de leyes vigentes.",
            "Cualquier controversia, disputa o reclamación que surja de o en relación con estos Términos será resuelta, en primera instancia, mediante negociación directa entre las partes. Si no se alcanza un acuerdo en un plazo de treinta (30) días naturales, las partes se someterán a la jurisdicción de los tribunales competentes.",
            "El Usuario acepta que cualquier reclamación deberá presentarse de forma individual y no como parte de una acción colectiva o demanda de clase.",
          ],
        },
        {
          id: "modificaciones",
          title: "16. Modificaciones a los Términos",
          content: [
            "Flashy se reserva el derecho de actualizar, corregir o reformular estos Términos y Condiciones en cualquier momento para adaptarlos a cambios legales, comerciales o técnicos. Las modificaciones entrarán en vigor en el momento de su publicación en la Aplicación.",
            "El uso continuo de Flashy tras la publicación de cualquier enmienda constituirá la aceptación plena de los nuevos Términos. Se recomienda al Usuario revisar periódicamente este documento para estar al tanto de las actualizaciones.",
            "En caso de modificaciones sustanciales, Flashy realizará esfuerzos razonables para notificar a los usuarios a través de la interfaz de la Aplicación o mediante comunicación electrónica.",
          ],
        },
        {
          id: "contacto",
          title: "17. Información de Contacto",
          content: [
            "Para consultas, reclamaciones o solicitudes de información relacionadas con estos Términos y Condiciones, el Usuario puede contactar al equipo de Flashy a través de los canales de soporte oficiales disponibles en la sección de Ayuda de la Aplicación o mediante la funcionalidad de tickets de soporte.",
          ],
        },
      ]}
    />
  );
};

export default Terms;
