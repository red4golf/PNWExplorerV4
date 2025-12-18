const BOT_USER_AGENTS = [
  'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
  'yandexbot', 'sogou', 'exabot', 'facebot', 'facebookexternalhit',
  'meta-externalagent', 'ia_archiver', 'mj12bot', 'ahrefsbot',
  'semrushbot', 'dotbot', 'rogerbot', 'seznambot', 'crawler',
  'spider', 'bot/', 'bot-', 'headless', 'phantomjs', 'selenium',
  'puppeteer', 'playwright', 'wget', 'curl', 'httpie', 'python-requests',
  'go-http-client', 'java/', 'apache-httpclient', 'okhttp',
  'scrapy', 'libwww', 'lwp-', 'petalbot', 'bytespider', 'gptbot',
  'chatgpt', 'claudebot', 'anthropic', 'perplexitybot', 'ccbot',
  'dataforseo', 'applebot', 'twitterbot', 'linkedinbot', 'slackbot',
  'whatsapp', 'telegrambot', 'discordbot', 'pingdom', 'uptimerobot',
  'statuscake', 'newrelicpinger', 'site24x7', 'monitis'
];

const DATACENTER_IP_RANGES = [
  { start: '34.0.0.0', end: '34.255.255.255' },     // Google Cloud
  { start: '35.0.0.0', end: '35.255.255.255' },     // Google Cloud
  { start: '40.0.0.0', end: '40.255.255.255' },     // Microsoft Azure
  { start: '52.0.0.0', end: '52.255.255.255' },     // AWS
  { start: '54.0.0.0', end: '54.255.255.255' },     // AWS
  { start: '13.0.0.0', end: '13.255.255.255' },     // AWS/Azure
  { start: '20.0.0.0', end: '20.255.255.255' },     // Microsoft Azure
  { start: '23.0.0.0', end: '23.255.255.255' },     // Akamai/Azure
  { start: '104.0.0.0', end: '104.255.255.255' },   // Various cloud
  { start: '157.0.0.0', end: '157.255.255.255' },   // Azure
  { start: '168.0.0.0', end: '168.255.255.255' },   // Azure
  { start: '192.30.0.0', end: '192.30.255.255' },   // GitHub
  { start: '199.0.0.0', end: '199.255.255.255' },   // Various hosting
];

function ipToNumber(ip: string): number {
  const parts = ip.split('.').map(Number);
  return (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3];
}

function isIpInRange(ip: string, start: string, end: string): boolean {
  const ipNum = ipToNumber(ip);
  const startNum = ipToNumber(start);
  const endNum = ipToNumber(end);
  return ipNum >= startNum && ipNum <= endNum;
}

export function isDatacenterIp(ip: string): boolean {
  if (!ip || ip === 'unknown' || ip.includes(':')) {
    return false;
  }
  
  const cleanIp = ip.split(',')[0].trim();
  
  if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(cleanIp)) {
    return false;
  }
  
  return DATACENTER_IP_RANGES.some(range => 
    isIpInRange(cleanIp, range.start, range.end)
  );
}

export function isBotUserAgent(userAgent: string | undefined): boolean {
  if (!userAgent) return false;
  
  const lowerUA = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some(bot => lowerUA.includes(bot));
}

export function hasSuspiciousSignals(metadata: any): boolean {
  if (!metadata) return false;
  
  const viewport = metadata.viewport || '';
  const screenWidth = metadata.screenWidth || 0;
  const screenHeight = metadata.screenHeight || 0;
  const timezone = metadata.timezone || '';
  
  if (viewport === '1024x1024' || viewport === '800x600') {
    if (screenWidth === 800 && screenHeight === 600) {
      return true;
    }
  }
  
  if (timezone === 'UTC' && screenWidth === 800 && screenHeight === 600) {
    return true;
  }
  
  return false;
}

export interface BotDetectionResult {
  isBot: boolean;
  confidence: 'high' | 'medium' | 'low';
  reasons: string[];
}

export function detectBot(
  userAgent: string | undefined,
  ip: string | undefined,
  metadata?: any
): BotDetectionResult {
  const reasons: string[] = [];
  let score = 0;
  
  if (isBotUserAgent(userAgent)) {
    reasons.push('Bot user agent detected');
    score += 100;
  }
  
  if (ip && isDatacenterIp(ip)) {
    reasons.push('Datacenter IP detected');
    score += 70;
  }
  
  if (hasSuspiciousSignals(metadata)) {
    reasons.push('Suspicious browser signals');
    score += 50;
  }
  
  let confidence: 'high' | 'medium' | 'low' = 'low';
  if (score >= 100) confidence = 'high';
  else if (score >= 50) confidence = 'medium';
  
  return {
    isBot: score >= 50,
    confidence,
    reasons
  };
}
