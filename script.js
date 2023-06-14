var fileInput = document.getElementById('fileInput');
var fileTableBody = document.querySelector('#fileTable tbody');
var removeButton = document.getElementById('removeButton');
var searchInputs = document.querySelectorAll('.search-input');
var searchButtons = document.querySelectorAll('.search-button');
var clearButton = document.getElementById('clearButton');

var dataRows = []; // Armazena as linhas de dados
var originalRowCount = 0; // Armazena o número original de linhas na tabela

fileInput.addEventListener('change', function (e) {
    var file = e.target.files[0];
    var reader = new FileReader();

    reader.onload = function (e) {
        var contents = e.target.result;

        // Processamento do arquivo em um Web Worker
        var worker = new Worker('fileWorker.js');
        worker.postMessage(contents); // Enviar o conteúdo do arquivo para o Web Worker

        worker.onmessage = function (event) {
            dataRows = event.data;
            originalRowCount = dataRows.length;
            displayFileContents(dataRows);
            removeButton.disabled = false;
        };
    };

    reader.readAsText(file);
});

function displayFileContents(rows) {
    var fragment = document.createDocumentFragment(); // Usar um fragmento para evitar múltiplas reflows

    rows.forEach(function (row, index) {
        var tr = document.createElement('tr');
        tr.innerHTML =
            '<td>' +
            (index + 1) +
            '</td>' + // Coluna de número de linha
            '<td>' +
            row.nsr +
            '</td>' +
            '<td>' +
            row.codigoEvento +
            '</td>' +
            '<td>' +
            row.data +
            '</td>' +
            '<td>' +
            row.hora +
            '</td>' +
            '<td>' +
            row.pis +
            '</td>' +
            '<td>' +
            row.crc +
            '</td>';

        fragment.appendChild(tr);
    });

    fileTableBody.innerHTML = '';
    fileTableBody.appendChild(fragment);
}

function formatDate(dateString) {
    var day = dateString.substr(0, 2);
    var month = dateString.substr(2, 2);
    var year = dateString.substr(4, 4);
    return day + '/' + month + '/' + year;
}

function formatTime(timeString) {
    var hour = timeString.substr(0, 2);
    var minute = timeString.substr(2, 2);
    return hour + ':' + minute;
}

removeButton.addEventListener('click', function () {
    fileInput.value = '';
    fileTableBody.innerHTML = '';
    removeButton.disabled = true;
});

// Restrição de quantidade de caracteres nos campos de busca
searchInputs.forEach(function (input) {
    var maxLength = parseInt(input.getAttribute('maxlength'));

    input.addEventListener('input', function (event) {
        var inputValue = input.value;

        if (inputValue.length > maxLength) {
            input.value = inputValue.slice(0, maxLength);
        }
    });

    input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            var columnIndex = Array.from(input.parentNode.children).indexOf(input) + 1;
            var inputValue = input.value;
            searchTable(columnIndex, inputValue, maxLength);
        }
    });
});

//

function showAlert(message) {
    var overlay = document.createElement('div');
    overlay.className = 'alert-overlay';

    var alertBox = document.createElement('div');
    alertBox.className = 'alert-box';

    var messageText = document.createElement('div');
    messageText.className = 'alert-message';
    messageText.textContent = message;

    var closeButton = document.createElement('div');
    closeButton.className = 'alert-close';
    closeButton.textContent = 'Fechar';

    alertBox.appendChild(messageText);
    alertBox.appendChild(closeButton);
    overlay.appendChild(alertBox);
    document.body.appendChild(overlay);

    closeButton.addEventListener('click', function () {
        document.body.removeChild(overlay);
    });
}


// Função para buscar e destacar os resultados na tabela
function searchTable(columnIndex, inputValue, maxLength) {
    if (inputValue.length > maxLength) {
        inputValue = inputValue.slice(0, maxLength);
    }

    var rows = fileTableBody.getElementsByTagName('tr');
    var matchCount = 0; // Contador para o número de correspondências encontradas
    var firstMatchRow = -1; // Índice da primeira linha com correspondência

    for (var i = 0; i < rows.length; i++) {
        var td = rows[i].getElementsByTagName('td')[columnIndex];
        var txtValue = td.textContent || td.innerText;
        var matchIndex = txtValue.toLowerCase().indexOf(inputValue.toLowerCase());

        if (matchIndex > -1) {
            // Se a correspondência for encontrada, destacar o resultado e aplicar a classe 'highlight'
            var highlightText =
                '<span class="highlight">' +
                txtValue.substr(matchIndex, inputValue.length) +
                '</span>';
            td.innerHTML =
                txtValue.substr(0, matchIndex) +
                highlightText +
                txtValue.substr(matchIndex + inputValue.length);
            rows[i].classList.add('highlight-row'); // Adicionar classe 'highlight-row'

            // Atualizar o contador e o índice da primeira correspondência, se necessário
            if (matchCount === 0) {
                firstMatchRow = i;
            }
            matchCount++;
            rows[i].style.display = ''; // Exibir a linha correspondente
        } else {
            // Caso contrário, restaurar o texto original e remover a classe 'highlight-row'
            td.innerHTML = txtValue;
            rows[i].classList.remove('highlight-row');
            rows[i].style.display = 'none'; // Ocultar a linha não correspondente
        }
    }

    // Exibir o alerta de resposta com o número de correspondências e a primeira linha encontrada
    if (matchCount > 0) {
        showAlert(
            'Foram encontradas ' +
            matchCount +
            ' correspondências.\nA primeira correspondência está na linha ' +
            (firstMatchRow + 1) +
            '.'
        );
    } else {
        showAlert('Nenhuma correspondência encontrada. Por favor, verifique sua pesquisa.');
        clearHighlighting(); // Exibir todas as linhas novamente após a mensagem de alerta
    }
}

// Manipuladores de evento para botões de pesquisa
searchButtons.forEach(function (button, index) {
    button.addEventListener('click', function () {
        var columnIndex = index + 1; // Adicionar 1 para compensar a coluna adicional do número da linha
        var input = button.previousElementSibling;
        var inputValue = input.value;
        var maxLength = parseInt(input.getAttribute('maxlength'));
        searchTable(columnIndex, inputValue, maxLength);
    });
});

clearButton.addEventListener('click', function () {
    clearSearchInputs();
    clearHighlighting();
    displayFileContents(dataRows); // Restaurar a exibição original do arquivo
});

// Função para limpar os campos de pesquisa
function clearSearchInputs() {
    searchInputs.forEach(function (input) {
        input.value = '';
    });
}

// Função para limpar o destaque dos resultados e exibir todas as linhas
function clearHighlighting() {
    var rows = fileTableBody.getElementsByTagName('tr');

    for (var i = 0; i < rows.length; i++) {
        var td = rows[i].getElementsByTagName('td')[0]; // A primeira coluna contém o número da linha
        var txtValue = td.textContent || td.innerText;
        td.innerHTML = txtValue;
        rows[i].classList.remove('highlight-row');
        rows[i].style.display = ''; // Exibir todas as linhas
    }
}

document.getElementById("logoutButton").addEventListener("click", function () {
    // Redirecionar para a página de logout
    window.location.href = "index.php";
});
