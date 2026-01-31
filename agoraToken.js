
// agoraToken.js
const AgoraToken = require("agora-token");

const APP_ID = process.env.AGORA_APP_ID;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

/**
 * Generate Agora token for a user
 * @param {string} channelName - unique channel name
 * @param {number} uid - user_id
 * @param {"publisher"|"subscriber"} role 
 * @param {number} expireInSeconds - token expiry time
 * @returns {string} token
 */
function generateToken(channelName, uid, role = "publisher", expireInSeconds = 3600) {
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpireTimestamp = currentTimestamp + expireInSeconds;

  const token = AgoraToken.RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    uid,
    role === "publisher" ? AgoraToken.RtcRole.PUBLISHER : AgoraToken.RtcRole.SUBSCRIBER,
    privilegeExpireTimestamp
  );

  return token;
}

module.exports = { generateToken };

