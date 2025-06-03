// Variáveis globais para elementos do DOM
var fileInput = document.getElementById("fileInput");
var fileTableBody = document.querySelector("#fileTable tbody");
var removeButton = document.getElementById("removeButton");
var searchInputs = document.querySelectorAll(".search-input");
var searchButtons = document.querySelectorAll(".search-button");
var clearButton = document.getElementById("clearButton");

var dataRows = []; // Armazena as linhas de dados originais do arquivo
var originalRowCount = 0; // Armazena o número original de linhas na tabela

/**
 * Ajusta a altura mínima do corpo da página com base na altura da tabela de arquivos.
 */
function updateBodyHeight() {
  var fileTable = document.getElementById("fileTable");
  if (fileTable) {
    var fileTableHeight = fileTable.offsetHeight;
    var body = document.body;
    // Adiciona um pequeno buffer para garantir que haja espaço
    body.style.minHeight = fileTableHeight + 200 + "px";
  }
}

/**
 * Exibe o conteúdo do arquivo AFD processado na tabela.
 * @param {Array<Object>} rows - As linhas de dados a serem exibidas.
 */
function displayFileContents(rows) {
  if (!fileTableBody) return;

  var fragment = document.createDocumentFragment();

  rows.forEach(function (row, index) {
    var tr = document.createElement("tr");
    // Coluna de número de linha adicionada dinamicamente
    var rowNumberCell = document.createElement("td");
    rowNumberCell.textContent = index + 1;
    tr.appendChild(rowNumberCell);

    // Adiciona outras células baseadas nos dados da linha
    ["nsr", "codigoEvento", "data", "hora", "pis", "crc"].forEach(function (
      key
    ) {
      var td = document.createElement("td");
      td.textContent = row[key] || ""; // Garante que mesmo campos vazios criem uma célula
      tr.appendChild(td);
    });
    fragment.appendChild(tr);
  });

  fileTableBody.innerHTML = ""; // Limpa o conteúdo anterior
  fileTableBody.appendChild(fragment);
  updateBodyHeight(); // Ajusta a altura do corpo após adicionar conteúdo
}

/**
 * Exibe uma caixa de alerta personalizada.
 * @param {string} message - A mensagem a ser exibida no alerta.
 */
function showAlert(message) {
  var overlay = document.createElement("div");
  overlay.className = "alert-overlay";

  var alertBox = document.createElement("div");
  alertBox.className = "alert-box";

  var messageText = document.createElement("div");
  messageText.className = "alert-message";
  messageText.textContent = message;

  var closeButton = document.createElement("div");
  closeButton.className = "alert-close";
  closeButton.textContent = "Fechar";

  alertBox.appendChild(messageText);
  alertBox.appendChild(closeButton);
  overlay.appendChild(alertBox);
  document.body.appendChild(overlay);

  closeButton.addEventListener("click", function () {
    document.body.removeChild(overlay);
  });

  // Fecha o alerta ao clicar fora da caixa de alerta
  overlay.addEventListener("click", function (event) {
    if (event.target === overlay) {
      document.body.removeChild(overlay);
    }
  });
}

/**
 * Limpa os campos de input da busca.
 */
function clearSearchInputs() {
  searchInputs.forEach(function (input) {
    if (input) input.value = "";
  });
}

/**
 * Remove qualquer destaque de busca da tabela e exibe todas as linhas originais.
 */
function clearHighlighting() {
  if (!fileTableBody) return;
  var rows = fileTableBody.getElementsByTagName("tr");

  for (var i = 0; i < rows.length; i++) {
    rows[i].classList.remove("highlight-row");
    rows[i].style.display = ""; // Mostra a linha
    var cells = rows[i].getElementsByTagName("td");
    for (var j = 0; j < cells.length; j++) {
      // Restaura o conteúdo original da célula (se foi alterado pelo destaque)
      // Esta é uma simplificação. Para restaurar perfeitamente, precisaríamos
      // armazenar o conteúdo original antes de destacar.
      // Por agora, apenas removemos o span de destaque.
      var highlightedSpan = cells[j].querySelector("span.highlight");
      if (highlightedSpan) {
        cells[j].innerHTML = cells[j].textContent; // Remove o span e mantém o texto
      }
    }
  }
  // Após limpar os destaques, se houver dados, reexibe os dados originais
  // Isso garante que a tabela volte ao estado inicial sem filtros.
  if (dataRows.length > 0) {
    displayFileContents(dataRows);
  }
}

/**
 * Busca na tabela pela string de entrada na coluna especificada e destaca os resultados.
 * @param {number} columnIndex - O índice da coluna onde a busca será realizada.
 * @param {string} inputValue - O valor a ser buscado.
 */
function searchTable(columnIndex, inputValue) {
  if (!fileTableBody) return;

  // Se o valor da busca estiver vazio, limpa os destaques e reexibe tudo.
  if (inputValue.trim() === "") {
    clearHighlighting();
    displayFileContents(dataRows); // Mostra todos os dados originais
    return;
  }

  var rows = fileTableBody.getElementsByTagName("tr");
  var matchCount = 0;
  var firstMatchRow = -1;
  var inputLower = inputValue.toLowerCase();

  for (var i = 0; i < rows.length; i++) {
    var cell = rows[i].getElementsByTagName("td")[columnIndex];
    if (cell) {
      var cellText = cell.textContent || cell.innerText;
      var cellTextLower = cellText.toLowerCase();
      var matchIndex = cellTextLower.indexOf(inputLower);

      // Limpa destaque anterior da célula
      cell.innerHTML = cellText;
      rows[i].classList.remove("highlight-row");

      if (matchIndex > -1) {
        var originalText = cellText.substr(matchIndex, inputValue.length);
        var highlightedText =
          '<span class="highlight">' + originalText + "</span>";
        cell.innerHTML =
          cellText.substring(0, matchIndex) +
          highlightedText +
          cellText.substring(matchIndex + inputValue.length);
        rows[i].classList.add("highlight-row");
        rows[i].style.display = ""; // Mostra a linha
        if (matchCount === 0) {
          firstMatchRow = i;
        }
        matchCount++;
      } else {
        rows[i].style.display = "none"; // Esconde a linha que não corresponde
      }
    }
  }

  if (matchCount > 0) {
    showAlert(
      "Foram encontradas " +
        matchCount +
        " correspondências.\nA primeira correspondência está na linha " +
        (firstMatchRow + 1) +
        "."
    );
  } else {
    showAlert(
      "Nenhuma correspondência encontrada. Por favor, verifique sua pesquisa."
    );
    // Não chama clearHighlighting aqui, para manter as linhas não correspondentes ocultas
    // O usuário pode querer limpar explicitamente ou fazer outra busca.
  }
}

// Event listener para o input de arquivo
if (fileInput) {
  fileInput.addEventListener("change", function (e) {
    var file = e.target.files[0];
    if (!file) {
      if (removeButton) removeButton.disabled = true;
      return;
    }
    var reader = new FileReader();

    reader.onload = function (eventReader) {
      var contents = eventReader.target.result;
      // Caminho para o worker a partir da localização do index.html (raiz do PWA)
      var worker;
      try {
        worker = new Worker("js/fileWorker.js");
      } catch (error) {
        console.error("Erro ao criar Web Worker: ", error);
        showAlert(
          "Não foi possível iniciar o processador de arquivos. Verifique se seu navegador suporta Web Workers ou se há um erro no script."
        );
        return;
      }

      worker.onmessage = function (eventWorker) {
        dataRows = eventWorker.data;
        originalRowCount = dataRows.length;
        displayFileContents(dataRows); // Exibe os dados processados
        if (removeButton) removeButton.disabled = false;
        clearSearchInputs(); // Limpa buscas anteriores
      };

      worker.onerror = function (error) {
        console.error(
          "Erro no Web Worker:",
          error.message,
          error.filename,
          error.lineno
        );
        showAlert("Ocorreu um erro ao processar o arquivo com o Web Worker.");
      };

      worker.postMessage(contents);
    };

    reader.onerror = function () {
      showAlert("Ocorreu um erro ao ler o arquivo selecionado.");
    };
    reader.readAsText(file);
  });
}

// Event listener para o botão de remover arquivo
if (removeButton) {
  removeButton.addEventListener("click", function () {
    if (fileInput) fileInput.value = ""; // Limpa o campo de input do arquivo
    if (fileTableBody) fileTableBody.innerHTML = ""; // Limpa a tabela
    removeButton.disabled = true;
    dataRows = []; // Limpa os dados armazenados
    originalRowCount = 0;
    clearSearchInputs(); // Limpa também os campos de busca
    updateBodyHeight(); // Reajusta a altura
  });
}

// Event listeners para os inputs de busca
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
      // Encontra o índice da coluna baseado na posição do input dentro do seu cabeçalho <th>
      // Assume que o input está em um <div> dentro de um <th>, e os <th>s estão em um <tr>.
      // O primeiro <th> (Linhas) não tem input, então o +1 compensa isso.
      // Os <td> da tabela de dados começam do índice 0 para a coluna de linhas.
      // Então, para a coluna "NSR", o input está no <th> de índice 1 (0-indexed),
      // e os dados de NSR estão na célula <td> de índice 1 na tabela.
      var th = input.closest("th");
      if (th) {
        var columnIndex = Array.from(th.parentNode.children).indexOf(th);
        searchTable(columnIndex, input.value);
      }
    }
  });
});

// Event listeners para os botões de pesquisa
searchButtons.forEach(function (button) {
  if (!button) return;
  button.addEventListener("click", function () {
    var input = button.previousElementSibling; // Assume que o input é o irmão anterior
    if (input && input.classList.contains("search-input")) {
      var th = input.closest("th");
      if (th) {
        var columnIndex = Array.from(th.parentNode.children).indexOf(th);
        searchTable(columnIndex, input.value);
      }
    }
  });
});

// Event listener para o botão de limpar busca
if (clearButton) {
  clearButton.addEventListener("click", function () {
    clearSearchInputs();
    clearHighlighting(); // Isso já chama displayFileContents(dataRows) se houver dados
    if (dataRows.length === 0 && fileTableBody) {
      // Se não há dados, apenas limpa a tabela
      fileTableBody.innerHTML = "";
    }
    updateBodyHeight();
  });
}

// Ajusta a altura do corpo quando a janela é redimensionada
window.addEventListener("resize", function () {
  updateBodyHeight();
});

// Ajuste inicial da altura ao carregar a página
window.addEventListener("load", function () {
  updateBodyHeight();
});
