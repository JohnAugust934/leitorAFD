// Variáveis globais para elementos do DOM
var fileInput = document.getElementById("fileInput");
var fileTableBody = document.querySelector("#fileTable tbody");
var removeButton = document.getElementById("removeButton");
var searchInputs = document.querySelectorAll(".search-input");
var searchButtons = document.querySelectorAll(".search-button");
var clearButton = document.getElementById("clearButton");
var themeSwitcherButton = document.getElementById("themeSwitcherButton");
var fileNameDisplay = document.getElementById("fileNameDisplay");
var scrollTopBottomButton = document.getElementById("scrollTopBottomButton"); // Novo botão

var dataRows = [];
var originalRowCount = 0;
var isScrolledToBottom = false; // Estado do botão de rolagem

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

function displayFileContents(rows) {
  if (!fileTableBody) {
    console.error("Elemento fileTableBody não encontrado.");
    return;
  }
  var fragment = document.createDocumentFragment();
  if (!rows || rows.length === 0) {
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    td.colSpan = 7;
    td.textContent = "Nenhum dado para exibir. Carregue um arquivo AFD.";
    td.style.textAlign = "center";
    td.style.padding = "20px";
    tr.appendChild(td);
    fragment.appendChild(tr);
    toggleScrollButtonVisibility(false); // Esconde o botão se não há dados
  } else {
    rows.forEach(function (row, index) {
      var tr = document.createElement("tr");
      var rowNumberCell = document.createElement("td");
      rowNumberCell.textContent = index + 1;
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
    toggleScrollButtonVisibility(true); // Mostra o botão quando há dados
    setScrollButtonState(false); // Reseta para "descer"
  }
  fileTableBody.innerHTML = "";
  fileTableBody.appendChild(fragment);
  updateBodyHeight();
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
  displayFileContents(dataRows);
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

  var filteredRows = dataRows.filter(function (row) {
    var keys = ["nsr", "codigoEvento", "data", "hora", "pis", "crc"];
    var keyIndex = columnIndex - 1;

    if (keyIndex >= 0 && keyIndex < keys.length) {
      var cellValue = String(row[keys[keyIndex]] || "").toLowerCase();
      return cellValue.includes(searchTerm);
    }
    return false;
  });

  displayFileContents(filteredRows);

  var tableRowsRendered = fileTableBody.getElementsByTagName("tr");
  var matchCount = 0;
  var firstMatchOriginalIndex = -1;

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

        if (matchCount === 0 && i < filteredRows.length) {
          const originalRowData = filteredRows[i];
          const originalIndexInDataRows = dataRows.findIndex(
            (dr) =>
              dr.nsr === originalRowData.nsr &&
              dr.pis === originalRowData.pis &&
              dr.data === originalRowData.data &&
              dr.hora === originalRowData.hora &&
              dr.codigoEvento === originalRowData.codigoEvento
          );
          firstMatchOriginalIndex =
            originalIndexInDataRows !== -1
              ? originalIndexInDataRows + 1
              : i + 1;
        }
        matchCount++;
      }
    }
  }

  if (matchCount > 0) {
    showAlert(
      "Foram encontradas " +
        matchCount +
        " correspondências.\nA primeira está aproximadamente na linha " +
        firstMatchOriginalIndex +
        " do arquivo original (considerando filtros).",
      "success"
    );
  } else {
    showAlert(
      'Nenhuma correspondência encontrada para "' + inputValue + '".',
      "info"
    );
  }
}

/**
 * Controla a visibilidade do botão de rolagem.
 * @param {boolean} show - True para mostrar, false para esconder.
 */
function toggleScrollButtonVisibility(show) {
  if (scrollTopBottomButton) {
    if (show && dataRows.length > 0) {
      // Só mostra se houver dados
      scrollTopBottomButton.style.display = "flex"; // Usa flex para centralizar o ícone
      setTimeout(() => scrollTopBottomButton.classList.add("visible"), 10); // Para transição de opacidade
    } else {
      scrollTopBottomButton.classList.remove("visible");
      // Espera a transição de opacidade antes de esconder com display:none
      setTimeout(() => {
        if (!scrollTopBottomButton.classList.contains("visible")) {
          scrollTopBottomButton.style.display = "none";
        }
      }, 300);
    }
  }
}

/**
 * Define o estado do botão de rolagem (ícone e ação).
 * @param {boolean} atBottom - True se a página estiver no final, false caso contrário.
 */
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
        originalRowCount = dataRows.length;
        displayFileContents(dataRows); // Isso já chama toggleScrollButtonVisibility
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
    originalRowCount = 0;
    clearSearchInputs();
    displayFileContents([]); // Isso chama toggleScrollButtonVisibility(false)
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
    clearHighlightingAndFilters(); // Isso reexibe todos os dados e atualiza o botão de rolagem
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

// Lógica do botão de rolagem
if (scrollTopBottomButton) {
  scrollTopBottomButton.addEventListener("click", function () {
    if (isScrolledToBottom) {
      // Se está no final, sobe
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Se não está no final (ou está no topo), desce
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }
  });

  // Atualiza o estado do botão ao rolar a página
  window.addEventListener("scroll", function () {
    if (dataRows.length > 0) {
      // Só se houver conteúdo para rolar
      // Verifica se está perto do final da página
      if (
        window.innerHeight + window.scrollY + 100 >=
        document.body.scrollHeight
      ) {
        // Adiciona uma tolerância de 100px
        setScrollButtonState(true); // Está no final
      } else {
        setScrollButtonState(false); // Não está no final
      }
      toggleScrollButtonVisibility(true); // Mantém visível se há scroll
    } else {
      toggleScrollButtonVisibility(false);
    }
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
  displayFileContents([]);
  updateBodyHeight();
});

window.addEventListener("resize", function () {
  updateBodyHeight();
});
