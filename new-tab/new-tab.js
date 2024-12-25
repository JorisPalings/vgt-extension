document.querySelector('.date').textContent = new Intl.DateTimeFormat('nl-BE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
}).format(new Date());

const noOfDailySigns = 9;
let selectedSigns = []

function syncBookmarkedSignsWithStorage() {
    let currentStoredBookmarks = localStorage.getItem('bookmarkedSigns')
    if(currentStoredBookmarks) {
        currentStoredBookmarks = JSON.parse(localStorage.getItem('bookmarkedSigns'))
        currentStoredBookmarks.forEach(bookmarkedSign => {
            const bookmarkedSignElement = document.querySelector(`.sign[data-sign-gloss-name="${bookmarkedSign.g}`)
            indicateBookmarkedStatus(bookmarkedSignElement, true)
        })
    }
}

function toggleSignBookmark(event) {
    const signElement = event.srcElement.closest('.sign')
    const signGlossName = signElement.dataset.signGlossName
    const signToToggle = selectedSigns.find(sign => sign.g = signGlossName)

    let currentStoredBookmarks = localStorage.getItem('bookmarkedSigns')
    if(currentStoredBookmarks) {
        currentStoredBookmarks = JSON.parse(localStorage.getItem('bookmarkedSigns'))
    } else {
        currentStoredBookmarks = []
    }

    const isSignBookmarked = currentStoredBookmarks.map(bookmark => bookmark.g).includes(signToToggle.g)

    if(!isSignBookmarked) {
        bookmarkSign(currentStoredBookmarks, signToToggle, signElement)
    } else {
        removeSignFromBookmarks(currentStoredBookmarks, signToToggle, signElement)
    }
}

function bookmarkSign(currentStoredBookmarks, signToBookmark, signElement) {
    const newStoredBookmarks = currentStoredBookmarks
    newStoredBookmarks.push(signToBookmark)
    localStorage.setItem('bookmarkedSigns', JSON.stringify(newStoredBookmarks))

    indicateBookmarkedStatus(signElement, true)
}

function removeSignFromBookmarks(currentStoredBookmarks, signToRemoveFromBookmarks, signElement) {
    const newStoredBookmarks = currentStoredBookmarks.filter(bookmark => bookmark.g !== signToRemoveFromBookmarks.g)
    localStorage.setItem('bookmarkedSigns', JSON.stringify(newStoredBookmarks))

    indicateBookmarkedStatus(signElement, false)
}

function indicateBookmarkedStatus(signElement, bookmarked) {
    const bookmarkButtonElement = signElement.querySelector('.sign-action-button.bookmark')
    if(bookmarked === true) {
        bookmarkButtonElement.classList.add('bookmarked')
    } else {
        bookmarkButtonElement.classList.remove('bookmarked')
    }
}

function showSignInfoPopup(event) {
    const signElement = event.srcElement.closest('.sign')
    const signGlossName = signElement.dataset.signGlossName
    alert(`Show info popup for sign ${signGlossName}`)
}

function showRegionalSign(event) {
    const signElement = event.srcElement.closest('.sign')
    const signGlossName = signElement.dataset.signGlossName
    const selectedRegionIndex = event.srcElement.selectedIndex
    const matchingSelectedSign = selectedSigns.find(sign => sign.g === signGlossName)
    
    const signVideoElement = signElement.querySelector('video')
    const signVideoSourceElement = signVideoElement.querySelector('source')
    signVideoSourceElement.src = `https://vlaamsegebarentaal.be/signbank/dictionary/protected_media/glossvideo/${matchingSelectedSign.s[selectedRegionIndex].v}-${matchingSelectedSign.s[selectedRegionIndex].id}.mp4`
    signVideoElement.load()
}

(async function() {
    const response = await fetch('signs.min.json')
    const signs = await response.json()

    const today = new Date().toISOString().split('T')[0]
    let hash = 0
    for (let i = 0; i < today.length; i ++) {
        hash = (hash * 31 + today.charCodeAt(i)) % 2 ** 32
    }
    const dayOfTheWeek = new Date(today).getDay()
    hash += dayOfTheWeek * 123456
    const selectedIndices = []
    for (let i = 0; i < noOfDailySigns; i ++) {
        const index = (Math.abs(hash + i * 789) % signs.length)
        if (!selectedIndices.includes(index)) {
            selectedIndices.push(index)
            selectedSigns.push(signs[index])
        }
    }

    const signsGrid = document.querySelector('.signs-grid')
    await Promise.all(selectedSigns.map(sign => {
        const noOfSigns = sign.s.length

        let selectDisabled = ''
        if(noOfSigns === 1) selectDisabled = 'disabled'

        let regionSelectControls = ''
        if(noOfSigns > 1) {
            regionSelectControls = `
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <g>
                        <path d="M21.707,8.707l-9,9a1,1,0,0,1-1.414,0l-9-9A1,1,0,1,1,3.707,7.293L12,15.586l8.293-8.293a1,1,0,1,1,1.414,1.414Z"/>
                    </g>
                </svg>
                <span class="sign-region-select-no-of-signs">(${noOfSigns})</span>
            `
        }

        const regionOptions = sign.s.map((signSign, index) => {
            const regions = signSign.r.map(region => {
                if(region === '*') return 'Vlaanderen'
                if(region === 'A') return 'Antwerpen'
                if(region === 'O') return 'Oost-Vlaanderen'
                if(region === 'W') return 'West-Vlaanderen'
                if(region === 'V') return 'Vlaams-Brabant'
                if(region === 'L') return 'Limburg'
                if(region === '?') return 'Onbekend'
            })
            return `<option class="sign-region-option" data-sign-index=[${index}]>
                ${regions.join(', ')}
            </option>`
        }).join('')

        signsGrid.insertAdjacentHTML('beforeend', `
            <li class="sign" data-sign-gloss-name="${sign.g}">
                <div class="sign-header">
                    <h2 class="sign-name" title="${sign.s[0].t.join(', ')}">${sign.s[0].t.join(', ')}</h2>
                    <ul class="sign-actions">
                        <li class="sign-action">
                            <button class="sign-action-button bookmark">
                                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <polygon points="18.74 3 18.74 21 11.97 14.33 5.27 20.94 5.27 3 18.74 3" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>
                                </svg>
                            </button>
                        </li>
                        <li class="sign-action">
                            <button class="sign-action-button info">
                                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <polygon points="5.01 21 5.01 3 12.04 9.67 19 3.06 19 21 5.01 21" display="none" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round"/>
                                    <circle cx="12" cy="12" r="9" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round"/>
                                    <g>
                                        <path d="M11.64,8.57c0-.16.03-.3.08-.43.05-.13.14-.25.25-.36.11-.11.23-.19.36-.24.13-.05.27-.08.42-.08s.29.03.42.08c.13.05.25.14.35.24.11.11.19.23.24.36.05.13.08.28.08.43s-.03.29-.08.42c-.05.13-.13.25-.24.36-.11.11-.22.19-.35.25-.13.05-.27.08-.42.08s-.29-.03-.43-.08c-.13-.05-.25-.14-.36-.25-.11-.11-.19-.23-.24-.36-.05-.13-.08-.27-.08-.43h0Z"/>
                                        <path d="M12.12,15.01c-.04.14-.12.43.12.43.05,0,.12-.03.2-.09.09-.06.18-.16.29-.28.11-.13.23-.28.35-.45.12-.17.25-.37.38-.59.01-.02.04-.03.07-.02,0,0,0,0,0,0l.45.33s.03.05.01.07c-.21.36-.41.67-.62.94-.21.27-.43.49-.64.67h0c-.22.18-.44.31-.67.4-.64.25-1.64.21-1.93-.54-.18-.47-.03-1,.11-1.46l.72-2.19c.05-.17.1-.35.13-.52.03-.28-.09-.47-.4-.47h-.63s-.05-.02-.05-.05v-.02s.17-.6.17-.6c0-.02.03-.04.05-.04l3.22-.1s.05.02.05.05v.02s-1.37,4.51-1.37,4.51h0Z"/>
                                    </g>
                                </svg>
                            </button>
                        </li>
                    </ul>
                    <div class="sign-regions">
                        <select class="sign-region-select" ${selectDisabled}>
                            ${regionOptions}
                        </select>
                        <div class="sign-region-select-controls">
                            ${regionSelectControls}
                        </div>
                    </div>
                </div>
                <video autoplay loop muted class="sign-video">
                    <source src="https://vlaamsegebarentaal.be/signbank/dictionary/protected_media/glossvideo/${sign.s[0].v}-${sign.s[0].id}.mp4" type="video/mp4" />
                </video>
            </li>
        `)
    }));
    
    [...document.querySelectorAll('.sign-action-button.bookmark')].forEach(button => {
        button.addEventListener('click', toggleSignBookmark)
    });

    [...document.querySelectorAll('.sign-action-button.info')].forEach(button => {
        button.addEventListener('click', showSignInfoPopup)
    });

    [...document.querySelectorAll('.sign-region-select')].forEach(select => {
        select.addEventListener('click', showRegionalSign)
    });

    syncBookmarkedSignsWithStorage()
})()