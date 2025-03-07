import 'focus-visible'
import emailScramble from 'email-scramble'

document.documentElement.classList.remove('no-js')

// Scroll State
const onScroll = () => {
    const scrollClassName = 'js-scrolled'
    const scrollTreshold = 200
    const isOverTreshold = window.scrollY > scrollTreshold

    if (isOverTreshold) {
        document.documentElement.classList.add(scrollClassName)
    } else {
        document.documentElement.classList.remove(scrollClassName)
    }
}
window.addEventListener('scroll', onScroll, { passive: true })

// Print Button
const printButton = document.querySelector('.js-print')
printButton.addEventListener('click', () => {
    window.print()
})

function unscrambleHref(element) {
    const components = element.href.split(':', 2)
    if (components.length > 1) {
        element.href = components[0] + ':' + emailScramble.decode(components[1])
    } else {
        element.href = emailScramble.decode(element.href)
    }
}
function unscrambleContent(element) {
    element.textContent = emailScramble.decode(element.textContent)
}
document.querySelectorAll('[data-scrambled-href]').forEach(unscrambleHref)
document.querySelectorAll('[data-scrambled-content]').forEach(unscrambleContent)
