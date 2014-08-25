//$(document).ready(function(){
/*global $*/
/*global console*/
/*global moment*/

$(document).ready(function () {
    
    'use strict';
    
    $("a[id=downloadLink]").hide();
});

function parseData(data) {

    'use strict';
    
    var newline = '\n',
        output = '!Type:Bank' + newline,
        sign = '',
      
        account = '';

    $.each(data, function (index, value) {

        if (index === 0) {
            if (value[0] !== 'Datum') {
                throw 'Invalid file format.';
            }
        } else {
            
            account = value[2];
            
            var transactionDate =  moment(value[0], 'YYYYMMDD'),
                description = value[1],
                contraAccount = value[3],
                code = value[4],
                debetcredit = value[5],
                amount = value[6],
                transferType = value[7],
                comment = value[8];

            output += 'D' + transactionDate.format('MM/DD/YYYY') + newline;
            
            // amount
            amount = amount.replace(',', '.');
            sign = '';
            if (debetcredit.toLowerCase() === 'af') {
                sign = '-';
            }
            
            output += 'T' + sign + amount + newline;
            output += 'P' + contraAccount + newline;
            output += 'L' + code + ':' + transferType + newline;
            output += 'M' + comment + newline;
            output += '^' + newline;
        }

    });
    
    return '!Account' + newline + 'N' + account + newline + 'TBank' + newline + '^' + newline + output;
   
}

function downloadFile(data, fileName) {
    
    'use strict';
    
    var url = "data:application/octet-stream," +  encodeURIComponent(data);
    $("a[id=downloadLink]").attr('href', url);
    $("a[id=downloadLink]").attr('download', fileName);
    $("a[id=downloadLink]").show();
}

function uploadFile() {

    'use strict';

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
                    downloadFile(converted, file.name + ".qif");
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
