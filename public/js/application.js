// This script provides the functionalities of the application including
//    - Loading of published applications
//    - Filter of applications
//    - Sorting of applications
//    - Visualisation of applications
//    - Sponsoring functionalities
//    - Navigationbar

import { auth, db } from "./firebase-config.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import {
  doc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

let currentUser = null;
let existingApplicationId = null;
let existingStatus = null;

const form = document.getElementById("application-form");
const statusMsg = document.getElementById("status-msg");
const saveDraftBtn = document.getElementById("save-draft");
const submitFinalBtn = document.getElementById("submit-final");
const urlParams = new URLSearchParams(window.location.search);
existingApplicationId = urlParams.get("id");

const getFormData = () => ({
  title: document.getElementById("title").value,
  description: document.getElementById("description").value,
  amount: parseFloat(document.getElementById("amount").value)
});

const fillForm = (data) => {
  document.getElementById("title").value = data.title || "";
  document.getElementById("description").value = data.description || "";
  document.getElementById("amount").value = data.amount || "";
};

onAuthStateChanged(auth, async (user) => {
  currentUser = user;

  // Check if application is already present
  const q = query(collection(db, "applications"), where("uid", "==", user.uid));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const docData = querySnapshot.docs[0].data();
    existingApplicationId = querySnapshot.docs[0].id;
    existingStatus = docData.status;

    if (existingStatus === "entwurf") {
      // load and show draft
      fillForm(docData);
      statusMsg.textContent = "Du bearbeitest deinen Entwurf.";
      saveDraftBtn.disabled = false;
      submitFinalBtn.disabled = false;
    } else if (existingStatus === "veröffentlicht") {
      // forwarding to submitted application
      window.location.href = `bewerbung.html?id=${existingApplicationId}`;
    }
  } else {
    // new application
    saveDraftBtn.disabled = false;
    submitFinalBtn.disabled = true;
    statusMsg.textContent = "Du kannst eine neue Bewerbung erstellen.";
  }
});

// save draft
saveDraftBtn.addEventListener("click", async () => {
  if (!currentUser) return;
  const data = getFormData();

  try {
    if (existingApplicationId) {
      // draft exists → update
      const docRef = doc(db, "applications", existingApplicationId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      statusMsg.textContent = "Entwurf aktualisiert.";
    } else {
      // new draft → create
      const docRef = await addDoc(collection(db, "applications"), {
        ...data,
        uid: currentUser.uid,
        status: "entwurf",
        createdAt: serverTimestamp()
      });
      existingApplicationId = docRef.id;
      existingStatus = "entwurf";
      statusMsg.textContent = "Entwurf gespeichert.";
    }

    // buttonstays active for repeated save
    submitFinalBtn.disabled = false;

  } catch (err) {
    console.error(err);
    alert("Fehler beim Speichern des Entwurfs.");
  }
});


// submit application
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentUser) return;
  const data = getFormData();

  try {
    let finalDocRef;
    if (existingApplicationId) {
      const docRef = doc(db, "applications", existingApplicationId);
      await updateDoc(docRef, {
        ...data,
        status: "veröffentlicht",
        submittedAt: serverTimestamp()
      });
      finalDocRef = docRef;
    } else {
      finalDocRef = await addDoc(collection(db, "applications"), {
        ...data,
        uid: currentUser.uid,
        status: "veröffentlicht",
        createdAt: serverTimestamp()
      });
    }

    window.location.href = `./application-overview.html?id=${finalDocRef.id}`;
  } catch (err) {
    console.error(err);
    alert("Fehler beim Absenden der Bewerbung.");
  }
});
