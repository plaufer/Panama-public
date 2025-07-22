// This script provides the functionalities of the application including
//    - Logout
//    - Edit profile
//    - Save profile
//    - display data
//    - show only applicable buttons
//    - Navigationbar

import { auth, db } from './firebase-config.js';
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

let currentUserData = null;

document.addEventListener("DOMContentLoaded", () => {
  // Logout
  document.getElementById("logout-button").addEventListener("click", () => {
    signOut(auth).then(() => {
      window.location.href = "./index.html";
    });
  });

  // Profile edit
  document.getElementById("edit-profile-button").addEventListener("click", () => {
    document.getElementById("edit-name").value = currentUserData.name;
    document.getElementById("edit-role").value = currentUserData.role;
    document.getElementById("edit-form").style.display = "block";
  });

  // Profile save
  document.getElementById("save-profile").addEventListener("click", async () => {
    const newName = document.getElementById("edit-name").value;
    const newRole = document.getElementById("edit-role").value;

    try {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userDocRef, {
        name: newName,
        role: newRole
      });
      alert("Profil aktualisiert. Seite wird neu geladen.");
      location.reload();
    } catch (err) {
      alert("Fehler beim Speichern: " + err.message);
    }
  });

  // application-button
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
    window.location.href = "./index.html";
    return;
  }

  // display data
  const userDocRef = doc(db, "users", user.uid);
  const userDocSnap = await getDoc(userDocRef);

  if (!userDocSnap.exists()) {
    alert("Kein Profil gefunden.");
    return;
  }

  currentUserData = userDocSnap.data();

  document.getElementById("profile-name").textContent = currentUserData.name;
  document.getElementById("profile-email").textContent = currentUserData.email;
  document.getElementById("profile-role").textContent = currentUserData.role;

  const bewerbungBtn = document.getElementById("bewerbung-button");

  if (currentUserData.role === "bewerber") {
    bewerbungBtn.style.display = "inline-block";

    // application status check
    const q = query(collection(db, "applications"), where("uid", "==", user.uid));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      bewerbungBtn.textContent = "Neue Bewerbung erstellen";
      bewerbungBtn.addEventListener("click", () => {
        console.log("Klick erkannt → neue Bewerbung");
        window.location.href = "application.html";
      });
    } else {
      const appDoc = querySnapshot.docs[0];
      const data = appDoc.data();
      const appId = appDoc.id;

      if (data.status === "entwurf") {
        bewerbungBtn.textContent = "Entwurf fortsetzen";
        bewerbungBtn.addEventListener("click", () => {
            window.location.href = `application.html?id=${appId}`;
        });
      } else if (data.status === "veröffentlicht") {
        bewerbungBtn.textContent = "Bewerbung ansehen";
        bewerbungBtn.addEventListener("click", () => {
            window.location.href = `application-overview.html?id=${appId}`;
        });
      }
    }
  } else {
    // hide button, if role not applicant
    document.getElementById("bewerbung-button").style.display = "none";
  }
  });
});

//Navbar
fetch("components/navbar.html")
  .then((res) => res.text())
  .then((html) => {
    document.getElementById("navbar-placeholder").innerHTML = html;

    // Auth-abhängige Anzeige
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