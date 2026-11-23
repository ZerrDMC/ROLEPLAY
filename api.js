
/*
 OXFORD LIFE - CONECTOR DE IA

 Configurá tu backend cuando lo tengas.
 No pongas claves privadas de proveedores de IA
 directamente en este archivo público.
*/

const AI_CONFIG = {
  endpoint: "",

  // Ejemplo de endpoint:
  // endpoint: "https://tu-servidor.com/api/chat"

  enabled: false
};

async function requestAI(payload) {
  if (!AI_CONFIG.enabled || !AI_CONFIG.endpoint) {
    throw new Error("La IA todavía no está configurada.");
  }

  const response = await fetch(AI_CONFIG.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
      // Agregá aquí los encabezados necesarios
      // para tu backend.
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Error del servidor: " + response.status);
  }

  const data = await response.json();

  if (!data.reply || typeof data.reply !== "string") {
    throw new Error("El servidor no devolvió una respuesta válida.");
  }

  return data;
}

function buildSimulationPrompt(context) {
  return {
    system: `
Sos el motor narrativo de una simulación de vida realista.

IDIOMA:
- Respondé exclusivamente en español.
- Usá diálogos naturales y creíbles.

REGLAS FUNDAMENTALES:
1. Cada personaje tiene su propia personalidad, historia y comportamiento.
2. Nadie puede conocer los pensamientos privados de otro personaje.
3. Nunca reveles pensamientos internos de personajes ajenos.
4. Narrá únicamente acciones observables, diálogos y acontecimientos.
5. No controles las decisiones, palabras ni acciones del personaje del usuario.
6. No inventes que el usuario hizo algo que no escribió.
7. Los personajes pueden interactuar entre ellos sin depender siempre del usuario.
8. Mantené continuidad con los acontecimientos anteriores.
9. Los personajes no conocen información que nunca presenciaron o escucharon.
10. Evitá respuestas repetitivas y comportamientos artificiales.
11. Respetá las edades, personalidades y relaciones establecidas.
12. No conviertas cada interacción en una conversación dirigida al usuario.

FORMATO:
- Acciones: *Emily deja su mochila sobre la mesa.*
- Diálogos: —Hola, ¿cómo estás?
- Acontecimientos: describí únicamente lo que sucede y puede observarse.

REGLA DE PUNTO DE VISTA:
La narración no debe entrar en la mente de los personajes.
No escribas cosas como "Emily piensa", "Jake siente secretamente"
o "Sophie sabe que...".
Podés describir expresiones, gestos, palabras y comportamientos visibles.

PERSONAJE DEL USUARIO:
No lo controles. El usuario decide qué hace, dice y cómo reacciona.

CONTEXTO DE SIMULACIÓN:
${JSON.stringify(context)}
    `.trim(),

    instruction: "Continuá la simulación respetando todas las reglas."
  };
}

/*
 FORMATO ESPERADO DEL BACKEND:

 Petición:
 {
   "system": "...",
   "instruction": "...",
   "context": {
     "player": {},
     "character": {},
     "world": {},
     "history": []
   },
   "message": "..."
 }

 Respuesta:
 {
   "reply": "*Emily levanta la mirada.* —Hola.",
   "characterId": "123"
 }

 El backend puede devolver también:
 {
   "events": [],
   "updatedMemory": {},
   "activeCharacters": []
 }
*/
