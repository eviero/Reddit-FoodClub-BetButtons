// ==UserScript==
// @author         friendly-trenchcoat
// @name           Reddit - Food Club Bet Buttons
// @description    Maintains your bet amount and places handy-dandy direct bet links next to each bet (piggybacks off of diceroll123's stuff)
// @include        https://www.reddit.com/r/neopets/comments/*/food_club_bets_*
// @include        http://www.neopets.com/pirates/foodclub.phtml?type=current_bets
// @grant          GM_getValue
// @grant          GM_setValue
// @require	       http://code.jquery.com/jquery-latest.min.js
// ==/UserScript==

/*
For Chrome

HOT TIPS!
I can't figure out a way to make it not switch you to the tab the button opens!
For a less annoying experience:
 - Best used in single window
 - CTRL+SHIFT+TAB   go to tab to the left
 - CTRL+TAB         go to tab to the right

ALSO: Don't like how the bet amount button scrolls with you? Scroll down and read how to change it.

ALSO ALSO: There's nothing to stop you from submitting bets from past days. Try not to do this.

Enjoy!
*/

if(document.URL.indexOf("comments") != -1) {
    // BET AMOUNT BUTTON        who knows if this works :D
    var today = new Date();
    var offset = Math.floor(today.getTimezoneOffset() / 60) - 7;  // difference between UTC and local time in hours, - 8
    today.setHours(today.getHours() + offset);

    var betAmt = 0;
    var title = "click to set";
    if(typeof GM_getValue("iBetAmt") !== 'undefined'){
        var startDate = new Date(GM_getValue("startDate"));  // make back into a Date object
        var justToday = today;
        var days = Math.floor( (justToday.setHours(0,0,0,0) - startDate.setHours(0,0,0,0)) /(1000*60*60*24)  ); // number of days between start day and today
        betAmt = GM_getValue("iBetAmt") + (days*2); // final bet amount
        title = betAmt;

        // just testing stuff
        console.log("START: "+startDate);
        console.log("TODAY: "+today);
        console.log("DAYS PASSED: "+days);
        console.log("OLD BET: "+GM_getValue("iBetAmt"));
        console.log("NEW BET: "+betAmt);

    }
    var betAmtButton = $('<button/>', {
        text: "bet amount: "+title,
        id: "betAmtButton",
        click: function () {
            var iBetAmt = prompt("Bet amount: ", betAmt);
            GM_setValue("iBetAmt", Number(iBetAmt));
            GM_setValue("startDate", today);
            betAmt = Number(iBetAmt);
            $(this).text("bet amount: "+betAmt);
            location.reload();
        }
    });
    $("[class='sitetable nestedlisting']").prepend(betAmtButton);
    $("textarea[name='text']").css("z-index", "99");

    // COMMENT OUT THIS LINE TO MAKE BET AMOUNT BUTTON NOT SCROLL WITH YOU********************************
    // OR change number values of "top" and "left" to reposition
    $('#betAmtButton').css({"position":"fixed", "top":"20px", "left":"0px", "z-index":"100"});



    // BET BUTTONS
    var pirates = ['', 'Dan', 'Sproggie', 'Orvinn', 'Lucky', 'Edmund', 'Peg Leg', 'Bonnie', 'Puffo', 'Stuff', 'Squire', 'Crossblades', 'Stripey', 'Ned', 'Fairfax', 'Gooblah', 'Franchisco', 'Federismo', 'Blackbeard', 'Buck', 'Tailhook'];
    var pirateIDs = [0,0,0,0,0]; // five arenas
    $("tbody").children().each(function(k,v) {
        if ($(v).children().length == 7){ //if it's actually a bet table
            for (var i=1; i<6; i++){ //for each column
                var arena = $(v).children().eq(i);//.css("background-color", "#ffc");  // HEY YOU THERE, delete ";//" after "eq(i)" if colorful tables gets you off*********************
                if (pirates.indexOf(arena.text()) < 0){ // don't draw a button if the pirate is not in the list
                    $(v).append('Invalid');
                    arena.css("background-color", "#ffc"); // highlightes the offending pirate
                    return;
                }
                pirateIDs[i-1] = pirates.indexOf(arena.text());
                if (pirateIDs[i-1] === 0) {
                    pirateIDs[i-1] = '<input type="hidden" name="winner'+i+'" value="">';
                }
                else {
                    pirateIDs[i-1] = '<input type="hidden" name="matches[]" value="'+i+'">' + '<input type="hidden" name="winner'+i+'" value="'+pirateIDs[i-1]+'">';
                }
            }
            var odds = $(v).children().eq(6).text().slice(0, -2);
            var winnings = odds*betAmt;

            $(v).append('<form action="http://www.neopets.com/pirates/process_foodclub.phtml" target="_blank" method="post" name="bet_form">'+pirateIDs.join("")+'<input type="hidden" name="bet_amount" value="'+betAmt+'"><input type="hidden" name="total_odds" value="'+odds+'"><input type="hidden" name="winnings" value="'+winnings+'"><input type="hidden" name="type" value="bet"><input type="submit" value="BET"></form>');

        }
    });
}

// Highlight the table when you have placed all ten bets
else if(document.URL.indexOf("current") != -1) {
    if ( $("tr[bgcolor='white'").first().parent().children().length == 13) {
        $("tr[bgcolor='white'").each(function(k,v) {
            $(v).css("background-color", "#ffd");
        });
    }
}
