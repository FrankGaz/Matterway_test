// Puppeteer library
const puppeteer = require("puppeteer");

(async () => {
  // Get the Browser that we gonna use to work this script
  const browser = await puppeteer.launch({ headless: false });

  // Open a new page in the browser
  const pageGoodReads = await browser.newPage();

  // Go to goodreads web page
  await pageGoodReads.goto(
    "https://www.goodreads.com/choiceawards/best-books-2020"
  );

  // Get id of search input in GoodReads and add "Fiction" (or the genre that the users choosed) in the field to find Fiction genre books
  await pageGoodReads.type(".searchBox__input", "Fiction");

  // Click in search button
  await pageGoodReads.click(".searchBox__icon--magnifyingGlass");

  // Makes the script waits to get all the results
  await pageGoodReads.waitForSelector(".bookTitle span");
  await pageGoodReads.waitForTimeout(1000);

  // Create a list of results of the search
  const booksList = await pageGoodReads.evaluate(() => {
    const books = document.querySelectorAll(".bookTitle span");
    const titles = [];
    for (let book of books) {
      titles.push(book);
    }
    return titles;
  });

  // Get the list of books titles
  const bookTitles = [];
  for (let item of booksList) {
    const bookTitle = await pageGoodReads.evaluate(() => {
      const pickedItem = {};
      pickedItem.title = document.querySelector(".bookTitle span").innerText;
      return pickedItem;
    });
    bookTitles.push(bookTitle);
  }

  // Get a random title from the previous list
  let oneRandomTitle =
    bookTitles[Math.floor(Math.random() * bookTitles.length)];

  // We will use this value to search in Amazon for the book
  let bookName = oneRandomTitle.title;

  // Close Browser
  await browser.close();

  // Get the Browser that we gonna use to work this script
  const browser2 = await puppeteer.launch({ headless: false });

  // Open a new page in the browser
  const pageAmazon = await browser2.newPage();

  // Go to Amazon Books web page
  await pageAmazon.goto(
    "https://www.amazon.com/amazon-books/b?ie=UTF8&node=13270229011"
  );

  // Get id of search input in amazon and add "books" in the field
  await pageAmazon.type("#twotabsearchtextbox", bookName);

  // Click in search button
  await pageAmazon.click(".nav-search-submit input");

  // Makes the script waits until it have the component info
  await pageGoodReads.waitForTimeout(2000);
  await pageAmazon.waitForSelector(".s-result-item");

  // Find all the links of books in the search results
  const booksLinks = await pageAmazon.evaluate(() => {
    const elements = document.querySelectorAll(".s-result-item h2 a");
    const links = [];
    for (let element of elements) {
      links.push(element.href);
    }
    return links;
  });

  // Get the best result and go to the link
  const bestResult = booksLinks[0];
  await pageAmazon.goto(bestResult);

  // Click To buy the book
  await pageAmazon.click("#accordion_row_header-COMPETITIVE_PRICE");
  await pageAmazon.waitForTimeout(1000);
  await pageAmazon.click(".a-button-oneclick .a-button-inner .a-button-input");
})();
