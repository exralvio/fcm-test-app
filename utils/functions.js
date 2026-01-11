const crypto = require('crypto');

function generateIdentifier() {
  const baseString =
    Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
  const uniquePart = crypto
    .createHash('sha256')
    .update(baseString)
    .digest('hex')
    .substring(0, 16);
  return `fcm-msg-${uniquePart}`;
}

module.exports = {
  generateIdentifier,
};
