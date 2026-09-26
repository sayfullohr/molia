import { Request } from 'express';
import { UAParser } from 'ua-parser-js';

export interface DeviceInfo {
  browser: string;
  os: string;
  deviceType: string;
  summary: string;
}

export function parseDeviceInfo(userAgentString?: string): DeviceInfo {
  if (!userAgentString) {
    return {
      browser: 'Noma’lum',
      os: 'Noma’lum',
      deviceType: 'Desktop',
      summary: 'Noma’lum qurilma',
    };
  }

  const parser = new UAParser(userAgentString);
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

export function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || req.ip || '127.0.0.1';
}
