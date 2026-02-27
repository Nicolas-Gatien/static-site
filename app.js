document.addEventListener("DOMContentLoaded", () => {
    const sides = document.getElementsByClassName('side')

    let letterIncrementDelays = {}
    let blackoutList = []

    const testLetterDiv = document.createElement('div')
    testLetterDiv.id = "test-letter"
    testLetterDiv.textContent = "A"
    document.getElementById('content').appendChild(testLetterDiv)

    const letterWidth = testLetterDiv.getBoundingClientRect().width
    const letterHeight = testLetterDiv.getBoundingClientRect().height


    for (const side of sides) {
        const columns = Math.floor(side.getBoundingClientRect().width / letterWidth)
        const rows = Math.floor(side.getBoundingClientRect().height / letterHeight)

        for (let i = 0; i < columns * rows; i++) {
            const letter = document.createElement('span')
            letter.textContent = "A"
            letter.id = `letter-${i}-${side.id}`
            letter.classList.add('letter')
            letter.addEventListener("click", () => {
                const charcode = letter.textContent.charCodeAt(0)

                if (blackoutList.includes(charcode)) {
                    restoreBlackoutCharacterByAscii(charcode)
                    blackoutList.pop(blackoutList.indexOf(charcode))
                    letterIncrementDelays[letter.id]['delay'] = (Math.random() * 1000) + 250
                } else {
                    blackoutCharacterByAscii(charcode)
                    blackoutList.push(charcode)
                    letterIncrementDelays[letter.id]['delay'] = 999999999999
                }
            })

            letterIncrementDelays[letter.id] = {"last-update": 0, "delay": (Math.random() * 1000) + 250}

            side.appendChild(letter)
            console.log(letterHeight)
            console.log(letterWidth)
            console.log(side.offsetWidth)
        }
    }

    const letters = Array.from(document.querySelectorAll('.letter'))

    function incrementLetters() {
        const now = Date.now()
        for (const letter of letters) {
            if (now - letterIncrementDelays[letter.id]['last-update'] < letterIncrementDelays[letter.id]['delay']) {
                continue
            }

            let nextCharCode = letter.textContent.charCodeAt(0) + 1
            while (blackoutList.includes(nextCharCode) || nextCharCode > 126) {
                nextCharCode += 1
                if (nextCharCode > 126) {
                    nextCharCode = 33
                }
            }

            if (blackoutList.includes(nextCharCode)) {
                letter.classList.add('blackout-span')
            } else {
                letter.classList.remove('blackout-span')
            }
            letter.textContent = String.fromCharCode(nextCharCode)
            letterIncrementDelays[letter.id]['last-update'] = now
        }
        requestAnimationFrame(incrementLetters)
    }

    requestAnimationFrame(incrementLetters)
})

function blackoutCharacterByAscii(asciiCode) {
    const targetChar = String.fromCharCode(asciiCode);

    function walk(node) {
        // Only process text nodes
        if (node.nodeType === Node.TEXT_NODE) {
            if (node.nodeValue.includes(targetChar)) {
                const fragment = document.createDocumentFragment();
                const parts = node.nodeValue.split(targetChar);

                parts.forEach((part, index) => {
                    // Add the text before the character
                    if (part.length > 0) {
                        fragment.appendChild(document.createTextNode(part));
                    }

                    // Add the blackout span between parts
                    if (index < parts.length - 1) {
                        const span = document.createElement('span');
                        span.className = 'blackout';
                        span.textContent = targetChar;
                        fragment.appendChild(span);
                    }
                });

                node.parentNode.replaceChild(fragment, node);
            }
        } 
        // Recurse through child nodes
        else if (node.nodeType === Node.ELEMENT_NODE) {
            // Skip script/style tags
            if (node.tagName === "SCRIPT" || node.tagName === "STYLE") return;

            Array.from(node.childNodes).forEach(walk);
        }
    }

    walk(document.body);
}

function restoreBlackoutCharacterByAscii(asciiCode) {
    const targetChar = String.fromCharCode(asciiCode);

    const blackoutSpans = document.querySelectorAll('span.blackout');

    blackoutSpans.forEach(span => {
        if (span.textContent === targetChar) {
            const textNode = document.createTextNode(targetChar);
            span.parentNode.replaceChild(textNode, span);
        }
    });

    // Optional: merge adjacent text nodes to clean up DOM
    document.body.normalize();
}