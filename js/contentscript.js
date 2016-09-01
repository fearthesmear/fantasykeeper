/*!
*
*
*/

// TODO: Add cut column to roster db.
// TODO: How do I handle spaces in last names like Jr or Names like Byung
//       Ho Park?

$(document).ready(function(){

  importSheet(); // Async event due to .getJSON so need to run
                 // rest of script from with .getJSON.
});


var elements = document.getElementsByTagName('*');
function replacetext(){
    /* Traverse the DOM and search for text. Replace text with new text.
    */
    for (var i = 0; i < elements.length; i++) {
        var element = elements[i];
        console.log(element)
        for (var j = 0; j < element.childNodes.length; j++) {
            var node = element.childNodes[j];

            if (node.nodeType === 3) {
                var text = node.nodeValue;
                var replacedText = text.replace(/Murphy/gi, 'God');

                if (replacedText !== text) {
                    //element.replaceChild(document.createTextNode(replacedText), node);
                }
            }
        }
    }
}


function importSheet(){
    /* Get the Player Auction Values Google Sheet as JSON. Parse player auction
     * information into an array. Since get JSON is an async function, the
     * rest of the script that displays the player auction information will to
     * be called from within.
     */

    // ID of the Google Spreadsheet
    //var spreadsheetID = "1aWTgjbsf998zOCMY06hndLEBWm5LuWWCLJBZgflNk88";
    var spreadsheetID = "1NjCm1SodkaagsRXvHM4BrThg1pM4d_DYxSC_Cibe1Ds";
    var worksheetID = 1;

    // Make sure it is public or set to Anyone with link can view
    var url = "https://spreadsheets.google.com/feeds/list/" + spreadsheetID + "/1/public/full?alt=json";

    var rosterdb = [];
    var rosterdbpop = [];

    $.getJSON(url, function(data) {
        //console.log(data);
        for (i = 0; i < data.feed.entry.length; i++) {
            var entry = {
                first: data.feed.entry[i].gsx$first.$t,
                last: data.feed.entry[i].gsx$last.$t,
                team: data.feed.entry[i].gsx$team.$t,
                position: data.feed.entry[i].gsx$position.$t,
                mlb: data.feed.entry[i].gsx$mlb.$t,
                year: data.feed.entry[i].gsx$year.$t,
                cost: data.feed.entry[i].gsx$cost.$t,
                minors: data.feed.entry[i].gsx$minors.$t,
            }
            //rosterdb.push(String(data.feed.entry[i].gsx$last.$t));
            rosterdb.push(entry);
        }
        console.log(rosterdb)
        // Get the site players and match to rosterdb
        roster = get_fantasy_site_player_names();
        for (i = 0; i < roster.length; i++) {
            var site_player_db_info = match_player_site_to_rosterdb(rosterdb, roster[i]);
            console.log(roster[i] + " costs " + site_player_db_info.cost +
                        " and was signed in " + site_player_db_info.year);
        }

    });
}


function get_fantasy_site_player_names() {

    roster = []
    id = []
    $('.playertablePlayerName').children([':first-child']).each(function () {
        //console.log($(this).text());
        if ($(this).text() !== "" && $(this).text() !== "PP" &&
            $(this).text() !== "DL15" && $(this).text() !== "DL60" &&
            $(this).text() !== "DL7" && $(this).text() !== "SSPD" &&
            $(this).text() !== "DTD")
        {
          roster.push($(this).text());
          // Example of changing text
          $(this).append(", $1")
        }
    });
    // Example of getting attribute
    $('.playertablePlayerName').children([':first-child']).each(function () {
        //console.log($(this).text());
        id.push($(this).attr("playerid"));
    });
    //console.log(roster);
    //console.log(id);
    return roster;
}

function match_player_site_to_rosterdb(rosterdb, site_player){
    /* Return the rosterdb entry for the player on the fantasy site roster
    */
    // Break the site player name into first and last name
    // TODO: How do I handle spaces in last names like JR or Names like Byung
    //       Ho Park?
    var site_player_db_info = {
        cost: 0,
        year: 0
    }

    index = site_player.indexOf(" ");
    first_name = site_player.substr(0, index);
    last_name = site_player.substr(index+1);

    for (j = 0; j < rosterdb.length; j++){

        // Match site_player's last name to rosterdb player.
        var site_player_last_name = new RegExp(last_name);
        var result_last = site_player_last_name.test(rosterdb[j].last)
        if(result_last){
            //console.log("Matched " + last_name + " to " + rosterdb[j].last);
            // If the last name matched, see if the first name matches
            var site_player_first_name = new RegExp(first_name);
            var result_first = site_player_first_name.test(rosterdb[j].first)
            if(result_first){
                //console.log("Matched " + first_name + " " + last_name + " to " +
                //            rosterdb[j].first + " " + rosterdb[j].last);
                site_player_db_info.cost = rosterdb[j].cost;
                site_player_db_info.year = rosterdb[j].year;
                return site_player_db_info;
            }
        }
    }
    return site_player_db_info;

}
