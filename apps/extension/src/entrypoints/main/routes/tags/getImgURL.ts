export default function getImgURL(codedURL: string, ip: string, port: string) {
  if (!codedURL) return undefined;
  let tmp = codedURL;
  tmp = tmp.replace("$IP", ip);
  tmp = tmp.replace("$HOST", `${ip}:${port}`);
  return tmp;
}
