export const getFileExt = (fileName: string) => {
  const ext = fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2);
  const FileName = fileName.slice(0, -1 * (ext.length + 1));
  return [ext, FileName];
};

export default function getCtype(fileName: string) {
  const [FileExt, Name] = getFileExt(fileName);
  let Ctype = "invalid";
  switch (FileExt) {
    case "jpg":
    case "jpeg":
    case "png":
    case "webp":
    case "svg":
    case "avif":
    case "jfif":
    case "pjpeg":
    case "pjp":
    case "ico":
    case "cur":
    case "bmp":
    case "apng":
    case "gif":
      Ctype = "img";
      break;
    case "mp4":
    case "m4v":
    case "m4p":
    case "webm":
    case "3gp":
    case "mpeg":
    case "mpg":
    case "mov":
    case "gt":
    case "qtff":
    case "ogg":
    case "ogv":
      Ctype = "video";
      break;
  }
  return [Ctype, FileExt, Name];
}
