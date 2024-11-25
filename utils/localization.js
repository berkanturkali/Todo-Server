const path = require("path");
const { I18n } = require("i18n");

const i18n = new I18n({
    locales: ["en", "tr"],
    directory: path.join(__dirname, "../locales"),
    defaultLocale: 'en',
});

module.exports = i18n;