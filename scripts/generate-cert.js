import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import forge from 'node-forge';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const certDir = path.join(__dirname, '..', '.cert');
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir);
}

function generateSelfSignedCert() {

  const keys = forge.pki.rsa.generateKeyPair(2048);
  

  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

  
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

  cert.sign(keys.privateKey);

  
  const privateKeyPem = forge.pki.privateKeyToPem(keys.privateKey);
  const certPem = forge.pki.certificateToPem(cert);

  
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