import {minify} from 'html-minifier-terser'
import {generate} from 'critical'
const buildDir = 'dist'

const shouldTransformHTML = (outputPath) =>
    outputPath &&
    outputPath.endsWith('.html') &&
    process.env.ELEVENTY_ENV === 'production'

const isHomePage = (outputPath) => outputPath === `${buildDir}/index.html`

process.setMaxListeners(Infinity)

export function htmlmin(content, outputPath) {
    if (shouldTransformHTML(outputPath)) {
        return minify(content, {
            useShortDoctype: true,
            removeComments: true,
            collapseWhitespace: true
        })
    }
    return content
}

export async function critical (content, outputPath) {
    if (shouldTransformHTML(outputPath) && isHomePage(outputPath)) {
        try {
            const config = {
                base: `${buildDir}/`,
                html: content,
                inline: true,
                width: 1280,
                height: 800
            }
            const { html } = await generate(config)
            return html
        } catch (err) {
            console.error(err)
        }
    }
    return content
}
