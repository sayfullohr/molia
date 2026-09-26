"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDeviceInfo = parseDeviceInfo;
exports.getClientIp = getClientIp;
const ua_parser_js_1 = require("ua-parser-js");
function parseDeviceInfo(userAgentString) {
    if (!userAgentString) {
        return {
            browser: 'Noma’lum',
            os: 'Noma’lum',
            deviceType: 'Desktop',
            summary: 'Noma’lum qurilma',
        };
    }
    const parser = new ua_parser_js_1.UAParser(userAgentString);
    const browser = parser.getBrowser();
    const os = parser.getOS();
    const device = parser.getDevice();
    const browserName = browser.name ? `${browser.name} ${browser.version?.split('.')[0] || ''}`.trim() : 'Noma’lum brauzer';
    const osName = os.name ? `${os.name} ${os.version || ''}`.trim() : 'Noma’lum OT';
    const deviceType = device.type ? device.type.charAt(0).toUpperCase() + device.type.slice(1) : 'Kompyuter';
    return {
        browser: browserName,
        os: osName,
        deviceType,
        summary: `${browserName} (${osName})`,
    };
}
function getClientIp(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
        return forwarded.split(',')[0].trim();
    }
    return req.socket.remoteAddress || req.ip || '127.0.0.1';
}
