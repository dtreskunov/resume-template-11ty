import puppeteer, { HTTPRequest } from 'puppeteer'
import createMiddleware from 'http-server/lib/core/index.js'
import union from 'union'
import path from 'path'

function createServer({root, baseDir}) {
    let serverOptions = {
        before: [createMiddleware({
            root,
            baseDir,
            defaultExt: 'html',
            gzip: false
        })],
        onError: function (err, req, res) {
            // console.error('Error: ', req, res, err);
            res.end();
        }
    };
    return union.createServer(serverOptions);
}

async function serve({root, baseDir}) {
    return new Promise(function(resolve, reject) {
        const server = createServer({root, baseDir})
        server.listen()
        server.once('listening', () => {
            resolve(server)
        });
        server.once('error', e => reject(e))
    })
}

async function waitUntilClosed(server) {
    return new Promise(function(resolve, reject) {
        server.once('close', () => resolve())
        server.close(e => reject(e))
    });
}

/**
 * 
 * @param {import('@11ty/eleventy').UserConfig} eleventyConfig 
 */
export default function(eleventyConfig) {

    const urlPathToPdfFilePath = new Map()
    const pathPrefix = eleventyConfig.pathPrefix || '/'
    const outputDir = eleventyConfig.dir.output
    
    eleventyConfig.addPreprocessor("exportToPdfPreprocessor", "*", (data, content) => {
        if (data.exportToPdf) {
            const urlPath = path.posix.join(pathPrefix, data.permalink)
            const pdfFilePath = path.posix.join(
                data.eleventy.directories.output,
                data.exportToPdf
            )
            urlPathToPdfFilePath.set(urlPath, pdfFilePath)
        }
    })

    eleventyConfig.on(
        'eleventy.after',
        async (opts) => {
            console.log(`pdfPlugin eleventy.after urlPathToPdfFilePath`, urlPathToPdfFilePath)

            const server = await serve({root: outputDir, baseDir: pathPrefix})

            // Launch the browser and open a new blank page
            const browser = await puppeteer.launch()
            const page = await browser.newPage()

            const errors = []

            /**
             * @param {HTTPRequest} request 
             */
            function addError(request) {
                const prefix = `${request.method()} ${request.url()}`

                const failure = request.failure()?.errorText
                if (failure) errors.push(`${prefix} ${failure}`)
                
                const ok = request.response()?.ok()
                if (!ok) errors.push(`${prefix} HTTP status ${request.response().status()}`)
            }
            page.on('requestfailed', addError)
            page.on('requestfinished', addError)

            for (const [urlPath, pdfFilePath] of urlPathToPdfFilePath.entries()) {
                const url = `http://localhost:${server.address().port}${urlPath}`
                await page.goto(url)
                if (errors.length > 0) {
                    console.log(`Error(s) opening ${url}`, errors)
                    throw new Error(errors)
                }
                console.log('Opened ' + url);
    
                //save the page into a PDF
                await page.pdf({ path: pdfFilePath, printBackground: true });
                console.log(`Rendered ${url} as PDF to ${pdfFilePath}`)
            }

            await browser.close();
            console.log('browser closed')

            await waitUntilClosed(server)
            console.log('server closed')
        }
    )
    console.log(`pdfPlugin says hello`)
}
