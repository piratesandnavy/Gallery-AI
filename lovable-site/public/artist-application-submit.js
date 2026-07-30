(function () {
  const byId = (id) => document.getElementById(id);
  const form = byId("aa-name")?.closest("form");
  if (!form) return;

  const button = form.querySelector('button[type="submit"]');
  const buttonText = button.textContent;
  const status = document.createElement("p");
  status.dataset.applicationStatus = "";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  status.style.marginTop = "16px";
  button.insertAdjacentElement("afterend", status);

  const honeypot = document.createElement("input");
  Object.assign(honeypot, {
    type: "text",
    name: "companyWebsite",
    tabIndex: -1,
    autocomplete: "off",
  });
  honeypot.setAttribute("aria-hidden", "true");
  honeypot.style.cssText = "position:absolute;left:-10000px";
  form.appendChild(honeypot);

  form.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (button.disabled) return;

      const required = [
        ["aa-name", "Full name"],
        ["aa-email", "Email address"],
        ["aa-location", "Location"],
        ["aa-medium", "Primary medium"],
        ["aa-style", "Art style / genre"],
        ["aa-bio", "Bio"],
        ["aa-statement", "Artist statement"],
      ];
      const missing = required.find(([id]) => !byId(id)?.value.trim());
      const email = byId("aa-email")?.value.trim() || "";
      if (
        missing ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        !byId("aa-consent")?.checked
      ) {
        status.style.color = "#b42318";
        status.textContent = missing
          ? `${missing[1]} is required.`
          : "Please enter a valid email and accept the terms.";
        return;
      }

      const files = Array.from(byId("aa-files")?.files || []);
      const invalidFile = files.find(
        (file) =>
          !["image/jpeg", "image/png", "application/pdf"].includes(file.type) ||
          file.size > 20 * 1024 * 1024,
      );
      if (files.length > 10 || invalidFile) {
        status.style.color = "#b42318";
        status.textContent =
          "Upload up to 10 JPG, PNG, or PDF files, no larger than 20MB each.";
        return;
      }

      button.disabled = true;
      button.textContent = "Submitting…";
      status.textContent = "";
      const payload = {
        submissionId: crypto.randomUUID(),
        artistName: byId("aa-name").value,
        artistEmail: email,
        location: byId("aa-location").value,
        websiteOrInstagram: byId("aa-website")?.value || "",
        medium: byId("aa-medium").value,
        style: byId("aa-style").value,
        artStyleGenre: byId("aa-style").value,
        yearsActive: byId("aa-years")?.value || "",
        representationHistory: byId("aa-rep")?.value || "",
        portfolioLinks: byId("aa-portfolio")?.value || "",
        bio: byId("aa-bio").value,
        artistStatement: byId("aa-statement").value,
        uploadedFiles: files.map(({ name, type, size }) => ({ name, type, size })),
        consent: byId("aa-consent").checked,
        companyWebsite: honeypot.value,
      };

      try {
        const response = await fetch("/api/artist-application", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || result.ok !== true) {
          throw new Error(
            result.error || "Your application could not be submitted.",
          );
        }
        form.reset();
        status.style.color = "#7a5a20";
        status.textContent =
          "Thank you. Your application has been submitted successfully.";
      } catch (error) {
        status.style.color = "#b42318";
        status.textContent =
          error.message || "Submission failed. Please try again.";
      } finally {
        button.disabled = false;
        button.textContent = buttonText;
      }
    },
    true,
  );
})();
