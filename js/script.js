// Variáveis globais para elementos do DOM
var fileInput = document.getElementById("fileInput");
var fileTableBody = document.querySelector("#fileTable tbody");
var removeButton = document.getElementById("removeButton");
var searchInputs = document.querySelectorAll(".search-input");
var searchButtons = document.querySelectorAll(".search-button");
var clearButton = document.getElementById("clearButton");
var themeSwitcherButton = document.getElementById("themeSwitcherButton");
var fileNameDisplay = document.getElementById("fileNameDisplay");
var scrollTopBottomButton = document.getElementById("scrollTopBottomButton");

var fileSummarySection = document.getElementById("fileSummarySection");
var fileSummaryContent = document.getElementById("fileSummaryContent");
var paginationControls = document.getElementById("paginationControls");
var prevPageButton = document.getElementById("prevPageButton");
var nextPageButton = document.getElementById("nextPageButton");
var pageInfo = document.getElementById("pageInfo");
var rowsPerPageSelect = document.getElementById("rowsPerPageSelect");
var totalRowsInfo = document.getElementById("totalRowsInfo");

var dataRows = [];
var filteredDataRows = [];
var originalRowCount = 0;
var isScrolledToBottom = false;
var currentPage = 1;
var rowsPerPage = 50;

/**
 * Valida um número de PIS/PASEP/NIS.
 * @param {string} pisNumeros - O número do PIS como string contendo exatamente 11 dígitos.
 * @returns {boolean} - True se o PIS for válido, false caso contrário.
 */
function validarPISChecksum(pisNumeros) {
  if (/^(.)\1+$/.test(pisNumeros)) {
    return false;
  }
  const multiplicadores = [3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(pisNumeros.charAt(i), 10) * multiplicadores[i];
  }
  let resto = soma % 11;
  let digitoVerificadorCalculado = resto < 2 ? 0 : 11 - resto;
  let digitoVerificadorFornecido = parseInt(pisNumeros.charAt(10), 10);
  return digitoVerificadorCalculado === digitoVerificadorFornecido;
}

function updateBodyHeight() {
  var container = document.querySelector(".container");
  var body = document.body;
  if (container) {
    var contentHeight = container.scrollHeight;
    var minBodyHeight = Math.max(window.innerHeight, contentHeight + 100);
    body.style.minHeight = minBodyHeight + "px";
  } else {
    body.style.minHeight = "100vh";
  }
}

function displayFileContents(rowsToDisplay, page, perPage) {
  if (!fileTableBody) {
    console.error("Elemento fileTableBody não encontrado.");
    return;
  }
  fileTableBody.innerHTML = "";
  var fragment = document.createDocumentFragment();

  if (!rowsToDisplay || rowsToDisplay.length === 0) {
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    td.colSpan = 7;
    td.textContent =
      dataRows.length > 0
        ? "Nenhum resultado encontrado para os filtros aplicados."
        : "Nenhum dado para exibir. Carregue um arquivo AFD.";
    td.style.textAlign = "center";
    td.style.padding = "20px";
    tr.appendChild(td);
    fragment.appendChild(tr);
    toggleScrollButtonVisibility(false);
    renderPaginationControls(0, 1, perPage); // Chama para esconder ou mostrar apenas o select
  } else {
    let paginatedItems;
    let start = 0;

    if (perPage === "all") {
      paginatedItems = rowsToDisplay;
      start = 0;
    } else {
      start = (page - 1) * perPage;
      var end = start + perPage;
      paginatedItems = rowsToDisplay.slice(start, end);
    }

    paginatedItems.forEach(function (row, indexInPage) {
      var tr = document.createElement("tr");
      var rowNumberCell = document.createElement("td");
      let originalIndex = -1;
      if (rowsToDisplay === dataRows) {
        originalIndex = start + indexInPage;
      } else {
        const paginatedRowData = paginatedItems[indexInPage];
        originalIndex = dataRows.findIndex(
          (dr) =>
            dr.nsr === paginatedRowData.nsr &&
            dr.pis === paginatedRowData.pis &&
            dr.data === paginatedRowData.data &&
            dr.hora === paginatedRowData.hora &&
            dr.codigoEvento === paginatedRowData.codigoEvento
        );
      }
      rowNumberCell.textContent =
        originalIndex !== -1 ? originalIndex + 1 : start + indexInPage + 1;
      tr.appendChild(rowNumberCell);
      ["nsr", "codigoEvento", "data", "hora", "pis", "crc"].forEach(function (
        key
      ) {
        var td = document.createElement("td");
        td.textContent =
          row[key] !== undefined && row[key] !== null ? row[key] : "";
        tr.appendChild(td);
      });
      fragment.appendChild(tr);
    });
    toggleScrollButtonVisibility(true);
    renderPaginationControls(rowsToDisplay.length, page, perPage);
  }
  fileTableBody.appendChild(fragment);
  updateBodyHeight();
}

/**
 * Renderiza os controles de paginação.
 * @param {number} totalItems - Total de itens a serem paginados (no array filtrado/atual).
 * @param {number} currentPageNum - Número da página atual.
 * @param {number|string} itemsPerPage - Itens por página ou "all".
 */
function renderPaginationControls(totalItems, currentPageNum, itemsPerPage) {
  if (
    !paginationControls ||
    !pageInfo ||
    !prevPageButton ||
    !nextPageButton ||
    !totalRowsInfo ||
    !rowsPerPageSelect
  )
    return;

  if (totalItems === 0) {
    paginationControls.style.display = "none";
    return;
  }
  paginationControls.style.display = "flex"; // Garante que a div principal esteja visível

  if (itemsPerPage === "all") {
    pageInfo.style.display = "none";
    prevPageButton.style.display = "none";
    nextPageButton.style.display = "none";
    rowsPerPageSelect.style.display = "inline-block"; // Mantém o select visível
    totalRowsInfo.textContent = `Exibindo todos os ${totalItems} registros.`;
    totalRowsInfo.style.display = "inline";
  } else {
    pageInfo.style.display = "inline";
    prevPageButton.style.display = "inline-block";
    nextPageButton.style.display = "inline-block";
    rowsPerPageSelect.style.display = "inline-block";
    totalRowsInfo.style.display = "inline";

    var totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 0) totalPages = 1;

    pageInfo.textContent = `Página ${currentPageNum} de ${totalPages}`;
    totalRowsInfo.textContent = `Total de registros: ${totalItems}`;

    prevPageButton.disabled = currentPageNum === 1;
    nextPageButton.disabled = currentPageNum === totalPages;
  }
}

function calculateAndDisplaySummary(allRowsFromFile) {
  if (!fileSummarySection || !fileSummaryContent) return;

  if (!allRowsFromFile || allRowsFromFile.length === 0) {
    fileSummarySection.style.display = "none";
    return;
  }

  var totalRegistros = allRowsFromFile.length;

  const pisCandidatos = [];
  allRowsFromFile.forEach((row) => {
    if (row.pis && typeof row.pis === "string") {
      const pisLimpo = row.pis.replace(/[^\d]+/g, "");
      if (pisLimpo.length === 11) {
        pisCandidatos.push(pisLimpo);
      }
    }
  });

  const pisUnicosSet = new Set(pisCandidatos);
  var totalPisUnicosFormatados = pisUnicosSet.size;
  var pisValidos = 0;
  var pisInvalidos = 0;

  pisUnicosSet.forEach((pisNumerico) => {
    if (validarPISChecksum(pisNumerico)) {
      pisValidos++;
    } else {
      pisInvalidos++;
    }
  });

  let rowsConsideredForPeriod = [];
  const skipStartLines = 10;
  const skipEndLines = 2;

  if (allRowsFromFile.length > skipStartLines + skipEndLines) {
    rowsConsideredForPeriod = allRowsFromFile.slice(
      skipStartLines,
      allRowsFromFile.length - skipEndLines
    );
  } else {
    rowsConsideredForPeriod = [...allRowsFromFile];
  }

  if (rowsConsideredForPeriod.length === 0 && allRowsFromFile.length > 0) {
    rowsConsideredForPeriod = [...allRowsFromFile];
  }

  var datas = rowsConsideredForPeriod
    .map((row) => {
      if (row.data && typeof row.data === "string") {
        const parts = row.data.split("/");
        if (parts.length === 3) {
          return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }
      return null;
    })
    .filter((date) => date !== null)
    .sort();

  var periodo = "N/A (dados insuficientes ou inválidos para período)";
  if (datas.length > 0) {
    const formatDateForDisplay = (dateStr) => {
      const [year, month, day] = dateStr.split("-");
      return `${day}/${month}/${year}`;
    };
    periodo = `${formatDateForDisplay(datas[0])} a ${formatDateForDisplay(
      datas[datas.length - 1]
    )}`;
  }

  var eventos = {};
  allRowsFromFile.forEach((row) => {
    eventos[row.codigoEvento] = (eventos[row.codigoEvento] || 0) + 1;
  });
  var eventosHtml = "<ul>";
  for (const evento in eventos) {
    eventosHtml += `<li><strong>Código ${evento}:</strong> ${eventos[evento]} ocorrências</li>`;
  }
  eventosHtml += "</ul>";

  fileSummaryContent.innerHTML = `
        <p><strong>Total de Registros no Arquivo:</strong> ${totalRegistros}</p>
        <p><strong>Período Coberto (estimado):</strong> ${periodo}</p>
        <p><strong>Total de PIS Únicos (formato 11 dígitos):</strong> ${totalPisUnicosFormatados}</p>
        <p><strong>PIS Válidos (checksum OK):</strong> <span class="summary-valid">${pisValidos}</span></p>
        <p><strong>PIS Inválidos (checksum falhou):</strong> <span class="summary-invalid">${pisInvalidos}</span></p>
        <div><strong>Contagem por Código de Evento:</strong>${eventosHtml}</div>
    `;
  fileSummarySection.style.display = "block";
}

function showAlert(message, type = "info") {
  var existingOverlay = document.querySelector(".alert-overlay");
  if (existingOverlay) {
    document.body.removeChild(existingOverlay);
  }
  var overlay = document.createElement("div");
  overlay.className = "alert-overlay";
  var alertBox = document.createElement("div");
  alertBox.className = "alert-box alert-" + type;
  var messageText = document.createElement("div");
  messageText.className = "alert-message";
  messageText.innerHTML = message.replace(/\n/g, "<br>");
  var closeButton = document.createElement("div");
  closeButton.className = "alert-close";
  closeButton.textContent = "Fechar";
  alertBox.appendChild(messageText);
  alertBox.appendChild(closeButton);
  overlay.appendChild(alertBox);
  document.body.appendChild(overlay);
  setTimeout(() => overlay.classList.add("show"), 10);
  function closeAlert() {
    overlay.classList.remove("show");
    setTimeout(() => {
      if (document.body.contains(overlay)) {
        document.body.removeChild(overlay);
      }
    }, 300);
  }
  closeButton.addEventListener("click", closeAlert);
  overlay.addEventListener("click", function (event) {
    if (event.target === overlay) {
      closeAlert();
    }
  });
}

function clearSearchInputs() {
  searchInputs.forEach(function (input) {
    if (input) input.value = "";
  });
}

function clearHighlightingAndFilters() {
  filteredDataRows = [...dataRows];
  currentPage = 1;
  if (rowsPerPageSelect && rowsPerPageSelect.value !== "all") {
    rowsPerPage = parseInt(rowsPerPageSelect.value) || 50;
  } else if (rowsPerPageSelect && rowsPerPageSelect.value === "all") {
    rowsPerPage = "all";
  } else {
    rowsPerPage = 50;
  }
  displayFileContents(filteredDataRows, currentPage, rowsPerPage);
}

function searchTable(columnIndex, inputValue) {
  if (!fileTableBody) return;
  var searchTerm = inputValue.trim().toLowerCase();

  if (columnIndex === 6) {
    showAlert("A coluna CRC não é pesquisável.", "info");
    return;
  }

  if (searchTerm === "") {
    clearHighlightingAndFilters();
    return;
  }

  filteredDataRows = dataRows.filter(function (row) {
    var keys = ["nsr", "codigoEvento", "data", "hora", "pis", "crc"];
    var keyIndex = columnIndex - 1;

    if (keyIndex >= 0 && keyIndex < keys.length) {
      var cellValue = String(row[keys[keyIndex]] || "").toLowerCase();
      return cellValue.includes(searchTerm);
    }
    return false;
  });

  currentPage = 1;
  let currentRowsPerPageSetting = rowsPerPageSelect
    ? rowsPerPageSelect.value
    : rowsPerPage;
  displayFileContents(
    filteredDataRows,
    currentPage,
    currentRowsPerPageSetting === "all"
      ? "all"
      : parseInt(currentRowsPerPageSetting)
  );

  var tableRowsRendered = fileTableBody.getElementsByTagName("tr");
  var matchCount = 0;

  for (var i = 0; i < tableRowsRendered.length; i++) {
    var cell = tableRowsRendered[i].getElementsByTagName("td")[columnIndex];
    if (cell) {
      var cellText = cell.textContent || cell.innerText;
      var matchIndex = cellText.toLowerCase().indexOf(searchTerm);

      if (matchIndex > -1) {
        var originalMatchedText = cellText.substr(
          matchIndex,
          searchTerm.length
        );
        var highlightedText =
          '<span class="highlight">' + originalMatchedText + "</span>";
        cell.innerHTML =
          cellText.substring(0, matchIndex) +
          highlightedText +
          cellText.substring(matchIndex + searchTerm.length);
        tableRowsRendered[i].classList.add("highlight-row");
        matchCount++;
      }
    }
  }

  if (matchCount > 0) {
    showAlert(
      matchCount + " correspondências encontradas nos resultados filtrados.",
      "success"
    );
  } else {
    showAlert(
      'Nenhuma correspondência encontrada para "' + inputValue + '".',
      "info"
    );
  }
}

function toggleScrollButtonVisibility(show) {
  if (scrollTopBottomButton) {
    if (show && (filteredDataRows.length > 0 || dataRows.length > 0)) {
      scrollTopBottomButton.style.display = "flex";
      setTimeout(() => scrollTopBottomButton.classList.add("visible"), 10);
    } else {
      scrollTopBottomButton.classList.remove("visible");
      setTimeout(() => {
        if (!scrollTopBottomButton.classList.contains("visible")) {
          scrollTopBottomButton.style.display = "none";
        }
      }, 300);
    }
  }
}

function setScrollButtonState(atBottom) {
  isScrolledToBottom = atBottom;
  if (scrollTopBottomButton) {
    if (isScrolledToBottom) {
      scrollTopBottomButton.innerHTML = "⬆️";
      scrollTopBottomButton.title = "Subir para o topo";
    } else {
      scrollTopBottomButton.innerHTML = "⬇️";
      scrollTopBottomButton.title = "Descer até o final";
    }
  }
}

if (fileInput) {
  fileInput.addEventListener("change", function (e) {
    var file = e.target.files[0];
    if (!file) {
      if (removeButton) removeButton.disabled = true;
      if (fileNameDisplay)
        fileNameDisplay.textContent = "Nenhum arquivo selecionado";
      toggleScrollButtonVisibility(false);
      if (fileSummarySection) fileSummarySection.style.display = "none";
      if (paginationControls) paginationControls.style.display = "none";
      return;
    }
    if (fileNameDisplay) fileNameDisplay.textContent = file.name;

    if (removeButton) removeButton.disabled = true;
    if (clearButton) clearButton.disabled = true;

    showAlert("Processando arquivo, por favor aguarde...", "info");

    var reader = new FileReader();
    reader.onload = function (eventReader) {
      var contents = eventReader.target.result;
      var worker;
      try {
        worker = new Worker("js/fileWorker.js");
      } catch (error) {
        console.error("Erro ao criar Web Worker: ", error);
        showAlert(
          "Erro crítico: Não foi possível iniciar o processador de arquivos.\nConsulte o console para detalhes.",
          "error"
        );
        if (removeButton) removeButton.disabled = false;
        if (clearButton) clearButton.disabled = false;
        toggleScrollButtonVisibility(false);
        return;
      }

      worker.onmessage = function (eventWorker) {
        var existingAlert = document.querySelector(".alert-overlay");
        if (existingAlert) document.body.removeChild(existingAlert);

        if (eventWorker.data.error) {
          showAlert(
            "Erro ao analisar o arquivo AFD:\n" + eventWorker.data.error,
            "error"
          );
          dataRows = [];
        } else if (!eventWorker.data || eventWorker.data.length === 0) {
          showAlert(
            "Arquivo carregado está vazio ou não contém dados AFD reconhecíveis.",
            "info"
          );
          dataRows = [];
        } else {
          dataRows = eventWorker.data;
          showAlert(
            dataRows.length + " linhas processadas com sucesso!",
            "success"
          );
        }
        filteredDataRows = [...dataRows];
        originalRowCount = dataRows.length;
        calculateAndDisplaySummary(dataRows);
        currentPage = 1;
        let currentRowsPerPageSetting = rowsPerPageSelect
          ? rowsPerPageSelect.value
          : rowsPerPage;
        rowsPerPage =
          currentRowsPerPageSetting === "all"
            ? "all"
            : parseInt(currentRowsPerPageSetting);
        displayFileContents(filteredDataRows, currentPage, rowsPerPage);

        if (removeButton) removeButton.disabled = dataRows.length === 0;
        if (clearButton) clearButton.disabled = false;
        clearSearchInputs();
      };
      worker.onerror = function (error) {
        var existingAlert = document.querySelector(".alert-overlay");
        if (existingAlert) document.body.removeChild(existingAlert);
        console.error(
          "Erro no Web Worker:",
          error.message,
          error.filename,
          error.lineno
        );
        showAlert(
          "Ocorreu um erro interno ao processar o arquivo.\nConsulte o console para detalhes.",
          "error"
        );
        if (removeButton) removeButton.disabled = false;
        if (clearButton) clearButton.disabled = false;
        toggleScrollButtonVisibility(false);
      };
      worker.postMessage(contents);
    };
    reader.onerror = function () {
      var existingAlert = document.querySelector(".alert-overlay");
      if (existingAlert) document.body.removeChild(existingAlert);
      showAlert("Ocorreu um erro ao ler o arquivo selecionado.", "error");
      if (removeButton) removeButton.disabled = false;
      if (clearButton) clearButton.disabled = false;
      toggleScrollButtonVisibility(false);
    };
    reader.readAsText(file);
  });
}

if (removeButton) {
  removeButton.addEventListener("click", function () {
    if (fileInput) fileInput.value = "";
    if (fileNameDisplay)
      fileNameDisplay.textContent = "Nenhum arquivo selecionado";
    removeButton.disabled = true;
    dataRows = [];
    filteredDataRows = [];
    originalRowCount = 0;
    clearSearchInputs();
    displayFileContents([]);
    if (fileSummarySection) fileSummarySection.style.display = "none";
    if (paginationControls) paginationControls.style.display = "none";
  });
}

searchInputs = document.querySelectorAll(".search-input");
searchButtons = document.querySelectorAll(".search-button");

searchInputs.forEach(function (input) {
  if (!input) return;
  var maxLength = parseInt(input.getAttribute("maxlength"));
  input.addEventListener("input", function () {
    if (input.value.length > maxLength) {
      input.value = input.value.slice(0, maxLength);
    }
  });
  input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      var th = input.closest("th");
      if (th) {
        var columnIndex = Array.from(th.parentNode.children).indexOf(th);
        searchTable(columnIndex, input.value);
      }
    }
  });
});

searchButtons.forEach(function (button) {
  if (!button) return;
  button.addEventListener("click", function () {
    var input = button.previousElementSibling;
    if (input && input.classList.contains("search-input")) {
      var th = input.closest("th");
      if (th) {
        var columnIndex = Array.from(th.parentNode.children).indexOf(th);
        searchTable(columnIndex, input.value);
      }
    }
  });
});

if (clearButton) {
  clearButton.addEventListener("click", function () {
    clearSearchInputs();
    clearHighlightingAndFilters();
  });
}

if (themeSwitcherButton) {
  themeSwitcherButton.addEventListener("click", function () {
    document.body.classList.toggle("theme-light");
    var isLightTheme = document.body.classList.contains("theme-light");
    localStorage.setItem("theme", isLightTheme ? "light" : "dark");
    themeSwitcherButton.textContent = isLightTheme ? "☀️" : "🌙";
    themeSwitcherButton.title = isLightTheme
      ? "Alternar para Tema Escuro"
      : "Alternar para Tema Claro";
  });
}

if (scrollTopBottomButton) {
  scrollTopBottomButton.addEventListener("click", function () {
    if (isScrolledToBottom) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }
  });
  window.addEventListener("scroll", function () {
    if (filteredDataRows.length > 0 || dataRows.length > 0) {
      if (
        window.innerHeight + window.scrollY + 150 >=
        document.body.scrollHeight
      ) {
        setScrollButtonState(true);
      } else {
        setScrollButtonState(false);
      }
      toggleScrollButtonVisibility(true);
    } else {
      toggleScrollButtonVisibility(false);
    }
  });
}

if (prevPageButton) {
  prevPageButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      displayFileContents(filteredDataRows, currentPage, rowsPerPage);
    }
  });
}
if (nextPageButton) {
  nextPageButton.addEventListener("click", () => {
    if (rowsPerPage === "all") return;
    var totalPages = Math.ceil(filteredDataRows.length / rowsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      displayFileContents(filteredDataRows, currentPage, rowsPerPage);
    }
  });
}
if (rowsPerPageSelect) {
  rowsPerPageSelect.addEventListener("change", (event) => {
    var selectedValue = event.target.value;
    if (selectedValue === "all") {
      rowsPerPage = "all";
    } else {
      rowsPerPage = parseInt(selectedValue);
    }
    currentPage = 1;
    displayFileContents(filteredDataRows, currentPage, rowsPerPage);
  });
}

window.addEventListener("DOMContentLoaded", () => {
  var savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    document.body.classList.add("theme-light");
    if (themeSwitcherButton) {
      themeSwitcherButton.textContent = "☀️";
      themeSwitcherButton.title = "Alternar para Tema Escuro";
    }
  } else {
    document.body.classList.remove("theme-light");
    if (themeSwitcherButton) {
      themeSwitcherButton.textContent = "🌙";
      themeSwitcherButton.title = "Alternar para Tema Claro";
    }
  }
  if (rowsPerPageSelect) {
    let initialRowsPerPage = rowsPerPageSelect.value;
    rowsPerPage =
      initialRowsPerPage === "all" ? "all" : parseInt(initialRowsPerPage);
  }
  displayFileContents([]);
  if (fileSummarySection) fileSummarySection.style.display = "none";
  if (paginationControls) paginationControls.style.display = "none";
  updateBodyHeight();
});

window.addEventListener("resize", function () {
  updateBodyHeight();
});
