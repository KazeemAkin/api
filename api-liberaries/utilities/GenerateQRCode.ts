const QRCode = require("qrcode");

/**
 * Get qrcode
 * @param url
 * @returns
 */
const GenerateQRCode = async (url: string) => {
  try {
    // Generate the QR code as a base64-encoded data URL
    const qrCodeBase64 = await QRCode.toDataURL(url);

    return qrCodeBase64;
  } catch (err) {
    console.error(err);
  }
};

module.exports = GenerateQRCode;
