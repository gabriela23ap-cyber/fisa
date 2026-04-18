const size = 18;

/* =========================
   VERIFICARE PLASARE
========================= */

function canPlaceWord(grid, word, row, col, direction) {
  for (let i = 0; i < word.length; i++) {
    let r = row;
    let c = col;

    if (direction === "horizontal") c += i;
    if (direction === "vertical") r += i;
    if (direction === "diagonal") {
      r += i;
      c += i;
    }

    if (r >= size || c >= size) return false;

    if (grid[r][c] !== "" && grid[r][c] !== word[i]) {
      return false;
    }
  }
  return true;
}

/* =========================
   PRELUARE CUVINTE
========================= */
function getWords() {
  const input = document.getElementById("wordsInput").value;

  return input
    .split(",")
    .map(w => w.trim().toUpperCase())
    .filter(w => w.length > 0);
}

/* =========================
   GENERARE
========================= */
function generate() {
  const title = document.getElementById("titleInput").value || "Fișă de lucru";
  const titleEl = document.getElementById("sheetTitle");

  if (titleEl) {
    titleEl.innerText = title;
  }

  const grid = [];

  for (let i = 0; i < size; i++) {
    grid[i] = [];
    for (let j = 0; j < size; j++) {
      grid[i][j] = "";
    }
  }

  const words = getWords();

  words.forEach(word => {
    let placed = false;

    for (let attempt = 0; attempt < 50 && !placed; attempt++) {

      const directions = ["horizontal", "vertical", "diagonal"];
      const direction = directions[Math.floor(Math.random() * directions.length)];

      let row, col;

      if (direction === "horizontal") {
        row = Math.floor(Math.random() * size);
        col = Math.floor(Math.random() * (size - word.length));
      } else if (direction === "vertical") {
        row = Math.floor(Math.random() * (size - word.length));
        col = Math.floor(Math.random() * size);
      } else {
        row = Math.floor(Math.random() * (size - word.length));
        col = Math.floor(Math.random() * (size - word.length));
      }

      if (canPlaceWord(grid, word, row, col, direction)) {
        for (let i = 0; i < word.length; i++) {
          if (direction === "horizontal") grid[row][col + i] = word[i];
          if (direction === "vertical") grid[row + i][col] = word[i];
          if (direction === "diagonal") grid[row + i][col + i] = word[i];
        }
        placed = true;
      }
    }
  });

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (grid[i][j] === "") {
        grid[i][j] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }

  draw(grid);

    const listContainer = document.getElementById("wordList");

  if (listContainer) {
    listContainer.innerHTML = "<h3>Cuvinte:</h3>";

    const wrapper = document.createElement("div");
    wrapper.className = "words-grid";

    words.forEach(word => {
      const div = document.createElement("div");
      div.innerText = word;
      wrapper.appendChild(div);
    });

    listContainer.appendChild(wrapper);
  }
}
/* =========================
   DESENARE GRID
========================= */
function draw(grid) {
  const container = document.getElementById("grid");
  container.innerHTML = "";

  grid.forEach(row => {
    row.forEach(cell => {
      const div = document.createElement("div");
      div.className = "cell";
      div.innerText = cell;
      container.appendChild(div);
    });
  });
}
async function downloadPDF() {
  try {
    const { jsPDF } = window.jspdf;
    const sheet = document.getElementById("sheet");

    // scoatem efecte vizuale
    const originalShadow = sheet.style.boxShadow;
    const originalRadius = sheet.style.borderRadius;

    sheet.style.boxShadow = "none";
    sheet.style.borderRadius = "0px";

    const canvas = await html2canvas(sheet, {
      scale: 2,
      backgroundColor: "#ffffff",
      scrollX: 0,
      scrollY: 0
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = 210;
    const pageHeight = 297;

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // 🔥 IMPORTANT: crop pe înălțime A4 fix
    pdf.addImage(
      imgData,
      "PNG",
      0,
      0,
      imgWidth,
      pageHeight
    );

    const pdfUrl = pdf.output("bloburl");
    window.open(pdfUrl, "_blank");

    // restaurăm UI
    sheet.style.boxShadow = originalShadow;
    sheet.style.borderRadius = originalRadius;

  } catch (err) {
    console.error(err);
    alert("Eroare la generare PDF");
  }
}
