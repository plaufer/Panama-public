// This script provides the basic functionalities of
//    - User registration
//    - User login
//    - Formular change
//    - Navigationbar

import { auth, db } from './firebase-config.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Registration
document.getElementById("register-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("reg-name").value;
  const email = document.getElementById("reg-email").value;
  const password = document.getElementById("reg-password").value;
  const role = document.getElementById("reg-role").value;

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", userCred.user.uid), {
      name,
      email,
      role,
      createdAt: serverTimestamp()
    });
    alert("Registrierung erfolgreich!");
    window.location.href = "./index.html";
  } catch (err) {
    alert("Fehler: " + err.message);
  }
});

// Login
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  // Nach erfolgreichem Login
  signInWithEmailAndPassword(auth, email, password).then(() => {
    console.log("Login erfolgreich, leite weiter...");
    window.location.href = "./profile.html";  // ← korrekt
  }).catch((err) => {
    alert("Fehler: " + err.message);
  });

});

// Formular-Change
document.getElementById("show-register").addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("login-form").style.display = "none";
  document.getElementById("register-form").style.display = "block";
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

