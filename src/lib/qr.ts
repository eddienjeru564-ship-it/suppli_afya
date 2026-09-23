import QRCode from "qrcode";

export async function qrSvg(url: string) {
  return QRCode.toString(url, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: "#11231a", light: "#00000000" },
  });
}
