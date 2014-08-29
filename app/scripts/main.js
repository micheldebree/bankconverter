/*global $*/
/*global console*/
/*global moment*/

// Reset view state
function reset() {
    'use strict';
    $("a[id=downloadLink]").hide();
    $("p[id=errorMessages]").html('');
}

$(document).ready(function () {
    'use strict';
    reset();
});

// parse a transaction from one (non header) set of values
function parseTransaction(values) {
    
    'use strict';
    
    var transaction = {
            'date' : moment(values[0], 'YYYYMMDD'),
            'description' : values[1],
            'contraAccount' : values[3],
            'code' : values[4],
            'debetcredit' : values[5],
            'amount' : values[6],
            'transferType' : values[7],
            'comment' : values[8]
        };
    
     // amount
    transaction.amount = transaction.amount.replace(',', '.');
    transaction.sign = (transaction.debetcredit.toLowerCase() === 'af') ? '-' : '';
    
    return transaction;
}

function renderQifTransaction(transaction) {
    
    'use strict';
    
    var newline = '\n';
    return 'D' + transaction.date.format('MM/DD/YYYY') + newline
        + 'T' + transaction.sign + transaction.amount + newline
        + 'P' + transaction.contraAccount + newline
        + 'L' + transaction.code + ':' + transaction.transferType + newline
        + 'M' + transaction.comment + newline
        + '^' + newline;
}


// convert parsed data to QIF format
function parseData(data) {

    'use strict';
    
    var newline = '\n',
        output = '!Type:Bank' + newline,
        sign,
        account;

    $.each(data, function (index, value) {

        // first line contains column names. Do a simple check.
        if (index === 0) {
            if (value[0] !== 'Datum') {
                throw 'Invalid file format.';
            }
        } else {
            
            // next lines contain actual transaction data.
            account = value[2];
            
            var transaction = parseTransaction(value);
            output += renderQifTransaction(transaction);
        }
    });
    
    return '!Account' + newline + 'N' + account + newline + 'TBank' + newline + '^' + newline + output;
   
}

// Set data on the downloadlink and click it automatically
function downloadFile(data, fileName) {
    
    'use strict';
    
    var url = "data:application/octet-stream," +  encodeURIComponent(data);
    $("a[id=downloadLink]").attr('href', url);
    $("a[id=downloadLink]").attr('download', fileName);
    $("a[id=downloadLink]").html(fileName);
    $("a[id=downloadLink]").show();
    $("a[id=downloadLink]")[0].click();
    
}

// Parse the file that has been uploaded.
function uploadFile() {

    'use strict';
    
    reset();
   
    $("input[type = file]").parse({
        config: {
            complete: function (results, file) {
                console.log("File done: ", file, results);
                var errors = '',
                    converted;
                try {
                    if (results.errors.length > 0) {
                        $.each(results.errors, function (index, error) {
                            errors += error.message + '\n';
                        });
                        throw 'Could not parse file.';
                    }
                    converted = parseData(results.data);
                    downloadFile(converted, file.name.replace('.csv', '.qif'));
                } catch (err) {
                    errors += err;
                    $("p[id=errorMessages]").html(errors);
                    console.log("ERROR: " + errors);
                }
            }
        },
        complete: function () {
            console.log("All files done!");
        }
    });
}
