// This script provides the functionalities of the application overview including
//    - Loading of published applications
//    - Filter of applications
//    - Sorting of applications
//    - Visualisation of applications
//    - Sponsoring functionalities
//    - Navigationbar

import { db } from "./firebase-config.js";
import {
  collection,
  serverTimestamp,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  increment
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const container = document.getElementById("applications-container");

async function loadApplications() {
  const urlParams = new URLSearchParams(window.location.search);
  const filterByIdFromURL = urlParams.get("id")?.toLowerCase() || null;
  if (filterByIdFromURL) {
    const filterIdField = document.getElementById("filter-id");
    if (filterIdField) filterIdField.value = filterByIdFromURL;
  }


  const nameFilter = document.getElementById("filter-name")?.value?.toLowerCase() || "";
  const goalFilter = parseFloat(document.getElementById("filter-goal")?.value) || null;
  const idFilter = document.getElementById("filter-id")?.value?.toLowerCase() || "";
  const sortBy = document.getElementById("sort-by")?.value || "date";

  const container = document.getElementById("applications-container");
  container.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "applications"));
  let apps = [];

  for (const docSnap of querySnapshot.docs) {
    const data = docSnap.data();
    const docId = docSnap.id;
    if (data.status !== "veröffentlicht") continue;
    apps.push({ docId, data });
  }

  // Filter
  apps = apps.filter(({ docId, data }) => {
    const nameMatch = !nameFilter || data.name?.toLowerCase().includes(nameFilter);
    const idMatch = filterByIdFromURL
      ? docId.toLowerCase() === filterByIdFromURL
      : docId.toLowerCase().includes(idFilter);
    const goalMatch = goalFilter === null || data.amount === goalFilter;

    const collected = data.collectedAmount || 0;
    const goal = data.amount || 1;
    return nameMatch && idMatch && goalMatch;
  });

  // Sorting
  apps.sort((a, b) => {
  const getProgress = (app) => (app.data.collectedAmount || 0) / (app.data.amount || 1);

  switch (sortBy) {
    case "date_asc":
      return (a.data.submittedAt?.seconds || 0) - (b.data.submittedAt?.seconds || 0);
    case "date_desc":
      return (b.data.submittedAt?.seconds || 0) - (a.data.submittedAt?.seconds || 0);
    case "goal_asc":
      return (a.data.amount || 0) - (b.data.amount || 0);
    case "goal_desc":
      return (b.data.amount || 0) - (a.data.amount || 0);
    case "progress_asc":
      return getProgress(a) - getProgress(b);
    case "progress_desc":
      return getProgress(b) - getProgress(a);
    default:
      return 0; // Keine Sortierung
  }
});

  // Show Applications
  for (const { docId, data } of apps) {
    const appDiv = document.createElement("div");
    appDiv.className = "application-card";

    const title = document.createElement("h2");
    title.textContent = data.title || "Unbenannte Bewerbung";

    const toggleBtn = document.createElement("button");
    toggleBtn.textContent = "⬇️ Mehr";
    toggleBtn.className = "toggle-description";

    const desc = document.createElement("p");
    desc.textContent = data.description || "Keine Beschreibung vorhanden.";
    desc.style.display = "none";

    toggleBtn.addEventListener("click", () => {
      const visible = desc.style.display === "block";
      desc.style.display = visible ? "none" : "block";
      toggleBtn.textContent = visible ? "⬇️ Mehr" : "⬆️ Weniger";
    });

    const barWrapper = document.createElement("div");
    barWrapper.className = "bar-wrapper";

    const barContainer = document.createElement("div");
    barContainer.className = "bar-container";

    const barFill = document.createElement("div");
    barFill.className = "bar-fill";

    const target = data.amount || 1000;
    const collected = data.collectedAmount || 0;
    const percentage = Math.min((collected / target) * 100, 100);

    barFill.style.width = `${percentage}%`;

    const collectedLabel = document.createElement("span");
    collectedLabel.className = "bar-label";
    collectedLabel.textContent = `${collected} € gesammelt`;

    const targetLabel = document.createElement("span");
    targetLabel.className = "target-label";
    targetLabel.textContent = `Ziel: ${target} €`;

    barContainer.appendChild(barFill);
    barWrapper.appendChild(collectedLabel);
    barWrapper.appendChild(barContainer);
    barWrapper.appendChild(targetLabel);

    // sponsoring functionalities
    const supportBtn = document.createElement("button");
    supportBtn.textContent = "Unterstützen";
    supportBtn.className = "support-button";
    supportBtn.onclick = () => {
      const form = document.createElement("div");
      form.className = "donation-form";

      const amountInput = document.createElement("input");
      amountInput.type = "number";
      amountInput.placeholder = "Betrag in €";
      amountInput.min = 1;
      amountInput.required = true;

      const confirmBtn = document.createElement("button");
      confirmBtn.textContent = "Spende abschicken";

      const cancelBtn = document.createElement("button");
      cancelBtn.textContent = "Abbrechen";
      cancelBtn.style.marginLeft = "1em";

      const nameInput = document.createElement("input");
      nameInput.type = "text";
      nameInput.placeholder = "Name (optional)";

      form.appendChild(nameInput);
      form.appendChild(amountInput);
      form.appendChild(confirmBtn);
      form.appendChild(cancelBtn);
      appDiv.appendChild(form);

      supportBtn.disabled = true;

      cancelBtn.onclick = () => {
        form.remove();
        supportBtn.disabled = false;
      };

      confirmBtn.onclick = async () => {
        const amount = parseFloat(amountInput.value);
        const name = nameInput.value.trim();
        if (isNaN(amount) || amount <= 0) {
          alert("Bitte gib einen gültigen Betrag ein.");
          return;
        }

        try {
          const appRef = doc(db, "applications", docId);
          await updateDoc(appRef, {
            collectedAmount: increment(amount)
          });

          const donationRef = collection(appRef, "donations");
          await addDoc(donationRef, {
            amount,
            name: name || "Anonym",
            createdAt: serverTimestamp()
          });
          alert(`Vielen Dank für deine Spende von ${amount} €!`);
          location.reload();
        } catch (err) {
          console.error(err);
          alert("Fehler beim Spenden.");
        }
      };
    };

    const donationList = document.createElement("div");
    donationList.className = "donation-list";
    donationList.innerHTML = "<strong>Letzte Spenden:</strong><br>Lade…";

    const appRef = doc(db, "applications", docId);
    const donationsRef = collection(appRef, "donations");
    const donationSnap = await getDocs(donationsRef);

    const donations = donationSnap.docs
      .map((d) => d.data())
      .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds)
      .slice(0, 5);

    donationList.innerHTML = "<strong>Letzte Spenden:</strong><br>";
    if (donations.length === 0) {
      donationList.innerHTML += "<em>Noch keine Spenden</em>";
    } else {
      for (const donation of donations) {
        const date = donation.createdAt?.toDate().toLocaleDateString("de-DE") || "";
        const name = donation.name || "Anonym";
        donationList.innerHTML += `💶 ${donation.amount} € von <strong>${name}</strong> am ${date}<br>`;
      }
    }

    appDiv.appendChild(title);
    appDiv.appendChild(toggleBtn);
    appDiv.appendChild(desc);
    appDiv.appendChild(barWrapper);
    appDiv.appendChild(supportBtn);
    appDiv.appendChild(donationList);
    container.appendChild(appDiv);
  }
}

// Filter live 
window.addEventListener("DOMContentLoaded", () => {
  loadApplications();

  ["filter-name", "filter-goal", "filter-id", "filter-progress", "sort-by"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      const eventType = el.tagName === "SELECT" ? "change" : "input";
      el.addEventListener(eventType, loadApplications);
    }
  });
});

//Filter at Button-Klick 
document.getElementById("apply-filters")?.addEventListener("click", () => {
  loadApplications();
});

//Navbar
fetch("components/navbar.html")
  .then((res) => res.text())
  .then((html) => {
    document.getElementById("navbar-placeholder").innerHTML = html;

    // Auth-dependend view
    import("./firebase-config.js").then(({ auth }) => {
      import("https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js").then(({ onAuthStateChanged, signOut }) => {
        onAuthStateChanged(auth, (user) => {
          const login = document.getElementById("nav-login");
          const logout = document.getElementById("nav-logout");

          if (user) {
            login.style.display = "none";
            logout.style.display = "inline";
            logout.onclick = () => {
              signOut(auth).then(() => (window.location.href = "index.html"));
            };
          } else {
            login.style.display = "inline";
            logout.style.display = "none";
          }
        });
      });
    });
  });
