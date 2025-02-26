"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTweetImage = generateTweetImage;
const node_html_to_image_1 = __importDefault(require("node-html-to-image"));
async function generateTweetImage(tweetData, outputPath = "images/tweet.png") {
    const { username, handle, text, avatar, verified = false, timestamp, } = tweetData;
    console.log("🚀 ~ tweetData:", tweetData);
    const defaultAvatarUrl = "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png";
    try {
        await (0, node_html_to_image_1.default)({
            output: outputPath,
            html: `
        <html>
          <head>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              
              html, body {
                width: 100%;
                height: 100%;
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                background: #15202B;
              }
              
              .tweet-container {
                width: 100%;
                height: 100%;
                padding: 20px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                background: #15202B;
              }
              
              .tweet-content {
                max-width: 600px;
                margin: 0 auto;
                width: 100%;
              }
              
              .tweet-header {
                display: flex;
                align-items: center;
                margin-bottom: 12px;
              }
              
              .avatar {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                margin-right: 12px;
                flex-shrink: 0;
              }
              
              .user-info {
                flex-grow: 1;
                min-width: 0;
              }
              
              .name-container {
                display: flex;
                align-items: center;
                flex-wrap: wrap;
              }
              
              .username {
                font-weight: 700;
                font-size: 15px;
                color: #FFFFFF;
                margin-right: 4px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
              
              .verified {
                width: 16px;
                height: 16px;
                margin-right: 4px;
                fill: #1d9bf0;
                flex-shrink: 0;
              }
              
              .handle {
                color: #8899A6;
                font-size: 15px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
              
              .tweet-text {
                font-size: 23px;
                color: #FFFFFF;
                line-height: 1.3;
                margin: 12px 0;
                white-space: pre-wrap;
                word-wrap: break-word;
              }
              
              .timestamp {
                color: #8899A6;
                font-size: 15px;
                margin-top: auto;
              }
            </style>
          </head>
          <body>
            <div class="tweet-container">
              <div class="tweet-content">
                <div class="tweet-header">
                  <img class="avatar" src="${avatar || defaultAvatarUrl}" alt="Profile picture" />
                  <div class="user-info">
                    <div class="name-container">
                      <span class="username">${username}</span>
                      ${verified
                ? `
                        <svg viewBox="0 0 24 24" class="verified">
                          <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"/>
                        </svg>
                      `
                : ""}
                      <span class="handle">@${handle}</span>
                    </div>
                  </div>
                </div>
                <div class="tweet-text">${text}</div>
                <div class="timestamp">${timestamp}</div>
              </div>
            </div>
          </body>
        </html>
      `,
            puppeteerArgs: {
                defaultViewport: {
                    width: 400,
                    height: 300,
                    deviceScaleFactor: 2,
                },
            },
        });
        return outputPath;
    }
    catch (error) {
        console.error("Error generating tweet image:", error);
        throw error;
    }
}
//# sourceMappingURL=tweetToImage.js.map