self.addEventListener('message', function (event) {
    var contents = event.data;
    var rows = parseFileContents(contents);
    self.postMessage(rows);
});

function parseFileContents(contents) {
    var lines = contents.split('\n');
    var rows = [];
    lines.forEach(function (line) {
        var nsr = line.substr(0, 9);
        var codigoEvento = line.substr(9, 1);
        var data = formatDate(line.substr(10, 8));
        var hora = formatTime(line.substr(18, 4));
        var pis = line.substr(22, 12);
        var crc = line.substr(34, 4);

        rows.push({
            nsr: nsr,
            codigoEvento: codigoEvento,
            data: data,
            hora: hora,
            pis: pis,
            crc: crc
        });
    });
    return rows;
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