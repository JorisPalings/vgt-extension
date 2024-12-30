// TODO: Add settings as popup
// TODO: Implement info pop-ups
// TODO: Add "Load more" button to discover tab
// TODO: Fix grid for <3 signs
// TODO: Show empty states when relevant
// TODO: Make the distinction between "words" and "signs"

let signs = []
let selectedSigns = []

function showTab(tabId) {
    ;[...document.querySelectorAll(`section`)].forEach(section => section.classList.remove('active'))
    document.querySelector(`section.${tabId}`).classList.add('active')
}

async function renderSignsGrid(signs, signsGridElement) {
    signsGridElement.innerHTML = ''

    await Promise.all(signs.map(sign => {
        const noOfSigns = sign.s.length

        let selectDisabled = ''
        if(noOfSigns === 1) selectDisabled = 'disabled'

        let regionSelectControls = ''
        if(noOfSigns > 1) {
            regionSelectControls = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"/>
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
                if(region === '?') return 'Regio niet gekend'
            })
            return `<option class="sign-region-option" data-sign-index=[${index}]>
                ${regions.join(', ')}
            </option>`
        }).join('')

        signsGridElement.insertAdjacentHTML('beforeend', `
            <li class="sign" data-sign-gloss-name="${sign.g}">
                <div class="sign-header">
                    <h2 class="sign-name" title="${sign.t.join(', ')}">${sign.t.join(', ')}</h2>
                    <ul class="sign-actions">
                        <li class="sign-action">
                            <button class="sign-action-button bookmark">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                                <path class="fill" d="M192,48V224l-64-40L64,224V48a8,8,0,0,1,8-8H184A8,8,0,0,1,192,48Z"/>
                                <path class="stroke" d="M184,32H72A16,16,0,0,0,56,48V224a8,8,0,0,0,12.24,6.78L128,193.43l59.77,37.35A8,8,0,0,0,200,224V48A16,16,0,0,0,184,32Zm0,177.57-51.77-32.35a8,8,0,0,0-8.48,0L72,209.57V48H184Z"/>
                            </svg>
                            </button>
                        </li>
                        <li class="sign-action">
                            <button class="sign-action-button info">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z"/>
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

        ;[...document.querySelectorAll(`.sign[data-sign-gloss-name="${sign.g}"] .sign-action-button.bookmark`)].forEach(button => {
            button.addEventListener('click', toggleSignBookmark)
        })
    
        ;[...document.querySelectorAll(`.sign[data-sign-gloss-name="${sign.g}"] .sign-action-button.info`)].forEach(button => {
            button.addEventListener('click', showSignInfoPopup)
        })
    
        ;[...document.querySelectorAll(`.sign[data-sign-gloss-name="${sign.g}"] .sign-region-select`)].forEach(select => {
            select.addEventListener('click', showRegionalSign)
        })
    }))
}

function getBookmarkedSigns() {
    let currentStoredBookmarks = localStorage.getItem('bookmarkedSigns')
    return currentStoredBookmarks ? JSON.parse(currentStoredBookmarks) : []
}

function syncBookmarkedSignsWithStorage() {
    let currentStoredBookmarks = getBookmarkedSigns()
    if(currentStoredBookmarks) {
        const bookmarkedGlossNames = currentStoredBookmarks.map(sign => sign.g)
        ;[...document.querySelectorAll('.sign')].forEach(sign => {
            if(bookmarkedGlossNames.includes(sign.dataset.signGlossName)) {
                indicateBookmarkedStatus(sign, true)
            } else {
                indicateBookmarkedStatus(sign, false)
            }
        })
    }
}

function toggleSignBookmark(event) {
    const signElement = event.srcElement.closest('.sign')
    const signGlossName = signElement.dataset.signGlossName
    const signToToggle = signs.find(sign => sign.g === signGlossName)

    const currentStoredBookmarks = getBookmarkedSigns()

    const isSignBookmarked = currentStoredBookmarks
        .map(bookmark => bookmark.g).includes(signToToggle.g)

    if(!isSignBookmarked) {
        bookmarkSign(currentStoredBookmarks, signToToggle, signElement)
    } else {
        removeSignFromBookmarks(currentStoredBookmarks, signToToggle, signElement)
    }

    const bookmarkedSigns = getBookmarkedSigns()
    const bookmarkedSignsGrid = document.querySelector('.signs-grid.bookmarked-signs')
    renderSignsGrid(bookmarkedSigns, bookmarkedSignsGrid)

    syncBookmarkedSignsWithStorage()
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
    const matchingSelectedSign = signs.find(sign => sign.g === signGlossName)
    
    const signVideoElement = signElement.querySelector('video')
    const signVideoSourceElement = signVideoElement.querySelector('source')
    signVideoSourceElement.src = `https://vlaamsegebarentaal.be/signbank/dictionary/protected_media/glossvideo/${matchingSelectedSign.s[selectedRegionIndex].v}-${matchingSelectedSign.s[selectedRegionIndex].id}.mp4`
    signVideoElement.load()
}

function debounce(func, delay) {
    let timer
    return function () {
        const args = arguments
        clearTimeout(timer)
        timer = setTimeout(() => func.apply(this, args), delay)
    }
}

async function searchSigns(query, signs, resultsList) {
    const filteredSigns = signs.filter(sign => {
        return sign.s.some(signSign => {
            return signSign.t.some(translation => {
                return translation.toLowerCase().includes(query.toLowerCase())
            })
        })
    }).sort((signA, signB) => {
        return signA.s[0].t[0].length - signB.s[0].t[0].length
    })
    .slice(0, 9)

    renderSignsGrid(filteredSigns, resultsList)
}

function setupDailyTab(signs) {
    // Show date
    document.querySelector('.date').textContent = new Intl.DateTimeFormat('nl-BE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    }).format(new Date())

    // Select pseudo-random signs
    const today = new Date().toISOString().split('T')[0]
    let hash = 0
    for (let i = 0; i < today.length; i ++) {
        hash = (hash * 31 + today.charCodeAt(i)) % 2 ** 32
    }
    const dayOfTheWeek = new Date(today).getDay()
    hash += dayOfTheWeek * 123456
    const selectedIndices = []
    const noOfDailySigns = 9
    for (let i = 0; i < noOfDailySigns; i ++) {
        const index = (Math.abs(hash + i * 789) % signs.length)
        if(!selectedIndices.includes(index)) {
            selectedIndices.push(index)
            selectedSigns.push(signs[index])
        }
    }

    // Render signs grid
    const dailySignsGrid = document.querySelector('.signs-grid.daily-signs')
    renderSignsGrid(selectedSigns, dailySignsGrid)
}

function setupDiscoverTab(signs) {
    const knownSigns = getBookmarkedSigns()
    const unknownSigns = signs.filter(sign => {
        return !knownSigns.map(knownSign => knownSign.g).includes(sign.g)
    })

    const selectedSigns = []
    const selectedSignsGlossNames = []
    let noOfRandomSigns = 9
    while(noOfRandomSigns > 0) {
        let randomSign = unknownSigns[Math.floor(Math.random() * unknownSigns.length)]
        if(!selectedSignsGlossNames.includes(randomSign.g)) {
            selectedSigns.push(randomSign)
            selectedSignsGlossNames.push(randomSign.g)
            noOfRandomSigns --
        }
    }
    const discoverSignsGrid = document.querySelector('.signs-grid.discover-signs')
    renderSignsGrid(selectedSigns, discoverSignsGrid)
}

function setupBookmarkedTab() {
    const bookmarkedSigns = getBookmarkedSigns()
    if(bookmarkedSigns.length === 0) {
        document.querySelector('.signs-grid.bookmarked-signs').classList.add('hidden')
    } else {
        document.querySelector('.bookmarks-empty-state').classList.add('hidden')
        const bookmarkedSignsGrid = document.querySelector('.signs-grid.bookmarked-signs')
        renderSignsGrid(bookmarkedSigns, bookmarkedSignsGrid)
    }
}

function setupSearchTab(signs) {
    const totalNoOfSigns = signs.length
    const searchInput = document.querySelector('.search-input')

    searchInput.placeholder = `Doorzoek ${totalNoOfSigns} woorden`
    const debouncedSearchSigns = debounce(searchSigns, 300)

    searchInput.addEventListener('input', (event) => {
        const searchResultsGrid = document.querySelector('.signs-grid.search-results')
        const query = event.target.value
        debouncedSearchSigns(query, signs, searchResultsGrid)
    })
}

(async function() {
    const response = await fetch('signs.min.json')
    signs = await response.json()

    // Top-level tabs navigation
    ;[...document.querySelectorAll('input[name=tab]')].forEach(tab => {
        tab.addEventListener('change', (event) => {
            showTab(event.target.id)
        })
    });

    setupDailyTab(signs)
    setupDiscoverTab(signs)
    setupBookmarkedTab(signs)
    setupSearchTab(signs)

    // All tabs - sync signs (make sure this runs last)
    syncBookmarkedSignsWithStorage()
})()