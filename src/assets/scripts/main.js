import 'focus-visible'
import emailScramble from 'email-scramble'

// import meta from '../../data/meta.json'
// console.log('meta', meta)

//
// Function definitions
//
function onScroll() {
    const scrollClassName = 'js-scrolled'
    const scrollTreshold = 200
    const isOverTreshold = window.scrollY > scrollTreshold

    if (isOverTreshold) {
        document.documentElement.classList.add(scrollClassName)
    } else {
        document.documentElement.classList.remove(scrollClassName)
    }
}

function unscrambleHref() {
    function unscramble(element) {
        const components = element.href.split(':', 2)
        if (components.length > 1) {
            element.href = components[0] + ':' + emailScramble.decode(components[1])
        } else {
            element.href = emailScramble.decode(element.href)
        }
    }
    const dataAttr = 'data-scrambled-href'
    const selector = '[' + dataAttr + ']'
    document.querySelectorAll(selector).forEach(e => {
        unscramble(e)
        e.removeAttribute(dataAttr)
    })
}

function unscrambleContent(element) {
    function unscramble(element) {
        element.textContent = emailScramble.decode(element.textContent)
    }
    const dataAttr = 'data-scrambled-content'
    const selector = '[' + dataAttr + ']'
    document.querySelectorAll(selector).forEach(e => {
        unscramble(e)
        e.removeAttribute(dataAttr)
    })
}

//
// Side effects
//

document.documentElement.classList.remove('no-js')

// Scroll State
window.addEventListener('scroll', onScroll, { passive: true })

// Print Button
document.querySelector('.js-print').addEventListener('click', () => {
    window.print()
})

unscrambleHref()
unscrambleContent()
