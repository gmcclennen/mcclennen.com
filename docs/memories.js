// Memory wall, backed by Supabase.
//
// SETUP: after creating the Supabase project and the `memories` table
// (see the SQL Claude/Gordon worked out), paste the project URL and anon
// public key below. Both values are meant to be public/client-side.
const SUPABASE_URL = "https://dsvjhmmnfjunkwabrtzz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_oSZ_xUe6OELppmvK6UXjzA_fqvJZtv3";

(function () {
  const form = document.getElementById("memory-form");
  const statusEl = document.getElementById("memory-form-status");
  const listEl = document.getElementById("memory-list");

  const isConfigured =
    SUPABASE_URL !== "YOUR_SUPABASE_URL" &&
    SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY" &&
    typeof supabase !== "undefined";

  if (!isConfigured) {
    listEl.innerHTML = "";
    const p = document.createElement("p");
    p.className = "memory-list-empty";
    p.textContent =
      "The memory wall is being set up. In the meantime, please email your memory using the address above.";
    listEl.appendChild(p);
    return;
  }

  const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  function formatDate(isoString) {
    try {
      return new Date(isoString).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return "";
    }
  }

  function renderMemories(rows) {
    listEl.innerHTML = "";

    if (!rows || rows.length === 0) {
      const p = document.createElement("p");
      p.className = "memory-list-empty";
      p.textContent = "No memories posted yet — be the first to share one.";
      listEl.appendChild(p);
      return;
    }

    rows.forEach((row) => {
      const item = document.createElement("article");
      item.className = "memory-item";

      const meta = document.createElement("p");
      meta.className = "memory-meta";
      meta.textContent = `${row.name} — ${formatDate(row.created_at)}`;

      const body = document.createElement("p");
      body.className = "memory-body";
      body.textContent = row.message;

      item.appendChild(meta);
      item.appendChild(body);
      listEl.appendChild(item);
    });
  }

  function prependMemory(row) {
    if (listEl.querySelector(".memory-list-empty")) {
      listEl.innerHTML = "";
    }
    const item = document.createElement("article");
    item.className = "memory-item";

    const meta = document.createElement("p");
    meta.className = "memory-meta";
    meta.textContent = `${row.name} — ${formatDate(row.created_at)}`;

    const body = document.createElement("p");
    body.className = "memory-body";
    body.textContent = row.message;

    item.appendChild(meta);
    item.appendChild(body);
    listEl.insertBefore(item, listEl.firstChild);
  }

  async function loadMemories() {
    listEl.innerHTML = '<p class="memory-list-loading">Loading memories&hellip;</p>';
    const { data, error } = await client
      .from("memories")
      .select("id, name, message, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      listEl.innerHTML = "";
      const p = document.createElement("p");
      p.className = "memory-list-empty";
      p.textContent =
        "Memories couldn't be loaded right now. Please try again later, or email your memory using the address above.";
      listEl.appendChild(p);
      return;
    }

    renderMemories(data);
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nameInput = document.getElementById("memory-name");
      const messageInput = document.getElementById("memory-message");
      const honeypot = document.getElementById("memory-website");

      const name = nameInput.value.trim();
      const message = messageInput.value.trim();

      statusEl.textContent = "";
      statusEl.className = "memory-form-status";

      // Honeypot tripped: silently "succeed" without posting anything.
      if (honeypot && honeypot.value.trim() !== "") {
        form.reset();
        statusEl.textContent = "Thank you for sharing a memory.";
        return;
      }

      if (!name || !message) return;

      const submitBtn = form.querySelector("button[type=submit]");
      submitBtn.disabled = true;

      const { data, error } = await client
        .from("memories")
        .insert({ name: name, message: message })
        .select()
        .single();

      submitBtn.disabled = false;

      if (error) {
        statusEl.textContent =
          "Sorry, something went wrong posting your memory. Please try again, or email it instead.";
        statusEl.className = "memory-form-status memory-form-status-error";
        return;
      }

      form.reset();
      statusEl.textContent = "Thank you for sharing a memory.";
      prependMemory(data);
    });
  }

  loadMemories();
})();
