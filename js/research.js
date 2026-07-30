async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();

  const copied = document.execCommand("copy");
  textarea.remove();

  if (!copied) {
    throw new Error("Clipboard copy was unavailable.");
  }
}

document.querySelectorAll(".bibtex-copy").forEach((button) => {
  button.title = "Copy BibTeX citation";
  button.setAttribute("aria-label", "Copy BibTeX citation");
});

document.addEventListener("click", async (event) => {
  const button = event.target.closest(".bibtex-copy");
  if (!button) return;

  try {
    const response = await fetch(button.dataset.bibtex);
    if (!response.ok) {
      throw new Error(`Citation request failed: ${response.status}`);
    }

    await copyText(await response.text());
  } catch (error) {
    console.error(error);
  }
});
