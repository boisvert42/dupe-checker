const WordsNinjaPack = require('wordsninja');
const WordsNinja = new WordsNinjaPack();

(async () => {
    await WordsNinja.loadDictionary();

    let string = 'imgoingtodrinkafattire';
    let words = WordsNinja.splitSentence(string,
        {
            camelCaseSplitter: false,  // Camel case splitting
            capitalizeFirstLetter: false,  // Capitalize first letter of result
            joinWords: false  // Join words with space
        });
    console.log(words);
})();
