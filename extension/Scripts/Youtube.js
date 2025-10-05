let firstRun = [true];
function checkVideoOrShort() {
  if (!(location.href.includes("/shorts") || location.href.includes("/watch")))
    return false;
  const PageTitle = document.title;
  if (PageTitle === "YouTube" || !PageTitle) return false;
  return true;
}

function GetID() {
  if (location.href.includes("/shorts")) return location.pathname.slice(8);
  return new URL(location.href).searchParams.get("v");
}

function YouTube() {
  if (!checkVideoOrShort()) {
    scriptData.ClickRemove();
    return;
  }
  ContentData.Title = document.title;
  ContentData.Url = location.href;
  const ID = GetID();
  ContentData.Identifier = `yt_${ID}`;
  ContentData.CoverUrl = `https://img.youtube.com/vi/${ID}/hqdefault.jpg`;
  scriptData.SPAContentRefresh(firstRun);
}

const titleElement = document.querySelector("title");
const observer = new MutationObserver(YouTube);
observer.observe(titleElement, { childList: true });
