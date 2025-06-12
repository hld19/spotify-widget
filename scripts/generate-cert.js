import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import forge from 'node-forge';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create .cert directory if it doesn't exist
const certDir = path.join(__dirname, '..', '.cert');
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir);
}

function generateSelfSignedCert() {
  // Generate a new key pair
  const keys = forge.pki.rsa.generateKeyPair(2048);
  
  // Create a new certificate
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

  // Set certificate attributes
  const attrs = [{
    name: 'commonName',
    value: 'localhost'
  }, {
    name: 'countryName',
    value: 'US'
  }, {
    shortName: 'ST',
    value: 'State'
  }, {
    name: 'localityName',
    value: 'City'
  }, {
    name: 'organizationName',
    value: 'Local Development'
  }, {
    shortName: 'OU',
    value: 'Development'
  }];

  cert.setSubject(attrs);
  cert.setIssuer(attrs);

  // Self-sign the certificate
  cert.sign(keys.privateKey);

  // Convert to PEM format
  const privateKeyPem = forge.pki.privateKeyToPem(keys.privateKey);
  const certPem = forge.pki.certificateToPem(cert);

  // Write files
  fs.writeFileSync(path.join(certDir, 'key.pem'), privateKeyPem);
  fs.writeFileSync(path.join(certDir, 'cert.pem'), certPem);

  console.log('SSL certificates generated successfully!');
}

try {
  generateSelfSignedCert();
} catch (error) {
  console.error('Error generating SSL certificates:', error);
  process.exit(1);
} 