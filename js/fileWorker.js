// js/fileWorker.js

/**
 * Valida se uma string contém apenas dígitos.
 * @param {string} str A string para validar.
 * @returns {boolean} True se contém apenas dígitos, false caso contrário.
 */
function isNumeric(str) {
    if (typeof str !== 'string') return false;
    return /^\d+$/.test(str);
}

/**
 * Valida o formato da data (DDMMYYYY) e se é uma data plausível.
 * @param {string} dateStr A string da data.
 * @returns {boolean} True se o formato e a data forem válidos, false caso contrário.
 */
function isValidDateString(dateStr) {
    if (!isNumeric(dateStr) || dateStr.length !== 8) return false;
    const day = parseInt(dateStr.substring(0, 2), 10);
    const month = parseInt(dateStr.substring(2, 4), 10);
    const year = parseInt(dateStr.substring(4, 8), 10);

    // Verificação básica de intervalo
    if (year < 1900 || year > 2100) return false; // Ano razoável
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;

    // Verificações mais específicas (dias no mês)
    if ((month === 4 || month === 6 || month === 9 || month === 11) && day > 30) {
        return false;
    }
    if (month === 2) {
        const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
        if (isLeap && day > 29) return false;
        if (!isLeap && day > 28) return false;
    }
    return true;
}

/**
 * Valida o formato da hora (HHMM).
 * @param {string} timeStr A string da hora.
 * @returns {boolean} True se o formato for válido, false caso contrário.
 */
function isValidTimeString(timeStr) {
    if (!isNumeric(timeStr) || timeStr.length !== 4) return false;
    const hour = parseInt(timeStr.substring(0, 2), 10);
    const minute = parseInt(timeStr.substring(2, 4), 10);
    return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
}


/**
 * Formata a string de data de DDMMYYYY para DD/MM/YYYY.
 * @param {string} dateString A string da data no formato DDMMYYYY.
 * @returns {string} A data formatada ou a string original se inválida/não formatável.
 */
function formatDate(dateString) {
    if (dateString && dateString.length === 8 && isNumeric(dateString)) {
        // Verifica se é uma data válida antes de formatar para exibição
        // A validação mais rigorosa já foi feita antes de chegar aqui se o fluxo for seguido
        return `${dateString.substr(0, 2)}/${dateString.substr(2, 2)}/${dateString.substr(4, 4)}`;
    }
    return dateString;
}

/**
 * Formata a string de hora de HHMM para HH:MM.
 * @param {string} timeString A string da hora no formato HHMM.
 * @returns {string} A hora formatada ou a string original se inválida/não formatável.
 */
function formatTime(timeString) {
    if (timeString && timeString.length === 4 && isNumeric(timeString)) {
         // A validação mais rigorosa já foi feita antes de chegar aqui se o fluxo for seguido
        return `${timeString.substr(0, 2)}:${timeString.substr(2, 2)}`;
    }
    return timeString;
}

/**
 * Analisa o conteúdo de um arquivo AFD, validando cada linha e campo.
 * @param {string} contents O conteúdo do arquivo AFD.
 * @returns {object} Um objeto contendo { data: Array<Object>, errors: Array<Object> }.
 */
function parseFileContentsAndValidate(contents) {
    const lines = contents.split(/\r?\n/);
    const processedRows = [];
    const validationErrors = [];
    // Comprimentos esperados para os campos de um registro tipo "3" (marcação)
    const fieldLengths = {
        nsr: 9,
        codigoEvento: 1, // Geralmente '3' para marcação, mas pode ser '4' ou '5' para outros eventos
        data: 8,
        hora: 4,
        pis: 12,
        crc: 4
    };
    const totalExpectedLength = Object.values(fieldLengths).reduce((sum, len) => sum + len, 0); // 38

    lines.forEach(function (lineContent, index) {
        const lineNumber = index + 1;
        const originalLine = lineContent.trim();

        if (originalLine === '') {
            return; // Pula linhas vazias
        }

        // Heurística simples para identificar linhas que não são registros de ponto (tipo 3, 4, 5)
        // Linhas de registro de ponto geralmente começam com NSR (9 dígitos)
        // e o segundo campo (tipo de registro) é um único dígito.
        // Linhas de cabeçalho (tipo 1) ou rodapé (tipo 9) têm formatos diferentes.
        const nsrCandidate = originalLine.substring(0, fieldLengths.nsr);
        const typeCandidate = originalLine.substring(fieldLengths.nsr, fieldLengths.nsr + fieldLengths.codigoEvento);

        if (originalLine.length < 10 || !isNumeric(nsrCandidate) || !isNumeric(typeCandidate)) {
            // Se não parece um registro de ponto, não tenta validar campos específicos de ponto.
            // Pode ser um cabeçalho, rodapé ou linha completamente malformada.
            // Poderíamos adicionar um aviso genérico se quiséssemos.
            // validationErrors.push({ lineNumber, error: 'Linha não parece ser um registro de ponto padrão AFD (NSR ou tipo inválido).' });
            return; // Pula para a próxima linha
        }


        let currentPos = 0;
        let rowData = {};
        let lineHasErrors = false;

        // NSR
        rowData.nsr = originalLine.substring(currentPos, currentPos + fieldLengths.nsr);
        if (!isNumeric(rowData.nsr) || rowData.nsr.length !== fieldLengths.nsr) {
            validationErrors.push({ lineNumber, field: 'NSR', value: `"${rowData.nsr}"`, error: `Formato inválido. Esperado ${fieldLengths.nsr} dígitos.` });
            lineHasErrors = true;
        }
        currentPos += fieldLengths.nsr;

        // Código do Evento
        rowData.codigoEvento = originalLine.substring(currentPos, currentPos + fieldLengths.codigoEvento);
        if (!isNumeric(rowData.codigoEvento) || rowData.codigoEvento.length !== fieldLengths.codigoEvento) {
            validationErrors.push({ lineNumber, field: 'Código Evento', value: `"${rowData.codigoEvento}"`, error: `Formato inválido. Esperado ${fieldLengths.codigoEvento} dígito.` });
            lineHasErrors = true;
        }
        currentPos += fieldLengths.codigoEvento;

        // Data
        const dataRaw = originalLine.substring(currentPos, currentPos + fieldLengths.data);
        if (!isValidDateString(dataRaw)) {
            validationErrors.push({ lineNumber, field: 'Data', value: `"${dataRaw}"`, error: `Formato ou valor inválido. Esperado DDMMYYYY.` });
            lineHasErrors = true;
            rowData.data = dataRaw; // Mantém o valor bruto para exibição
        } else {
            rowData.data = formatDate(dataRaw);
        }
        currentPos += fieldLengths.data;

        // Hora
        const horaRaw = originalLine.substring(currentPos, currentPos + fieldLengths.hora);
        if (!isValidTimeString(horaRaw)) {
            validationErrors.push({ lineNumber, field: 'Hora', value: `"${horaRaw}"`, error: `Formato ou valor inválido. Esperado HHMM.` });
            lineHasErrors = true;
            rowData.hora = horaRaw; // Mantém o valor bruto
        } else {
            rowData.hora = formatTime(horaRaw);
        }
        currentPos += fieldLengths.hora;

        // PIS
        rowData.pis = originalLine.substring(currentPos, currentPos + fieldLengths.pis);
        if (!isNumeric(rowData.pis) || rowData.pis.length !== fieldLengths.pis) {
            validationErrors.push({ lineNumber, field: 'PIS', value: `"${rowData.pis}"`, error: `Formato inválido. Esperado ${fieldLengths.pis} dígitos.` });
            lineHasErrors = true;
        }
        currentPos += fieldLengths.pis;
        
        // CRC
        // Verifica se a linha tem comprimento suficiente para o CRC
        if (originalLine.length >= currentPos + fieldLengths.crc) {
            rowData.crc = originalLine.substring(currentPos, currentPos + fieldLengths.crc);
            if (rowData.crc.length !== fieldLengths.crc) { // Checagem redundante se o substr funcionar, mas boa prática
                 validationErrors.push({ lineNumber, field: 'CRC', value: `"${rowData.crc}"`, error: `Comprimento inválido. Esperado ${fieldLengths.crc} caracteres.` });
                 lineHasErrors = true;
            }
            // Não vamos validar o conteúdo do CRC, apenas presença e comprimento.
        } else {
            rowData.crc = originalLine.substring(currentPos); // Pega o que sobrou
            validationErrors.push({ lineNumber, field: 'CRC', value: `"${rowData.crc}"`, error: `Campo incompleto ou ausente. Linha muito curta.` });
            lineHasErrors = true;
        }

        // Adiciona o número da linha original aos dados para referência futura
        rowData.originalLineNumber = lineNumber;
        processedRows.push(rowData);
    });

    return { data: processedRows, errors: validationErrors };
}

self.addEventListener('message', function (event) {
    var contents = event.data;
    var result = parseFileContentsAndValidate(contents);
    self.postMessage(result);
});
