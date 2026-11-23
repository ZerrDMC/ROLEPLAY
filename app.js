
/* =====================================
   OXFORD LIFE - APLICACIÓN PRINCIPAL
===================================== */

const $ = id => document.getElementById(id);

const DB_KEY = "oxford_life_v1";

const defaultData = {
  player: {
    name: "Mi personaje",
    age: 18,
    gender: "",
    appearance: "",
    personality: "",
    history: "",
    wardrobe: {
      top: "Remera",
      topColor: "Negro",
      bottom: "Jeans",
      bottomColor: "Azul oscuro",
      shoes: "Zapatillas",
      accessories: "",
      other: ""
    }
  },

  world: {
    location: "Oxford, Mississippi, Estados Unidos",
    description:
      "Una ciudad universitaria estadounidense. La vida cotidiana continúa independientemente de las acciones del usuario."
  },

  characters: [
    {
      id: "emily",
      name: "Emily Carter",
      age: 20,
      gender: "Femenino",
      avatar: "👩🏻",
      personality: "Sociable, inteligente, sarcástica y reservada con desconocidos.",
      appearance: "Cabello castaño, ojos marrones.",
      history: "Estudia en la universidad de Oxford.",
      occupation: "Estudiante",
      greeting: "*Emily está sentada en una cafetería mirando su teléfono. Levanta la mirada al verte.* —Hola."
    },
    {
      id: "jake",
      name: "Jake Miller",
      age: 21,
      gender: "Masculino",
      avatar: "👨🏻",
      personality: "Extrovertido, bromista y competitivo.",
      appearance: "Cabello oscuro, complexión atlética.",
      history: "Vive cerca del campus universitario.",
      occupation: "Estudiante",
      greeting: "*Jake entra en la cafetería con una mochila al hombro.* —Buenas."
    },
    {
      id: "sophie",
      name: "Sophie Williams",
      age: 19,
      gender: "Femenino",
      avatar: "👩🏼",
      personality: "Amable, observadora y directa.",
      appearance: "Cabello rubio, ojos claros.",
      history: "Trabaja algunas tardes en una cafetería.",
      occupation: "Estudiante y camarera",
      greeting: "*Sophie termina de acomodar unas tazas detrás del mostrador.* —Hola, ¿qué vas a pedir?"
    },
    {
      id: "daniel",
      name: "Daniel Brooks",
      age: 23,
      gender: "Masculino",
      avatar: "👨🏽",
      personality: "Serio, tranquilo y responsable.",
      appearance: "Cabello castaño y barba corta.",
      history: "Trabaja en un restaurante local.",
      occupation: "Camarero",
      greeting: "*Daniel deja una bandeja sobre una mesa.* —Disculpá, ¿esta mesa está ocupada?"
    }
  ],

  conversations: {},
  activeCharacterId: null
};

function loadData() {
  try {
    const saved = localStorage.getItem(DB_KEY);
    if (!saved) return structuredClone(defaultData);

    const data = JSON.parse(saved);

    return {
      ...structuredClone(defaultData),
      ...data,
      player: {
        ...defaultData.player,
        ...data.player,
        wardrobe: {
          ...defaultData.player.wardrobe,
          ...(data.player?.wardrobe || {})
        }
      },
      world: {
        ...defaultData.world,
        ...data.world
      },
      characters: Array.isArray(data.characters)
        ? data.characters
        : structuredClone(defaultData.characters),
      conversations: data.conversations || {}
    };
  } catch (error) {
    console.error(error);
    return structuredClone(defaultData);
  }
}

let db = loadData();
let editingCharacterId = null;
let isSending = false;

function saveData() {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function makeId() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/* =====================================
   NAVEGACIÓN
===================================== */

const pageNames = {
  chat: "CONVERSACIONES",
  explore: "EXPLORAR",
  profile: "MI PERSONAJE",
  wardrobe: "VESTUARIO",
  characters: "PERSONAJES",
  settings: "CONFIGURACIÓN"
};

function navigate(page) {
  document.querySelectorAll(".page").forEach(el => {
    el.classList.remove("active");
  });

  document.querySelectorAll(".nav-btn").forEach(el => {
    el.classList.toggle("active", el.dataset.page === page);
  });

  $("page-" + page).classList.add("active");
  $("pageTitle").textContent = pageNames[page];

  if (page === "explore") renderExplore();
  if (page === "characters") renderMyCharacters();
  if (page === "profile") fillProfile();
  if (page === "wardrobe") fillWardrobe();
}

document.querySelectorAll(".nav-btn").forEach(button => {
  button.addEventListener("click", () => navigate(button.dataset.page));
});

/* =====================================
   PERFIL DEL JUGADOR
===================================== */

function fillProfile() {
  const p = db.player;

  $("profileName").value = p.name;
  $("profileAge").value = p.age;
  $("profileGender").value = p.gender;
  $("profileAppearance").value = p.appearance;
  $("profilePersonality").value = p.personality;
  $("profileHistory").value = p.history;
}

function saveProfile() {
  db.player.name = $("profileName").value.trim() || "Mi personaje";
  db.player.age = Number($("profileAge").value) || 18;
  db.player.gender = $("profileGender").value;
  db.player.appearance = $("profileAppearance").value;
  db.player.personality = $("profilePersonality").value;
  db.player.history = $("profileHistory").value;

  saveData();
  updateUser();
  notify("Personaje guardado.");
}

$("saveProfile").addEventListener("click", saveProfile);

function updateUser() {
  $("miniName").textContent = db.player.name;
  $("miniAvatar").textContent =
    db.player.name.charAt(0).toUpperCase() || "D";
}

/* =====================================
   VESTUARIO
===================================== */

function fillWardrobe() {
  const w = db.player.wardrobe;

  $("clothingTop").value = w.top;
  $("clothingTopColor").value = w.topColor;
  $("clothingBottom").value = w.bottom;
  $("clothingBottomColor").value = w.bottomColor;
  $("clothingShoes").value = w.shoes;
  $("clothingAccessories").value = w.accessories;
  $("clothingOther").value = w.other;
}

function saveWardrobe() {
  db.player.wardrobe = {
    top: $("clothingTop").value,
    topColor: $("clothingTopColor").value,
    bottom: $("clothingBottom").value,
    bottomColor: $("clothingBottomColor").value,
    shoes: $("clothingShoes").value,
    accessories: $("clothingAccessories").value,
    other: $("clothingOther").value
  };

  saveData();
  notify("Vestuario actualizado.");
}

$("saveWardrobe").addEventListener("click", saveWardrobe);

/* =====================================
   PERSONAJES
===================================== */

function characterCard(c) {
  return `
    <article class="character-card">
      <div class="avatar-big">${escapeHTML(c.avatar || "👤")}</div>
      <h3>${escapeHTML(c.name)}</h3>
      <p>${escapeHTML(c.age)} años · ${escapeHTML(c.occupation || "Sin ocupación")}</p>
      <p>${escapeHTML(c.personality)}</p>
      <div class="card-actions">
        <button class="primary-btn" data-action="chat" data-id="${escapeHTML(c.id)}">
          Conversar
        </button>
        <button class="secondary-btn" data-action="edit" data-id="${escapeHTML(c.id)}">
          Editar
        </button>
        <button class="secondary-btn" data-action="delete" data-id="${escapeHTML(c.id)}">
          Eliminar
        </button>
      </div>
    </article>
  `;
}

function renderExplore() {
  const query = $("searchCharacters").value.toLowerCase();

  const filtered = db.characters.filter(c =>
    (c.name + " " + c.personality + " " + c.occupation)
      .toLowerCase().includes(query)
  );

  $("exploreGrid").innerHTML = filtered.length
    ? filtered.map(characterCard).join("")
    : "<p>No se encontraron personajes.</p>";
}

function renderMyCharacters() {
  $("myCharactersGrid").innerHTML = db.characters.length
    ? db.characters.map(characterCard).join("")
    : "<p>No hay personajes creados.</p>";
}

function openCharacterModal(character = null) {
  editingCharacterId = character?.id || null;

  $("modalTitle").textContent = character
    ? "Editar personaje"
    : "Crear personaje";

  $("characterId").value = character?.id || "";
  $("characterName").value = character?.name || "";
  $("characterAge").value = character?.age || 18;
  $("characterGender").value = character?.gender || "";
  $("characterPersonality").value = character?.personality || "";
  $("characterAppearance").value = character?.appearance || "";
  $("characterHistory").value = character?.history || "";
  $("characterOccupation").value = character?.occupation || "";
  $("characterGreeting").value = character?.greeting || "";
  $("characterAvatar").value = character?.avatar || "👤";

  $("characterModal").classList.remove("hidden");
}

function closeCharacterModal() {
  $("characterModal").classList.add("hidden");
  editingCharacterId = null;
}

$("closeModal").addEventListener("click", closeCharacterModal);
$("createCharacterBtn").addEventListener("click", () => openCharacterModal());
$("createCharacterExplore").addEventListener("click", () => openCharacterModal());

$("characterModal").addEventListener("click", event => {
  if (event.target === $("characterModal")) closeCharacterModal();
});

$("characterForm").addEventListener("submit", event => {
  event.preventDefault();

  const character = {
    id: editingCharacterId || makeId(),
    name: $("characterName").value.trim(),
    age: Number($("characterAge").value),
    gender: $("characterGender").value,
    personality: $("characterPersonality").value,
    appearance: $("characterAppearance").value,
    history: $("characterHistory").value,
    occupation: $("characterOccupation").value,
    greeting: $("characterGreeting").value,
    avatar: $("characterAvatar").value || "👤"
  };

  if (editingCharacterId) {
    const index = db.characters.findIndex(c => c.id === editingCharacterId);
    if (index !== -1) db.characters[index] = character;
  } else {
    db.characters.push(character);
  }

  saveData();
  closeCharacterModal();
  renderExplore();
  renderMyCharacters();
  notify("Personaje guardado.");
});

function deleteCharacter(id) {
  const character = db.characters.find(c => c.id === id);
  if (!character) return;

  if (!confirm("¿Eliminar a " + character.name + "?")) return;

  db.characters = db.characters.filter(c => c.id !== id);

  if (db.activeCharacterId === id) {
    db.activeCharacterId = null;
  }

  saveData();
  renderExplore();
  renderMyCharacters();
  renderConversationList();
  renderMessages();
}

document.addEventListener("click", event => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const id = button.dataset.id;
  const action = button.dataset.action;
  const character = db.characters.find(c => c.id === id);

  if (action === "chat" && character) openConversation(id);
  if (action === "edit" && character) openCharacterModal(character);
  if (action === "delete") deleteCharacter(id);
});

$("searchCharacters").addEventListener("input", renderExplore);

/* =====================================
   CONVERSACIONES
===================================== */

function getConversation(id) {
  if (!db.conversations[id]) {
    db.conversations[id] = {
      id,
      messages: [],
      memory: {},
      updatedAt: Date.now()
    };
  }

  return db.conversations[id];
}

function openConversation(id) {
  const character = db.characters.find(c => c.id === id);
  if (!character) return;

  db.activeCharacterId = id;

  const conversation = getConversation(id);

  if (conversation.messages.length === 0 && character.greeting) {
    conversation.messages.push({
      role: "character",
      characterId: id,
      name: character.name,
      text: character.greeting,
      timestamp: Date.now()
    });
  }

  saveData();
  renderConversationList();
  renderMessages();

  $("chatName").textContent = character.name;
  $("chatAvatar").textContent = character.avatar || "👤";
  $("chatDescription").textContent =
    character.age + " años · " + (character.occupation || "Habitante de Oxford");

  navigate("chat");
}

function renderConversationList() {
  const list = $("conversationList");

  const ids = Object.keys(db.conversations);

  if (!ids.length) {
    list.innerHTML = '<p class="small">Todavía no tenés chats.</p>';
    return;
  }

  list.innerHTML = ids.map(id => {
    const c = db.characters.find(x => x.id === id);
    if (!c) return "";

    const conversation = db.conversations[id];
    const last = conversation.messages.at(-1)?.text || "Sin mensajes";

    return `
      <div class="conversation-item ${
        db.activeCharacterId === id ? "selected" : ""
      }" data-conversation="${escapeHTML(id)}">
        <div class="conversation-avatar">${escapeHTML(c.avatar || "👤")}</div>
        <div>
          <strong>${escapeHTML(c.name)}</strong>
          <small>${escapeHTML(last.slice(0, 35))}</small>
        </div>
      </div>
    `;
  }).join("");
}

$("conversationList").addEventListener("click", event => {
  const item = event.target.closest("[data-conversation]");
  if (item) openConversation(item.dataset.conversation);
});

$("newChatBtn").addEventListener("click", () => navigate("explore"));

function renderMessages() {
  const box = $("messages");
  const id = db.activeCharacterId;

  if (!id) {
    box.innerHTML = `
      <div class="empty-state">
        <div>💬</div>
        <h2>Tu historia comienza aquí</h2>
        <p>Elegí un personaje para conversar.</p>
      </div>`;
    return;
  }

  const conversation = getConversation(id);

  if (!conversation.messages.length) {
    box.innerHTML = '<div class="empty-state"><p>Sin mensajes todavía.</p></div>';
    return;
  }

  box.innerHTML = conversation.messages.map(m => {
    if (m.role === "system") {
      return `
        <div class="message system">
          <div class="message-text">${escapeHTML(m.text)}</div>
        </div>`;
    }

    const isPlayer = m.role === "player";

    const avatar = isPlayer
      ? db.player.name.charAt(0).toUpperCase()
      : (db.characters.find(c => c.id === id)?.avatar || "👤");

    return `
      <div class="message ${isPlayer ? "player" : ""}">
        <div class="message-avatar">${escapeHTML(avatar)}</div>
        <div class="message-content">
          <div class="message-name">${escapeHTML(m.name)}</div>
          <div class="message-text">${escapeHTML(m.text)}</div>
        </div>
      </div>`;
  }).join("");

  box.scrollTop = box.scrollHeight;
}

/* =====================================
   ENVÍO DE MENSAJES
===================================== */

async function sendMessage() {
  if (isSending) return;

  const text = $("messageInput").value.trim();
  const id = db.activeCharacterId;

  if (!text) return;

  if (!id) {
    notify("Primero elegí un personaje.");
    return;
  }

  if (!db.player.name || db.player.name === "Mi personaje") {
    notify("Primero configurá tu personaje.");
    navigate("profile");
    return;
  }

  const character = db.characters.find(c => c.id === id);
  if (!character) return;

  const conversation = getConversation(id);

  conversation.messages.push({
    role: "player",
    name: db.player.name,
    text,
    timestamp: Date.now()
  });

  $("messageInput").value = "";
  saveData();
  renderMessages();

  isSending = true;
  $("sendBtn").disabled = true;
  $("typingIndicator").classList.remove("hidden");

  try {
    const context = {
      player: db.player,
      character,
      world: db.world,
      history: conversation.messages.slice(-40),
      memory: conversation.memory || {}
    };

    const prompt = buildSimulationPrompt(context);

    const result = await requestAI({
      ...prompt,
      message: text,
      context
    });

    conversation.messages.push({
      role: "character",
      characterId: id,
      name: character.name,
      text: result.reply,
      timestamp: Date.now()
    });

    if (result.updatedMemory) {
      conversation.memory = result.updatedMemory;
    }

    saveData();
    renderMessages();

  } catch (error) {
    console.error(error);

    conversation.messages.push({
      role: "system",
      name: "Sistema",
      text: "No se pudo obtener una respuesta de la IA. Revisá la configuración de tu conexión.",
      timestamp: Date.now()
    });

    saveData();
    renderMessages();

  } finally {
    isSending = false;
    $("sendBtn").disabled = false;
    $("typingIndicator").classList.add("hidden");
  }
}

$("sendBtn").addEventListener("click", sendMessage);

$("messageInput").addEventListener("keydown", event => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});

/* =====================================
   INFORMACIÓN DEL CHAT
===================================== */

$("chatInfoBtn").addEventListener("click", () => {
  const c = db.characters.find(x => x.id === db.activeCharacterId);
  if (!c) return;

  alert(
    c.name + "\n\n" +
    "Edad: " + c.age + "\n\n" +
    "Personalidad: " + c.personality + "\n\n" +
    "Historia: " + c.history
  );
});

/* =====================================
   CONFIGURACIÓN DEL MUNDO
===================================== */

function fillWorld() {
  $("worldLocation").value = db.world.location;
  $("worldDescription").value = db.world.description;
  $("locationHeader").textContent = db.world.location;
}

$("saveWorld").addEventListener("click", () => {
  db.world.location = $("worldLocation").value;
  db.world.description = $("worldDescription").value;

  saveData();
  fillWorld();
  notify("Mundo actualizado.");
});

/* =====================================
   UTILIDADES
===================================== */

function notify(message) {
  alert(message);
}

$("deleteData").addEventListener("click", () => {
  if (!confirm("¿Seguro que querés borrar todos tus datos?")) return;

  localStorage.removeItem(DB_KEY);
  location.reload();
});

/* =====================================
   INICIALIZACIÓN
===================================== */

function init() {
  updateUser();
  fillProfile();
  fillWardrobe();
  fillWorld();

  renderExplore();
  renderMyCharacters();
  renderConversationList();
  renderMessages();

  if (AI_CONFIG.enabled && AI_CONFIG.endpoint) {
    $("connectionStatus").textContent = "IA configurada";
  } else {
    $("connectionStatus").textContent = "IA no conectada";
  }
}

init();
  
