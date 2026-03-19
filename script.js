document.addEventListener("DOMContentLoaded", () => {
  const steps = document.querySelectorAll(".form-step");
  const nextBtn = document.getElementById("nextBtn");
  const prevBtn = document.getElementById("prevBtn");
  const progressBar = document.getElementById("progressBar");
  const wizardForm = document.getElementById("wizardForm");

  // TVOJ URL ZA GOOGLE SCRIPT
  const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbxolUVIuzGg7ioZ1Ey5_J5XtoEIzb34opEVYZ68OEw7TANjWSiccFsoiGFuK8f2phQJ/exec";

  let currentStepIndex = 0;
  const totalStepsCount = 2; // Vraćeno na 2 koraka

  function updateWizard() {
    steps.forEach((step, index) => {
      step.classList.toggle("active", index === currentStepIndex);
    });

    const progressPercent = ((currentStepIndex + 1) / totalStepsCount) * 100;
    progressBar.style.width = progressPercent + "%";

    prevBtn.style.visibility = currentStepIndex === 0 ? "hidden" : "visible";

    if (currentStepIndex === steps.length - 1) {
      nextBtn.innerText = "Absenden";
    } else {
      nextBtn.innerText = "Weiter";
    }
  }

  function validateField(input) {
    let errorSpan = input.parentElement.querySelector(".error-message");
    if (!input.value.trim()) {
      input.style.borderColor = "#EF4444";
      if (!errorSpan) {
        errorSpan = document.createElement("span");
        errorSpan.className = "error-message";
        errorSpan.innerText = "Dieses Feld ist ein Pflichtfeld";
        input.parentElement.appendChild(errorSpan);
      }
      return false;
    } else {
      input.style.borderColor = "#E5E7EB";
      if (errorSpan) errorSpan.remove();
      return true;
    }
  }

  nextBtn.addEventListener("click", () => {
    const activeStep = steps[currentStepIndex];
    const requiredInputs = activeStep.querySelectorAll(
      "input[required], select[required]",
    );

    let allValid = true;
    let firstInvalidField = null; // Ovde pamtimo prvo polje sa greškom

    // Validacija svih polja
    requiredInputs.forEach((input) => {
      const isValid = validateField(input);
      if (!isValid) {
        allValid = false;
        if (!firstInvalidField) firstInvalidField = input; // Uzmi samo prvo nevalidno
      }
    });

    // Ako ima grešaka, skroluj do prvog problematičnog polja
    if (!allValid) {
      // 1. ODMAH fokusiramo (ovo 'otključava' tastaturu na iOS-u jer je direktna posledica klika)
      firstInvalidField.focus();

      firstInvalidField.scrollIntoView({
        behavior: "smooth",
        block: "center", // Centriraj polje na ekranu
      });

      // Opciono: fokusiraj polje nakon malog kašnjenja da iskoči tastatura
      setTimeout(() => firstInvalidField.focus(), 600);
      return;
    }

    // Ako je sve validno, idi na sledeći korak ili šalji
    if (currentStepIndex < steps.length - 1) {
      currentStepIndex++;
      updateWizard();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      sendData();
    }
  });

  function sendData() {
    nextBtn.innerHTML = '<span class="spinner"></span> Bitte warten...';
    nextBtn.disabled = true;
    nextBtn.style.opacity = "0.7";
    nextBtn.style.cursor = "not-allowed";

    const formData = new FormData(wizardForm);
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });

    fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      cache: "no-cache",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then(() => {
        const container = document.querySelector(".wizard-container");
        container.innerHTML = `
          <div class="success-screen">
              <div class="success-icon">✓</div>
              <h2>Vielen Dank!</h2>
              <p>Ihre Daten wurden erfolgreich übermittelt.<br> 
                 Eine Kopie wurde an Ihre E-Mail-Adresse gesendet.</p>
              <button onclick="location.reload()" class="btn-next">Neues Formular</button>
          </div>
        `;
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.");
        nextBtn.innerText = "Absenden";
        nextBtn.disabled = false;
        nextBtn.style.opacity = "1";
        nextBtn.style.cursor = "pointer";
      });
  }

  prevBtn.addEventListener("click", () => {
    if (currentStepIndex > 0) {
      currentStepIndex--;
      updateWizard();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  updateWizard();
});
