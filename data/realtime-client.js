// Set this to the deployed realtime service origin, e.g. https://vks-realty-realtime.example.com
window.VKS_REALTIME_URL = window.VKS_REALTIME_URL || "";

(() => {
  const api = (window.VKS_REALTIME_URL || "").replace(/\/$/, "");
  const params = new URLSearchParams(location.search);
  const status = document.querySelector("#collabStatus");
  const startButton = document.querySelector("#startSession");
  const inviteInput = document.querySelector("#inviteLink");
  const copyButton = document.querySelector("#copyInvite");
  if (!status || !startButton || !inviteInput || !copyButton) return;

  let active = null;
  let applyingRemote = false;
  let events = null;
  const setStatus = (message) => { status.textContent = message; };

  async function broadcast(hotspotId = null) {
    if (!api || !active || applyingRemote) return;
    const project = window.VKS_PROJECTS.find((item) => item.id === paramsProject());
    const scene = window.VKS_SCENES.find((item) => item.id === paramsScene());
    if (!project || !scene) return;
    try {
      const response = await fetch(api + "/api/sessions/" + encodeURIComponent(active.id) +
        "/state?token=" + encodeURIComponent(active.token), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId: project.id, sceneId: scene.id, hotspotId }),
        });
      if (!response.ok) throw new Error("Could not sync the shared view");
    } catch {
      setStatus("Connection interrupted. Reconnecting…");
    }
  }

  function paramsProject() {
    return new URLSearchParams(location.search).get("project") ||
      window.VKS_PROJECTS[0]?.id;
  }
  function paramsScene() {
    return new URLSearchParams(location.search).get("scene") ||
      window.VKS_SCENES[0]?.id;
  }

  function connect(id, token) {
    active = { id, token };
    if (events) events.close();
    events = new EventSource(api + "/api/sessions/" + encodeURIComponent(id) +
      "/events?token=" + encodeURIComponent(token));
    events.addEventListener("state", (event) => {
      const state = JSON.parse(event.data);
      applyingRemote = true;
      const url = new URL(location.href);
      url.searchParams.set("project", state.projectId);
      url.searchParams.set("scene", state.sceneId);
      history.replaceState({}, "", url);
      const projectSelect = document.querySelector("#projectSelect");
      const sceneButton = document.querySelector('[data-scene="' +
        window.VKS_SCENES.findIndex((item) => item.id === state.sceneId) + '"]');
      if (projectSelect && projectSelect.value !== state.projectId) {
        projectSelect.value = state.projectId;
        projectSelect.dispatchEvent(new Event("change"));
      } else if (sceneButton) {
        sceneButton.click();
      }
      if (state.hotspotId) {
        const marker = document.querySelector('[data-hotspot="' + state.hotspotId + '"]');
        if (marker) marker.click();
      }
      applyingRemote = false;
      setStatus("Connected · project, room and hotspot are synchronised.");
    });
    events.addEventListener("expired", () => {
      events.close();
      active = null;
      setStatus("This shared session has expired.");
    });
    events.onerror = () => setStatus("Reconnecting to the private session…");
  }

  startButton.addEventListener("click", async () => {
    if (!api) {
      setStatus("Service not deployed yet. Deploy the Node service in /realtime, then set window.VKS_REALTIME_URL in this file.");
      return;
    }
    startButton.disabled = true;
    setStatus("Creating a private session…");
    try {
      const response = await fetch(api + "/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: paramsProject(), sceneId: paramsScene() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Session creation failed");
      const invite = new URL(location.href);
      invite.searchParams.set("session", data.session.id);
      invite.searchParams.set("token", data.guestToken);
      inviteInput.value = invite.toString();
      copyButton.disabled = false;
      connect(data.session.id, data.hostToken);
      setStatus("Private session ready. Invite link expires at " +
        new Date(data.session.expiresAt).toLocaleTimeString() + ".");
    } catch (error) {
      setStatus(error.message);
    } finally {
      startButton.disabled = false;
    }
  });

  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(inviteInput.value);
      copyButton.textContent = "Copied ✓";
    } catch {
      inviteInput.select();
      setStatus("Select and copy the invitation link manually.");
    }
  });

  document.querySelector("#projectSelect").addEventListener("change", () => {
    if (active && !applyingRemote) setTimeout(() => broadcast(null), 0);
  });
  document.querySelector("#sceneList").addEventListener("click", (event) => {
    if (active && !applyingRemote && event.target.closest("[data-scene]")) {
      setTimeout(() => broadcast(null), 0);
    }
  });
  document.querySelector("#prev").addEventListener("click", () => setTimeout(() => broadcast(null), 0));
  document.querySelector("#next").addEventListener("click", () => setTimeout(() => broadcast(null), 0));
  document.querySelector("#hotspotButtons").addEventListener("click", (event) => {
    const marker = event.target.closest("[data-hotspot]");
    if (marker && !applyingRemote) setTimeout(() => broadcast(marker.dataset.hotspot), 0);
  });

  const sessionId = params.get("session");
  const guestToken = params.get("token");
  if (api && sessionId && guestToken) {
    connect(sessionId, guestToken);
    setStatus("Joining the private exploration…");
  }
})();
