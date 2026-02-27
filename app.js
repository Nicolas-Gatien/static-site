document.addEventListener("DOMContentLoaded", () => {
    const sides = document.querySelectorAll(".side")

    const fontSize = 16
    const font = `${fontSize}px "Space Mono", monospace`
    const letterPadding = 0

    const asciiStart = 65
    const asciiEnd = 126

    const dpr = window.devicePixelRatio || 1

    sides.forEach(side => createGrid(side))

    function createGrid(side) {

        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        const width = side.clientWidth
        const height = side.clientHeight

        canvas.width = width * dpr
        canvas.height = height * dpr

        canvas.style.width = width + "px"
        canvas.style.height = height + "px"

        ctx.scale(dpr, dpr)

        ctx.font = font
        ctx.textBaseline = "top"

        side.appendChild(canvas)

        const metrics = ctx.measureText("A")
        const letterWidth = metrics.width
        const letterHeight = fontSize * 1.25

        const columns = Math.floor(width / (letterWidth + letterPadding))
        const rows = Math.floor(height / (letterHeight + letterPadding))

        const total = columns * rows

        const letters = new Uint8Array(total)
        const lastUpdate = new Float64Array(total)
        const delays = new Float32Array(total)

        for (let i = 0; i < total; i++) {
            letters[i] = asciiStart
            lastUpdate[i] = 0
            delays[i] = Math.random() * 1000 + 250
        }

        let hoveredIndex = -1

        canvas.addEventListener("mousemove", e => {

            const rect = canvas.getBoundingClientRect()

            const x = e.clientX - rect.left
            const y = e.clientY - rect.top

            const col = Math.floor(x / (letterWidth + letterPadding))
            const row = Math.floor(y / (letterHeight + letterPadding))

            const index = row * columns + col

            hoveredIndex = index >= 0 && index < total ? index : -1
        })

        canvas.addEventListener("mouseleave", () => {
            hoveredIndex = -1
        })

        function draw(now) {

            ctx.clearRect(0, 0, width, height)

            for (let i = 0; i < total; i++) {

                if (now - lastUpdate[i] > delays[i]) {

                    let next = letters[i] + 1

                    if (next > asciiEnd) next = asciiStart

                    letters[i] = next
                    lastUpdate[i] = now
                }

                const col = i % columns
                const row = Math.floor(i / columns)

                const x = col * (letterWidth + letterPadding)
                const y = row * (letterHeight + letterPadding)

                if (i === hoveredIndex) {

                    ctx.save()

                    ctx.translate(x + letterWidth / 2, y + letterHeight / 2)
                    ctx.scale(1.2, 1.2)
                    ctx.translate(-letterWidth / 2, -letterHeight / 2)

                    ctx.globalAlpha = 0.3
                    ctx.fillText(String.fromCharCode(letters[i]), 0, 0)

                    ctx.restore()

                } else {

                    ctx.globalAlpha = 0.1
                    ctx.fillText(String.fromCharCode(letters[i]), x, y)
                }
            }

            requestAnimationFrame(draw)
        }

        requestAnimationFrame(draw)
    }
})