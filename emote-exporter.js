// Emotes exporter.
// Depends on having the emote picker opened.
a = document.querySelectorAll('div[class^=categorySection]')
rows = a[0].children

categoryName = a[0].querySelector('span[class^=headerLabel]').innerText;
console.log(categoryName);

for (i=0; i < rows.length; i++) {
    console.log(rows[i])
    row = rows[i];
    console.log("index " + row.ariaRowIndex);
    for (j=0; j < row.children.length; j++) {
        emoteName = row.children[j].firstChild.firstChild.alt;
        //const s = emoteName.slice(1,-1);
        console.log(typeof(emoteName));

        emoteSrc = row.children[j].firstChild.firstChild.src;
        console.log(emoteName, emoteSrc);
    }

}

// how do we scroll down and get the nodes?
// - scroll manually
// - enumerate the map from rowIndex -> emotes, for the whole category.



function getCategoryName() {
    a = document.querySelectorAll('div[class^=categorySection]')
    rows = a[0].children

    categoryName = a[0].querySelector('span[class^=headerLabel]').innerText;
    console.log(categoryName);
    return categoryName;
}

function getRows() {
    a = document.querySelectorAll('div[class^=categorySection]');
    rows = a[0].children;

    console.log(rows.length);
    // rows[0] is the header, rows[i] are of class emojiListRow
    startRowIndex = rows[1].ariaRowIndex;
    endRowIndex   = rows[rows.length-1].ariaRowIndex
    console.log("start "  + startRowIndex + ", end " + endRowIndex);
}

// ALGORITHM
// - create a ~json mapping from rowIndex to a list of emotes, or null
// - scan to see which rows are visible
// - for each visible row, if it's not in the map, add it with the list of emotes for that row
// - check for termination condition:
// - - detect the end of a category: the number of rows is lower than normal (<5)
// - - check that all the entries are filled in 




async function extractEmotes() {
    const emoteRowMap = new Map();  // mapping from row index to list of emotes

    // sleep function - https://blog.devgenius.io/how-to-make-javascript-sleep-or-wait-d95d33c99909
    const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));


    function getEmojiList(row) {
        const emoteList = new Array();

        for (j=0; j < row.children.length; j++) {
            emoteName = row.children[j].firstChild.firstChild.alt;
            //const s = emoteName.slice(1,-1);
            //console.log(typeof(emoteName));

            emoteSrc = row.children[j].firstChild.firstChild.src;

            //emoteList.push({emoteName: emoteSrc});    // this creates a property "emoteName"
            emoteList.push({"emoteName" : emoteName,
                            "emoteSrc"  : emoteSrc});
        }
        console.log(emoteList);
        return emoteList;
    }

    function isRowMapComplete(categoryStartIndex, categoryEndIndex) {
        let complete = true;
        for (let i=categoryStartIndex; i < categoryEndIndex; i++) {
            if (!emoteRowMap.get(i)) {
                complete = false;
            }
        }
        return complete;
    }


    categoryEndIndex = null;
    categoryStartIndex = null;
    categoryTargetName = getCategoryName();

    console.log("Attempting to extract emotes for " + categoryTargetName);

    console.log("First, scroll up to just above the start of the category");
    for (let i = 0; i < 40; i++) {
        await sleep(250);

        // visualise progress
        a = document.querySelectorAll('div[class^=categorySection]');
        rows = a[0].children;
    
        if (rows.length <= 1) continue;
        // rows[0] is the header, rows[i] are of class emojiListRow
        startRowIndex = parseInt(rows[1].ariaRowIndex);
        endRowIndex   = parseInt(rows[rows.length-1].ariaRowIndex);

        //console.log(getCategoryName, typeof(startRowIndex), startRowIndex,
        //                           typeof(endRowIndex), endRowIndex);

        // update the start index
        if (getCategoryName() == categoryTargetName) { 
            if (categoryStartIndex == null) { 
                categoryStartIndex = startRowIndex;
            } else {
                categoryStartIndex = Math.min(categoryStartIndex, startRowIndex);
            }
        } 

        else {
            // Reached the top.
            // The startRowIndex and endRowIndex for this upper category should be close.
            categoryStartIndex = endRowIndex + 1;

            console.log("found the top:", categoryStartIndex);
            break;
        }
    }

    console.log("Now, scroll down to capture the emotes");

    for (let i = 0; i < 100; i++) {
        // wait
        // setTimeout(() => console.log("polling"), 1000);  // doesn't work.
        await sleep(250);

        // see which rows are visible
        a = document.querySelectorAll('div[class^=categorySection]');
        rows = a[0].children;

        if (rows.length <= 1) continue;
        // rows[0] is the header, rows[i] are of class emojiListRow
        startRowIndex = parseInt(rows[1].ariaRowIndex);
        endRowIndex   = parseInt(rows[rows.length-1].ariaRowIndex);

        // only add rows in the category
        if (getCategoryName() !== categoryTargetName) {
            console.log("out of bounds: ", startRowIndex + "," + endRowIndex);
            continue;
        }

        // for each visible row, check if it's in the map. If not, add it.
        for (let i=1; i < rows.length; i++) {
            row = rows[i];
            rowIndex = parseInt(row.ariaRowIndex);
            if (emoteRowMap.get(rowIndex)) {
                // already in the map
            } else {
                emoteRowMap.set(rowIndex, getEmojiList(row))
            }
        }

        // detect the end of the category 
        if (rows.length <= 7) {
            console.log("detecting end of category");
            categoryEndIndex = endRowIndex;
        }

        // check that all indices are filled in?
        if (categoryStartIndex !== null && categoryEndIndex !== null) {
            if (isRowMapComplete(categoryStartIndex, categoryEndIndex)) {
                break;
            }
        }
    }

    // check completeness again
    if (isRowMapComplete(categoryStartIndex,categoryEndIndex)) {
        console.log("All rows have been extracted! Yay");

    } else {
        console.log("Warning: not all rows have been extracted :c");
    }

    return emoteRowMap;


}

// refresh every 1000ms
x = setInterval(getCategoryName, 1000);

// stop with clearInterval(x)

if (getCategoryName() == 'LAINLAND') {

}

clearInterval(x);
