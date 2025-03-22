import _ from "lodash"
import QRCode from 'qrcode'
import VCardX from 'vcard-creator'
const VCard = VCardX.default
import fs from 'fs'
import path from 'path'
import mime from 'mime'

export async function qrCode(str, opts) {
    const defaultOpts = {
        errorCorrectionLevel: 'M',
        type: 'svg'
    }
    const mergedOpts = {...defaultOpts, ...opts || {}}
    // console.log('qrCode', str, mergedOpts)
    const result = await QRCode.toString(str, mergedOpts)
    return result
}
qrCode.paired = true

/**
 * @see https://github.com/joaocarmo/vcard-creator/blob/main/lib/VCard.ts
 */
export function vCard(...fields) {
    const {jobTitle, email, phoneNumber, url, fullName, note, photo, photoUrl} = _.merge(...fields)
    const result = new VCard()
    if (!!jobTitle) result.addJobtitle(jobTitle)
    if (!!email) result.addEmail(email)
    if (!!phoneNumber) result.addPhoneNumber(phoneNumber, 'CELL')
    if (!!url) result.addURL(url)
    if (!!fullName) result.setProperty('fullname', `FN${result.getCharsetString()}`, fullName)

    if (note) result.addNote(note)

    if (!!photo) {
        const mimeType = mime.getType(photo)
        const vcardMimeType = mimeType.split('/', 2)[1]
        const buffer = Buffer.from(fs.readFileSync(photo)).toString('base64')
        result.addPhoto(buffer, vcardMimeType)
    }

    if (!!photoUrl) result.addPhotoURL(photoUrl)

    return result.toString()
}
