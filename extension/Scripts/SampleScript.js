// ==UserScript==
// @name         Sample Script
// @namespace    http://tampermonkey.net/
// @version      2025-04-03
// @description  Sample Script
// @author       You
// @match        https://www.example.com/
// @match        https://example.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=example.com
// @noframes
//               YouTube (SPA)
// @match        https://www.youtube.com/*
// @match        https://m.youtube.com/*
// ==/UserScript==

let isDataReady = false;

/*
    Supported Site key = <SiteFunctionName>::<SiteName>
    if SiteFunctionName same as SiteName then key = <SiteName>
*/
const SupportedSites = {
  "YouTube::YouTube": ["www.youtube.com"],
};

const PageTitle = document.title;
const SiteHostName = location.hostname;
const InitalUrl = location.href;

// Data divs
const parentDiv = document.createElement("div");
parentDiv.id = "parent";

const ContentData = {
  Site: "",
  Title: "",
  CoverUrl: "",
  Identifier: null,
  Url: "",
  defaultTags: [],
};

// Helper Functions
const GetMicroData = () =>
  JSON.parse(
    document.querySelector("script[type='application/ld+json']").innerText
  );

const GetOgImage = () =>
  document.querySelector("meta[property='og:image']").content;

const AddImgUrl = (url, imgurl) => {
  const NewUrl = new URL(url);
  NewUrl.searchParams.set("ImgUrl", imgurl);
  return NewUrl.href;
};

const deFormatHtml = (formatedText) => {
  const spanElement = document.createElement("span");
  spanElement.innerHTML = formatedText;
  return spanElement.textContent;
};

const switchStatmentCreator = () => {
  const CaseStatementBlocks = Object.keys(SupportedSites).map((key) => {
    const caseStatements = SupportedSites[key].map(
      (hostname) => `case "${hostname}":`
    );
    return (
      caseStatements.join("") +
      (key.split("::")[2] ? "await " : "") +
      key.split("::")[0] +
      "();break;"
    );
  });
  return `switch (SiteHostName) {${CaseStatementBlocks.join("")}}`;
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Extention Related Function
const ClickLoadAndRefresh = () =>
  document
    .querySelector("tag-app-ext-overlay")
    .shadowRoot.querySelector("#loadAndRefresh")
    .click();

const ClickPause = () =>
  document
    .querySelector("tag-app-ext-overlay")
    .shadowRoot.querySelector("#pause")
    .click();

const ClickRemove = () =>
  document
    .querySelector("tag-app-ext-overlay")
    .shadowRoot.querySelector("#remove")
    .click();

let PollInterval;
const PoleTheUI = () => {
  clearInterval(PollInterval);
  const EXTENSION_POLL_INTERVAL_MS = 500; // How often to check for the extension UI
  const EXTENSION_POLL_TIMEOUT_S = 20; // How long to wait for the extension UI
  let POLL_COUNTER = 0;

  const Debug = false;
  if (!Debug) {
    parentDiv.style.display = "none";
    PollInterval = setInterval(() => {
      POLL_COUNTER++;
      if (POLL_COUNTER >= EXTENSION_POLL_TIMEOUT_S) {
        clearInterval(PollInterval);
        console.log(
          "TagAppExtention UserScript: tagAppExt UI could not be loaded"
        );
        return;
      }
      if (document.querySelector("tag-app-ext-overlay") && isDataReady) {
        parentDiv.textContent = JSON.stringify(ContentData);
        document.body.insertBefore(parentDiv, document.body.firstChild);
        ClickLoadAndRefresh();
        clearInterval(PollInterval);
      }
    }, EXTENSION_POLL_INTERVAL_MS);
  }
};

// Get List of Supported Sites from example.com
function ExampleDotCom() {
  const JsonDataDiv = document.createElement("div");
  JsonDataDiv.id = "tagAppExt_SupportedSites";
  parentDiv.appendChild(JsonDataDiv);
  JsonDataDiv.textContent = JSON.stringify(SupportedSites);
  JsonDataDiv.style.display = "none";
  document.body.insertBefore(JsonDataDiv, document.body.firstChild);
  isDataReady = true;
}

// Scraper Functions
// Video
function YouTube(firstRun = true) {
  if (firstRun)
    navigation.addEventListener("navigate", async () => {
      ClickPause();
      await sleep(3000);
      ContentData.defaultTags = [];
      YouTube(false);
      PoleTheUI();
    });
  ContentData.Site = "YouTube";

  const IsShort = location.pathname.split("/")[1] === "shorts";
  ContentData.Title = document.title.slice(0, -10);
  const ID = IsShort
    ? location.pathname.slice(8)
    : new URL(location.href).searchParams.get("v");
  if (!ID) {
    isDataReady = false;
    return;
  }
  ContentData.Url = location.href;
  ContentData.Identifier = `ytb_${ID}`;
  ContentData.CoverUrl = `https://img.youtube.com/vi/${ID}/mqdefault.jpg`;
  if (IsShort) ContentData.defaultTags = ["Type:Short_Clip"];
  isDataReady = true;
}

(function () {
  "use strict";

  PoleTheUI();
  // Create's and runs switch stament with the data given in SupportedSites
  eval(`(async () => {${switchStatmentCreator()}})()`);
})();
