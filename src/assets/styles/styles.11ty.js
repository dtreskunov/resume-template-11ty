// This file handles the CSS build.
// It will run Sass and compile all styles defined in the main entry file.

// main entry point name
const ENTRY_FILE_NAME = 'main.scss'

import path from 'path'
import * as sass from 'sass-embedded'
import cssesc from 'cssesc'
const isProd = process.env.ELEVENTY_ENV === 'production'

import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default class {
    async data() {
        const entryPath = path.join(__dirname, `/${ENTRY_FILE_NAME}`)
        return {
            permalink: `/assets/styles/main.css`,
            eleventyExcludeFromCollections: true,
            entryPath
        }
    }

    // Compile and minify Sass
    async compile(path) {
        const compileOptions = isProd ? {
            sourceMap: false,
            style: 'compressed',
        } : {
            sourceMap: true,
            style: 'expanded',
        }
        const compiled = await sass.compileAsync(path, compileOptions)
        return this.appendSourceMap(compiled)
    }

    appendSourceMap(compiled) {
        if (!compiled.sourceMap) {
            return compiled.css
        }
        const sm = JSON.stringify(compiled.sourceMap)
        const smBase64 = (Buffer.from(sm, 'utf8') || '').toString('base64')
        const smComment = '/*# sourceMappingURL=data:application/json;charset=utf-8;base64,' + smBase64 + ' */'
        return compiled.css + '\n'.repeat(2) + smComment
    }

    // display an error overlay when CSS build fails.
    // this brilliant idea is taken from Mike Riethmuller / Supermaya
    // @see https://github.com/MadeByMike/supermaya/blob/master/site/utils/compile-scss.js
    renderError(error) {
        return `
        /* Error compiling stylesheet */
        *,
        *::before,
        *::after {
            box-sizing: border-box;
        }
        html,
        body {
            margin: 0;
            padding: 0;
            min-height: 100vh;
            font-family: monospace;
            font-size: 1.25rem;
            line-height:1.5;
        } 
        body::before { 
            content: ''; 
            background: #000;
            top: 0;
            bottom: 0;
            width: 100%;
            height: 100%;
            opacity: 0.7;
            position: fixed;
        }
        body::after { 
            content: '${cssesc(error)}'; 
            white-space: pre;
            display: block;
            top: 0; 
            padding: 30px;
            margin: 50px;
            width: calc(100% - 100px);
            color:#721c24;
            background: #f8d7da;
            border: solid 2px red;
            position: fixed;
        }`
    }

    // render the CSS file
    async render({ entryPath }) {
        try {
            return this.compile(entryPath)
        } catch (err) {
            // if things go wrong
            if (isProd) {
                // throw and abort in production
                throw new Error(err)
            } else {
                // otherwise display the error overlay
                console.error(err)
                const msg = err.formatted || err.message
                return this.renderError(msg)
            }
        }
    }
}
