/**
 * Script de ofuscación para los archivos JS de los controllers.
 * Uso: npm run obfuscate-js
 *
 * Lee cada .js de app/controllers/**, lo ofusca y sobreescribe el archivo.
 * El código fuente original queda en app/controllers_backup/** (no se modifica).
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import JavaScriptObfuscator from 'javascript-obfuscator';

const SRC_DIR = join(process.cwd(), 'app', 'controllers');

/** Recorre recursivamente un directorio y devuelve todos los .js */
function walkJs(dir) {
    const results = [];
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
            results.push(...walkJs(full));
        } else if (extname(entry) === '.js') {
            results.push(full);
        }
    }
    return results;
}

const files = walkJs(SRC_DIR);

if (files.length === 0) {
    console.log('No se encontraron archivos .js en', SRC_DIR);
    process.exit(0);
}

let ok = 0;
let fail = 0;

for (const file of files) {
    try {
        const src = readFileSync(file, 'utf8');
        const result = JavaScriptObfuscator.obfuscate(src, {
            compact: true,
            controlFlowFlattening: false,   // menos agresivo = menos errores en runtime
            deadCodeInjection: false,
            stringArray: true,
            stringArrayEncoding: ['base64'],
            stringArrayThreshold: 0.75,
            rotateStringArray: true,
            shuffleStringArray: true,
            splitStrings: false,
            selfDefending: false,           // evita problemas con minificadores extra
            debugProtection: false,
            disableConsoleOutput: false,
        });
        writeFileSync(file, result.getObfuscatedCode(), 'utf8');
        console.log('✔ Ofuscado:', file.replace(process.cwd(), ''));
        ok++;
    } catch (err) {
        console.error('✘ Error en:', file.replace(process.cwd(), ''), '->', err.message);
        fail++;
    }
}

console.log(`\nListo: ${ok} ofuscados, ${fail} errores.`);
