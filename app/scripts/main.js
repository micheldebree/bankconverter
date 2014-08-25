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
        sign = '';
    

    $.each(data, function (index, value) {

        if (index > 0) {
            var transactionDate =  moment(value[0], 'YYYYMMDD'),
                description = value[1],
                account = value[2],
                contraAccount = value[3],
                code = value[4],
                debetcredit = value[5],
                amount = value[6],
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
            output += 'L' + account + newline;
            output += 'M' + comment + newline;
            output += '^' + newline;
        }

    });
    console.log(output);
    $("textarea[id=outputFile]").val(output);
    
    var url = "data:application/octet-stream," + encodeURIComponent(output);
    
    $("a[id=downloadLink]").attr('href', url);
    $("a[id=downloadLink]").attr('download', 'test.qif');
    
    $("a[id=downloadLink]").show();
}

function uploadFile() {

    'use strict';

    $("input[type = file]").parse({
        config: {
            complete: function (results, file) {
                console.log("File done: ", file, results);
                console.log(results.data);
                parseData(results.data);
            }
        },
        complete: function () {
            console.log("All files done!");
        }
    });
}



//});