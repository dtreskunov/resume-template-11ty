import path from 'node:path'
import crypto from 'crypto'
import fs from 'node:fs'
import Fetch from '@11ty/eleventy-fetch'
import memoize from 'memoize'

const SHORTCODE = 'localizeFontsCss'
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36'

async function download(url) {
    const buffer = await Fetch(
        url,
        {
            duration: '1y',
            fetchOptions: {
                headers: {
                    'user-agent': UA,
                },
            }
        }
    )
    return buffer
}

/**
 * @param {string} css
 * @param {string} downloadPathBase
 * @param {string} sitePathBase
 */
async function transformCss(css, localFontDirname, localFontUrlPrefix) {
    const regex = /url\((https:\/\/.*?)\)/g
    const promises = []
    const transformedCss = css.replace(regex, (match, urlMatch, ...rest) => {
        const fontUrl = new URL(urlMatch)
        const fontFilename = getHash(urlMatch) + '.font'
        
        const promiseFun = async () => {
            const fontContent = await download(fontUrl)
            const downloadFontPath = path.join(localFontDirname, fontFilename)
            return await writeFile(fontContent, downloadFontPath)
        }
        promises.push(promiseFun())

        const sitePath = path.posix.join(localFontUrlPrefix, fontFilename)
        return `url(${sitePath})`
    })
    await Promise.all(promises)
    return transformedCss
}

async function writeFile(content, file) {
    const dirToEnsure = path.dirname(file)
    await fs.promises.mkdir(dirToEnsure, { recursive: true })
    await fs.promises.writeFile(file, content)
}

function getHash(str) {
    return crypto
        .createHash('sha1')
        .update(str)
        .digest('hex')
        .slice(0, 7)
}

/**
 * @param {import('@11ty/eleventy').UserConfig} eleventyConfig 
 */
async function shortcode({localCssUrl, remoteCssUrl, localFontUrlPrefix, localFontDirname, localCssFilePath}) {
    const css = (await download(remoteCssUrl)).toString()
    const transformedCss = await transformCss(css, localFontDirname, localFontUrlPrefix)
    await writeFile(transformedCss, localCssFilePath)
    return `<link rel="stylesheet" href="${localCssUrl}">`
}
const memoizedShortCode = memoize(shortcode, {cacheKey: JSON.stringify})

/**
 * @param {import('@11ty/eleventy').UserConfig} eleventyConfig 
 */
export default function(eleventyConfig, ...opts) {
    eleventyConfig.addAsyncShortcode(SHORTCODE, async (localCssUrl, remoteCssUrl) => {
        const buildDir = eleventyConfig.directories.output
        const localCssFilePath = path.posix.join(buildDir, localCssUrl)
        const localFontDirname = path.dirname(localCssFilePath)

        const pathPrefix = eleventyConfig.pathPrefix
        const localFontUrlPrefix = path.posix.join(pathPrefix, path.dirname(localCssUrl))

        return memoizedShortCode({
            localCssUrl, //: path.posix.join(pathPrefix, localCssUrl),
            remoteCssUrl,
            localFontUrlPrefix,
            localFontDirname,
            localCssFilePath,
        })
    })
}
