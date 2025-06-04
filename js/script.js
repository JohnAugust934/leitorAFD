// Variáveis globais para elementos do DOM
var fileInput = document.getElementById("fileInput");
var fileTableBody = document.querySelector("#fileTable tbody");
var removeButton = document.getElementById("removeButton");
var searchNSRInput = document.getElementById("searchNSR");
var searchCodigoEventoInput = document.getElementById("searchCodigoEvento");
var searchDataInput = document.getElementById("searchData");
var searchHoraInput = document.getElementById("searchHora");
var searchPISInput = document.getElementById("searchPIS");
var allSearchInputs = document.querySelectorAll(".search-input");
var searchButtons = document.querySelectorAll(".search-button");

var clearButton = document.getElementById("clearButton");
var themeSwitcherButton = document.getElementById("themeSwitcherButton");
var fileNameDisplay = document.getElementById("fileNameDisplay");
var scrollTopBottomButton = document.getElementById("scrollTopBottomButton");
var loadingOverlay = document.getElementById("loadingOverlay");
var validationErrorsSection = document.getElementById(
  "validationErrorsSection"
);
var validationErrorsList = document.getElementById("validationErrorsList");
var closeValidationErrorsButton = document.getElementById(
  "closeValidationErrorsButton"
);
var tableHeaders = document.querySelectorAll(
  '#fileTable th[data-sortable="true"]'
);

var fileSummarySection = document.getElementById("fileSummarySection");
var fileSummaryContent = document.getElementById("fileSummaryContent");
var toggleSummaryButton = document.getElementById("toggleSummaryButton");
var paginationControls = document.getElementById("paginationControls");
var prevPageButton = document.getElementById("prevPageButton");
var nextPageButton = document.getElementById("nextPageButton");
var pageInfo = document.getElementById("pageInfo");
var rowsPerPageSelect = document.getElementById("rowsPerPageSelect");
var totalRowsInfo = document.getElementById("totalRowsInfo");

var dataRows = [];
var filteredAndSortedRows = [];
var originalRowCount = 0;
var isScrolledToBottom = false;
var currentPage = 1;
var rowsPerPage = 50;

var currentSortColumn = null;
var currentSortDirection = "asc";
let loadingStartTime = 0; // Renomeado para evitar conflito com loadingTimeoutId se existir

/**
 * Valida um número de PIS/PASEP/NIS.
 * @param {string} pisNumeros - O número do PIS como string contendo exatamente 11 dígitos.
 * @returns {boolean} - True se o PIS for válido, false caso contrário.
 */
function validarPISChecksum(pisNumeros) {
  if (/^(.)\1+$/.test(pisNumeros)) return false;
  const multiplicadores = [3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let soma = 0;
  for (let i = 0; i < 10; i++)
    soma += parseInt(pisNumeros.charAt(i), 10) * multiplicadores[i];
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

function toggleLoadingOverlay(show) {
  if (loadingOverlay) {
    if (show) {
      loadingOverlay.classList.add("show");
    } else {
      loadingOverlay.classList.remove("show");
    }
  }
}

function displayValidationErrors(errors) {
  if (!validationErrorsSection || !validationErrorsList) return;
  if (errors && errors.length > 0) {
    validationErrorsList.innerHTML = "";
    errors.forEach((err) => {
      const li = document.createElement("li");
      li.innerHTML = `Linha ${err.lineNumber}: Campo "<strong>${escapeHtml(
        err.field
      )}</strong>" (valor: <code>${escapeHtml(
        String(err.value)
      )}</code>) - ${escapeHtml(err.error)}`;
      validationErrorsList.appendChild(li);
    });
    validationErrorsSection.style.display = "block";
  } else {
    validationErrorsSection.style.display = "none";
  }
}

function escapeHtml(unsafe) {
  if (typeof unsafe !== "string") return String(unsafe);
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function displayFileContents(rowsToDisplay, page, perPage) {
  if (!fileTableBody) return;
  fileTableBody.innerHTML = "";
  var fragment = document.createDocumentFragment();

  if (!rowsToDisplay || rowsToDisplay.length === 0) {
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    td.colSpan = 7;
    td.textContent =
      dataRows.length > 0
        ? "Nenhum resultado para os filtros aplicados."
        : "Nenhum dado para exibir. Carregue um arquivo AFD.";
    td.style.textAlign = "center";
    td.style.padding = "20px";
    tr.appendChild(td);
    fragment.appendChild(tr);
    toggleScrollButtonVisibility(false);
    renderPaginationControls(0, 1, perPage);
  } else {
    let paginatedItems;
    let start = 0;
    if (perPage === "all") {
      paginatedItems = rowsToDisplay;
    } else {
      start = (page - 1) * perPage;
      var end = start + perPage;
      paginatedItems = rowsToDisplay.slice(start, end);
    }
    paginatedItems.forEach(function (row) {
      var tr = document.createElement("tr");
      var rowNumberCell = document.createElement("td");
      rowNumberCell.textContent =
        row.originalLineNumber || dataRows.indexOf(row) + 1;
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
  if (totalItems === 0 && itemsPerPage !== "all") {
    paginationControls.style.display = "none";
    return;
  }
  paginationControls.style.display = "flex";
  if (itemsPerPage === "all") {
    pageInfo.style.display = "none";
    prevPageButton.style.display = "none";
    nextPageButton.style.display = "none";
    rowsPerPageSelect.style.display = "inline-block";
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
        if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      return null;
    })
    .filter((date) => date !== null)
    .sort();
  var periodo = "N/A";
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
        <p><strong>Total de Registros Processados:</strong> ${totalRegistros}</p>
        <p><strong>Período Coberto (estimado):</strong> ${periodo}</p>
        <p><strong>Total de PIS Únicos (formato 11 dígitos):</strong> ${totalPisUnicosFormatados}</p>
        <p><strong>PIS Válidos (checksum OK):</strong> <span class="summary-valid">${pisValidos}</span></p>
        <p><strong>PIS Inválidos (checksum falhou):</strong> <span class="summary-invalid">${pisInvalidos}</span></p>
        <div><strong>Contagem por Código de Evento:</strong>${eventosHtml}</div>
    `;
  fileSummarySection.style.display = "block";
  if (fileSummaryContent) fileSummaryContent.classList.remove("collapsed");
  if (toggleSummaryButton) {
    toggleSummaryButton.textContent = "➖";
    toggleSummaryButton.title = "Minimizar Resumo";
  }
}

function showAlert(message, type = "info") {
  var existingOverlay = document.querySelector(".alert-overlay");
  if (existingOverlay) document.body.removeChild(existingOverlay);
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
      if (document.body.contains(overlay)) document.body.removeChild(overlay);
    }, 300);
  }
  closeButton.addEventListener("click", closeAlert);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) closeAlert();
  });
}

function clearSearchInputs() {
  allSearchInputs.forEach((input) => {
    if (input) {
      input.value = "";
      input.classList.remove("input-invalid");
    }
  });
  tableHeaders.forEach((th) => th.classList.remove("searching-column"));
}

function applyCurrentFiltersAndSort() {
  displayFileContents(filteredAndSortedRows, currentPage, rowsPerPage);
}

function clearHighlightingAndFilters() {
  filteredAndSortedRows = [...dataRows];
  currentPage = 1;
  currentSortColumn = null;
  currentSortDirection = "asc";
  tableHeaders.forEach((th) => {
    const sortableText = th.querySelector(".sortable-header-text");
    if (sortableText) {
      const indicator = sortableText.querySelector(".sort-indicator");
      if (indicator) indicator.className = "sort-indicator";
    }
    th.classList.remove("searching-column");
  });
  if (rowsPerPageSelect) {
    rowsPerPage =
      rowsPerPageSelect.value === "all"
        ? "all"
        : parseInt(rowsPerPageSelect.value) || 50;
  }
  displayFileContents(filteredAndSortedRows, currentPage, rowsPerPage);
  clearSearchInputs();
}

function searchTable(columnIndex, inputValue) {
  if (!fileTableBody) return;
  var searchTerm = inputValue.trim().toLowerCase();
  tableHeaders.forEach((th) => th.classList.remove("searching-column"));
  var currentHeader = document.querySelector(
    `#fileTable th:nth-child(${columnIndex + 1})`
  );
  if (columnIndex === 6) {
    showAlert("A coluna CRC não é pesquisável.", "info");
    return;
  }
  if (searchTerm === "") {
    if (currentHeader) currentHeader.classList.remove("searching-column");
    filteredAndSortedRows = [...dataRows];
    if (currentSortColumn)
      sortData(currentSortColumn, currentSortDirection, false);
    currentPage = 1;
    displayFileContents(filteredAndSortedRows, currentPage, rowsPerPage);
    return;
  }
  if (currentHeader) currentHeader.classList.add("searching-column");
  filteredAndSortedRows = dataRows.filter(function (row) {
    var keys = ["nsr", "codigoEvento", "data", "hora", "pis", "crc"];
    var keyIndex = columnIndex - 1;
    if (keyIndex >= 0 && keyIndex < keys.length) {
      var cellValue = String(row[keys[keyIndex]] || "").toLowerCase();
      return cellValue.includes(searchTerm);
    }
    return false;
  });
  if (currentSortColumn)
    sortData(currentSortColumn, currentSortDirection, false);
  currentPage = 1;
  displayFileContents(filteredAndSortedRows, currentPage, rowsPerPage);
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
  if (matchCount === 0)
    showAlert('Nenhuma correspondência para "' + inputValue + '".', "info");
}

function toggleScrollButtonVisibility(show) {
  if (scrollTopBottomButton) {
    if (show && (filteredAndSortedRows.length > 0 || dataRows.length > 0)) {
      scrollTopBottomButton.style.display = "flex";
      setTimeout(() => scrollTopBottomButton.classList.add("visible"), 10);
    } else {
      scrollTopBottomButton.classList.remove("visible");
      setTimeout(() => {
        if (!scrollTopBottomButton.classList.contains("visible"))
          scrollTopBottomButton.style.display = "none";
      }, 300);
    }
  }
}

function setScrollButtonState(atBottom) {
  isScrolledToBottom = atBottom;
  if (scrollTopBottomButton) {
    scrollTopBottomButton.innerHTML = isScrolledToBottom ? "⬆️" : "⬇️";
    scrollTopBottomButton.title = isScrolledToBottom
      ? "Subir para o topo"
      : "Descer até o final";
  }
}

function sortData(columnKey, direction, toggleDirection = true) {
  if (toggleDirection) {
    currentSortDirection =
      currentSortColumn === columnKey && currentSortDirection === "asc"
        ? "desc"
        : "asc";
  } else {
    currentSortDirection = direction;
  }
  currentSortColumn = columnKey;
  tableHeaders.forEach((th) => {
    const sortableText = th.querySelector(".sortable-header-text");
    if (sortableText) {
      const indicator = sortableText.querySelector(".sort-indicator");
      if (indicator) {
        indicator.className = "sort-indicator";
        if (th.dataset.columnKey === columnKey)
          indicator.classList.add(currentSortDirection);
      }
    }
  });
  filteredAndSortedRows.sort((a, b) => {
    let valA = a[columnKey];
    let valB = b[columnKey];
    if (columnKey === "originalLineNumber") {
      valA = parseInt(a.originalLineNumber) || 0;
      valB = parseInt(b.originalLineNumber) || 0;
    } else if (columnKey === "data") {
      const partsA = String(valA || "").split("/");
      const partsB = String(valB || "").split("/");
      if (partsA.length === 3) valA = `${partsA[2]}-${partsA[1]}-${partsA[0]}`;
      else valA = "";
      if (partsB.length === 3) valB = `${partsB[2]}-${partsB[1]}-${partsB[0]}`;
      else valB = "";
    } else if (columnKey === "hora") {
      valA = String(valA || "").replace(":", "");
      valB = String(valB || "").replace(":", "");
    } else if (["nsr", "pis", "codigoEvento", "crc"].includes(columnKey)) {
      valA = String(valA || "").toLowerCase();
      valB = String(valB || "").toLowerCase();
    } else if (typeof valA === "string") {
      valA = valA.toLowerCase();
      valB = String(valB || "").toLowerCase();
    }
    if (valA < valB) return currentSortDirection === "asc" ? -1 : 1;
    if (valA > valB) return currentSortDirection === "asc" ? 1 : -1;
    return 0;
  });
}

function setupInputValidation() {
  if (searchNSRInput) {
    searchNSRInput.addEventListener("input", function (e) {
      this.value = this.value.replace(/[^\d]/g, "");
      this.classList.toggle(
        "input-invalid",
        this.value.length > 0 && !/^\d*$/.test(this.value)
      );
    });
  }
  if (searchCodigoEventoInput) {
    searchCodigoEventoInput.addEventListener("input", function (e) {
      this.value = this.value.replace(/[^\d]/g, "");
      const isValid = this.value.length === 0 || /^[023456]$/.test(this.value);
      this.classList.toggle("input-invalid", !isValid && this.value.length > 0);
    });
  }
  if (searchDataInput) {
    searchDataInput.addEventListener("input", function (e) {
      let v = this.value.replace(/[^\d]/g, "");
      if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
      if (v.length > 5) v = v.slice(0, 5) + "/" + v.slice(5);
      this.value = v.slice(0, 10);
      const dateParts = this.value.split("/");
      const isValidDate =
        this.value.length === 0 ||
        (this.value.length === 10 &&
          dateParts.length === 3 &&
          !isNaN(
            Date.parse(dateParts[2] + "-" + dateParts[1] + "-" + dateParts[0])
          ) &&
          parseInt(dateParts[1], 10) >= 1 &&
          parseInt(dateParts[1], 10) <= 12 &&
          parseInt(dateParts[0], 10) >= 1 &&
          parseInt(dateParts[0], 10) <= 31);
      this.classList.toggle(
        "input-invalid",
        this.value.length > 0 && !isValidDate
      );
    });
  }
  if (searchHoraInput) {
    searchHoraInput.addEventListener("input", function (e) {
      let v = this.value.replace(/[^\d]/g, "");
      if (v.length > 2) v = v.slice(0, 2) + ":" + v.slice(2);
      this.value = v.slice(0, 5);
      const timeParts = this.value.split(":");
      const isValidTime =
        this.value.length === 0 ||
        (this.value.length === 5 &&
          timeParts.length === 2 &&
          parseInt(timeParts[0], 10) >= 0 &&
          parseInt(timeParts[0], 10) <= 23 &&
          parseInt(timeParts[1], 10) >= 0 &&
          parseInt(timeParts[1], 10) <= 59);
      this.classList.toggle(
        "input-invalid",
        this.value.length > 0 && !isValidTime
      );
    });
  }
  if (searchPISInput) {
    searchPISInput.addEventListener("input", function (e) {
      this.value = this.value.replace(/[^\d]/g, "");
      this.classList.toggle(
        "input-invalid",
        this.value.length > 0 && !/^\d*$/.test(this.value)
      );
    });
  }
}

// --- Event Listeners ---

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
      if (validationErrorsSection)
        validationErrorsSection.style.display = "none";
      return;
    }
    if (fileNameDisplay) fileNameDisplay.textContent = file.name;

    if (removeButton) removeButton.disabled = true;
    if (clearButton) clearButton.disabled = true;
    toggleLoadingOverlay(true);
    if (validationErrorsSection) validationErrorsSection.style.display = "none";

    var reader = new FileReader();
    loadingStartTime = Date.now();

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
        toggleLoadingOverlay(false);
        return;
      }

      worker.onmessage = function (eventWorker) {
        const processingTime = Date.now() - loadingStartTime;
        const minDisplayTime = 300;

        const hideSpinnerAndProcess = () => {
          toggleLoadingOverlay(false);
          var result = eventWorker.data;

          if (result.errors && result.errors.length > 0) {
            displayValidationErrors(result.errors);
          } else {
            if (validationErrorsSection)
              validationErrorsSection.style.display = "none";
          }

          if (!result.data || result.data.length === 0) {
            if (!result.errors || result.errors.length === 0) {
              showAlert(
                "Arquivo carregado está vazio ou não contém dados AFD reconhecíveis.",
                "info"
              );
            }
            dataRows = [];
          } else {
            dataRows = result.data;
            if (!result.errors || result.errors.length === 0) {
              showAlert(
                dataRows.length + " linhas processadas com sucesso!",
                "success"
              );
            }
          }

          filteredAndSortedRows = [...dataRows];
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

          currentSortColumn = null;
          currentSortDirection = "asc";
          tableHeaders.forEach((th) => {
            const sortableText = th.querySelector(".sortable-header-text");
            if (sortableText) {
              const indicator = sortableText.querySelector(".sort-indicator");
              if (indicator) indicator.className = "sort-indicator";
            }
            th.classList.remove("searching-column");
          });

          displayFileContents(filteredAndSortedRows, currentPage, rowsPerPage);

          if (removeButton) removeButton.disabled = dataRows.length === 0;
          if (clearButton) clearButton.disabled = false;
          clearSearchInputs();
        };

        if (processingTime < minDisplayTime) {
          setTimeout(hideSpinnerAndProcess, minDisplayTime - processingTime);
        } else {
          hideSpinnerAndProcess();
        }
      };
      worker.onerror = function (error) {
        toggleLoadingOverlay(false);
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
      toggleLoadingOverlay(false);
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
    filteredAndSortedRows = [];
    originalRowCount = 0;
    clearSearchInputs();
    displayFileContents([]);
    if (fileSummarySection) fileSummarySection.style.display = "none";
    if (paginationControls) paginationControls.style.display = "none";
    if (validationErrorsSection) validationErrorsSection.style.display = "none";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  allSearchInputs = document.querySelectorAll(".search-input");
  searchNSRInput = document.getElementById("searchNSR");
  searchCodigoEventoInput = document.getElementById("searchCodigoEvento");
  searchDataInput = document.getElementById("searchData");
  searchHoraInput = document.getElementById("searchHora");
  searchPISInput = document.getElementById("searchPIS");
  setupInputValidation();

  searchButtons = document.querySelectorAll(".search-button");
  searchButtons.forEach(function (button) {
    if (!button) return;
    button.addEventListener("click", function () {
      var input = this.previousElementSibling;
      if (input && input.classList.contains("search-input")) {
        var th = input.closest("th");
        if (th) {
          var columnIndex = Array.from(th.parentNode.children).indexOf(th);
          searchTable(columnIndex, input.value);
        }
      }
    });
  });

  allSearchInputs.forEach(function (input) {
    if (!input) return;
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

  var savedTheme = localStorage.getItem("theme");
  // Aplica tema do sistema se nenhum tema salvo ou se é a primeira vez
  if (
    !savedTheme &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: light)").matches
  ) {
    document.body.classList.add("theme-light");
    if (themeSwitcherButton) {
      themeSwitcherButton.textContent = "☀️";
      themeSwitcherButton.title = "Alternar para Tema Escuro";
    }
  } else if (savedTheme === "light") {
    document.body.classList.add("theme-light");
    if (themeSwitcherButton) {
      themeSwitcherButton.textContent = "☀️";
      themeSwitcherButton.title = "Alternar para Tema Escuro";
    }
  } else {
    // Padrão para escuro se não houver preferência do sistema para claro ou se salvo como escuro
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
  if (validationErrorsSection) validationErrorsSection.style.display = "none";
  updateBodyHeight();
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
    localStorage.setItem("theme", isLightTheme ? "light" : "dark"); // Salva a escolha manual
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
    if (filteredAndSortedRows.length > 0 || dataRows.length > 0) {
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
      displayFileContents(filteredAndSortedRows, currentPage, rowsPerPage);
    }
  });
}
if (nextPageButton) {
  nextPageButton.addEventListener("click", () => {
    if (rowsPerPage === "all") return;
    var totalPages = Math.ceil(filteredAndSortedRows.length / rowsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      displayFileContents(filteredAndSortedRows, currentPage, rowsPerPage);
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
    displayFileContents(filteredAndSortedRows, currentPage, rowsPerPage);
  });
}

tableHeaders.forEach((th) => {
  const sortableTextSpan = th.querySelector(".sortable-header-text");
  if (sortableTextSpan && th.dataset.sortable === "true") {
    sortableTextSpan.addEventListener("click", function () {
      const columnKey = th.dataset.columnKey;
      if (columnKey) {
        sortData(columnKey, currentSortDirection);
        displayFileContents(filteredAndSortedRows, currentPage, rowsPerPage);
      }
    });
  }
});

if (closeValidationErrorsButton) {
  closeValidationErrorsButton.addEventListener("click", function () {
    if (validationErrorsSection) {
      validationErrorsSection.style.display = "none";
    }
  });
}

if (toggleSummaryButton && fileSummaryContent) {
  toggleSummaryButton.addEventListener("click", function () {
    fileSummaryContent.classList.toggle("collapsed");
    if (fileSummaryContent.classList.contains("collapsed")) {
      this.textContent = "➕"; // Expandir
      this.title = "Expandir Resumo";
    } else {
      this.textContent = "➖"; // Minimizar
      this.title = "Minimizar Resumo";
    }
    updateBodyHeight(); // Reajusta altura após colapsar/expandir
  });
}

window.addEventListener("resize", function () {
  updateBodyHeight();
});
