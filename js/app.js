const app = document.getElementById("app");

function navigate(page) {
  if (page === "home") renderHome();
  if (page === "cities") renderCities();
  if (page === "budget") renderBudget();
  if (page === "visa") renderVisa();
}

/* HOME */
function renderHome() {
  app.innerHTML = `
    <h2>Welcome to TripOpt ✈️</h2>
    <p>Your smart travel planner.</p>
  `;
}

/* CITIES */
function renderCities() {
  app.innerHTML = `
    <h2>Cities</h2>
    <div class="grid">
      <div class="card">Tokyo 🇯🇵</div>
      <div class="card">Osaka 🇯🇵</div>
      <div class="card">Shanghai 🇨🇳</div>
      <div class="card">Fuji 🗻</div>
    </div>
  `;
}

/* BUDGET */
function renderBudget() {
  const saved = localStorage.getItem("budget") || "";

  app.innerHTML = `
    <h2>Budget Planner 💰</h2>
    <input id="budgetInput" placeholder="Enter budget" value="${saved}">
    <button class="primary" onclick="saveBudget()">Save</button>
    <p id="result"></p>
  `;
}

function saveBudget() {
  const value = document.getElementById("budgetInput").value;
  localStorage.setItem("budget", value);

  document.getElementById("result").innerText =
    "Saved: $" + value;
}

/* VISA */
function renderVisa() {
  app.innerHTML = `
    <h2>Visa Info 🛂</h2>
    <div class="card">
      Check visa requirements for your destination.
    </div>
  `;
}

/* INIT */
renderHome();
