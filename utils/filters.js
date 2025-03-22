import fs from 'fs'
import path from 'path'
import mime from 'mime'
import { DateTime } from 'luxon'
import lodash from 'lodash'
import emailScramble from 'email-scramble'

import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function dateToFormat(date, format) {
    return DateTime.fromJSDate(date, { zone: 'utc' }).toFormat(
        String(format)
    )
}

export function dateToISO(date) {
    return DateTime.fromJSDate(date, { zone: 'utc' }).toISO({
        includeOffset: false,
        suppressMilliseconds: true
    })
}

export function stripSpaces(str) {
    return str.replace(/\s/g, '')
}

export function stripProtocol(str) {
    return str.replace(/(^\w+:|^)\/\//, '')
}

export function base64file(file) {
    const filepath = path.join(__dirname, `../src/${file}`)
    const mimeType = mime.getType(file)
    const buffer = Buffer.from(fs.readFileSync(filepath))

    return `data:${mimeType};base64,${buffer.toString('base64')}`
}

export function scramble(str) {
    return emailScramble.encode(str)
}
