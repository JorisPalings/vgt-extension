(function() {
    if (window.hasInjectedScript) {
        return
    }

    window.hasInjectedScript = true

    chrome.runtime.onMessage.addListener(async (message) => {
        const selectedText = message.selectedText

        let currentVideoIndex = 0
        let previousSelectedText = ''

        if (selectedText !== previousSelectedText) {
            const existingOverlay = document.getElementById('sign-video-overlay')
            if (existingOverlay) {
                existingOverlay.remove()
            }
            previousSelectedText = selectedText
        }

        const response = await fetch(chrome.runtime.getURL('signs.min.json'))
        const signs = await response.json()

        const matchingSigns = signs.filter(sign => sign.t.includes(selectedText))
        if (matchingSigns.length === 0) {
            alert(`Geen gebaar gevonden voor '${selectedText}'.`)
            return
        }

        const videoUrls = matchingSigns.map(sign => {
            return `https://vlaamsegebarentaal.be/signbank/dictionary/protected_media/glossvideo/${sign.v}-${sign.s}.mp4`
        })

        let overlay = document.getElementById('sign-video-overlay')

        if (!overlay) {
            overlay = document.createElement('div')
            overlay.id = 'sign-video-overlay'
            overlay.style.alignItems = 'center'
            overlay.style.backgroundColor = 'white'
            overlay.style.borderRadius = '16px'
            overlay.style.bottom = '16px'
            overlay.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.5)'
            overlay.style.display = 'flex'
            overlay.style.flexDirection = 'column'
            overlay.style.overflow = 'hidden'
            overlay.style.position = 'fixed'
            overlay.style.right = '16px'
            overlay.style.width = '360px'
            overlay.style.zIndex = '10000'

            const translationsDiv = document.createElement('span')
            translationsDiv.id = 'sign-video-translations'
            translationsDiv.style.color = 'black'
            translationsDiv.style.fontSize = '16px'
            translationsDiv.style.fontWeight = 'bold'
            translationsDiv.style.padding = '4px 0 4px'
            translationsDiv.style.textAlign = 'center'
            overlay.appendChild(translationsDiv)

            const regionsDiv = document.createElement('span')
            regionsDiv.id = 'sign-video-regions'
            regionsDiv.style.color = 'black'
            regionsDiv.style.fontSize = '12px'
            regionsDiv.style.fontStyle = 'italic'
            regionsDiv.style.padding = '0 0 4px'
            regionsDiv.style.textAlign = 'center'
            overlay.appendChild(regionsDiv)

            const videoContainer = document.createElement('div')
            videoContainer.style.position = 'relative'
            videoContainer.style.width = '100%'
            videoContainer.style.paddingTop = '75%'
            videoContainer.style.overflow = 'hidden'

            const video = document.createElement('video')
            video.id = 'sign-video'
            video.autoplay = true
            video.loop = true
            video.style.position = 'absolute'
            video.style.top = '0'
            video.style.left = '0'
            video.style.width = '100%'
            video.style.height = '100%'
            video.style.objectFit = 'cover'
            videoContainer.appendChild(video)

            overlay.appendChild(videoContainer)

            const navContainer = document.createElement('div')
            navContainer.style.position = 'absolute'
            navContainer.style.top = '50%'
            navContainer.style.left = '0'
            navContainer.style.right = '0'
            navContainer.style.transform = 'translateY(-50%)'
            navContainer.style.display = 'flex'
            navContainer.style.justifyContent = 'space-between'
            navContainer.style.width = '100%'

            const prevButton = document.createElement('button')
            prevButton.textContent = '◀'
            prevButton.style.background = 'rgba(255, 255, 255, 0.8)'
            prevButton.style.border = 'none'
            prevButton.style.padding = '4px 8px 4px 4px'
            prevButton.style.cursor = 'pointer'
            prevButton.style.borderRadius = '0 8px 8px 0'
            prevButton.addEventListener('click', () => {
                currentVideoIndex = (currentVideoIndex - 1 + videoUrls.length) % videoUrls.length
                video.src = videoUrls[currentVideoIndex]
                updateRegions()
            })
            navContainer.appendChild(prevButton)

            const nextButton = document.createElement('button')
            nextButton.textContent = '▶'
            nextButton.style.background = 'rgba(255, 255, 255, 0.7)'
            nextButton.style.border = 'none'
            nextButton.style.padding = '4px 4px 4px 8px'
            nextButton.style.cursor = 'pointer'
            nextButton.style.borderRadius = '8px 0 0 8px'
            nextButton.addEventListener('click', () => {
                currentVideoIndex = (currentVideoIndex + 1) % videoUrls.length
                video.src = videoUrls[currentVideoIndex]
                updateRegions()
            })
            navContainer.appendChild(nextButton)

            overlay.appendChild(navContainer)

            const closeButton = document.createElement('button')
            closeButton.textContent = '✕'
            closeButton.style.position = 'absolute'
            closeButton.style.top = '0'
            closeButton.style.right = '0'
            closeButton.style.background = 'rgba(255, 255, 255, 0.8)'
            closeButton.style.border = 'none'
            closeButton.style.borderRadius = '50%'
            closeButton.style.cursor = 'pointer'
            closeButton.style.padding = '0'
            closeButton.style.width = '24px'
            closeButton.style.height = '24px'
            closeButton.style.fontSize = '16px'
            closeButton.style.textAlign = 'center'
            closeButton.style.lineHeight = '24px'
            closeButton.style.zIndex = '10001'
            closeButton.addEventListener('click', () => overlay.remove())
            overlay.appendChild(closeButton)

            document.body.appendChild(overlay)
        }

        function updateRegions() {
            const translationsDiv = document.getElementById('sign-video-translations')
            translationsDiv.textContent = matchingSigns[currentVideoIndex].t.join(', ')

            const regionsDiv = document.getElementById('sign-video-regions')
            regionsDiv.textContent = matchingSigns[currentVideoIndex].r.join(', ')
        }

        const video = document.getElementById('sign-video')
        video.src = videoUrls[currentVideoIndex]

        updateRegions()

        const navContainer = document.querySelector('#sign-video-overlay > div:nth-child(3)')
        if (videoUrls.length <= 1) {
            navContainer.style.display = 'none'
        } else {
            navContainer.style.display = 'flex'
        }
    })
})()