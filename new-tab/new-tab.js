// TODO: Add settings as popup
// TODO: Set preferred region(s)
// TODO: Fix grid for <3 signs
// TODO: Make the distinction between "words" and "signs"
// TODO: Reset dialog content when closing
// TODO: Add selected region indication to info popup
// TODO: Add categories, handsigns and locations to info popup
// TODO: Add link to sign detail page on the VGTC website

let signs = []
let selectedSigns = []
let totalNoOfSigns = 5600
const noOfDailySigns = 1
const noOfDiscoverSigns = 1
const noOfSearchResultsToShow = 9

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
            button.addEventListener('click', (event) => {
                const signElement = event.target.closest('.sign')
                const signGlossName = signElement.dataset.signGlossName
                const signToToggle = signs.find(sign => sign.g === signGlossName)
                toggleSignBookmark(signToToggle, signElement)
            })
        })
    
        ;[...document.querySelectorAll(`.sign[data-sign-gloss-name="${sign.g}"] .sign-action-button.info`)].forEach(button => {
            button.addEventListener('click', (event) => showSignInfoPopup(event, sign))
        })
    
        ;[...document.querySelectorAll(`.sign[data-sign-gloss-name="${sign.g}"] .sign-region-select`)].forEach(select => {
            select.addEventListener('click', showRegionalSign)
        })
    }))
}

function showRandomUnknownSign() {
    // Filter out bookmarked (already known) signs
    const knownSigns = getBookmarkedSigns()
    const unknownSigns = signs.filter(sign => {
        return !knownSigns.map(knownSign => knownSign.g).includes(sign.g)
    })

    // Select random signs from the unknown signs
    const selectedSigns = []
    const selectedSignsGlossNames = []
    let noOfRandomSigns = noOfDiscoverSigns
    while(noOfRandomSigns > 0) {
        let randomSign = unknownSigns[Math.floor(Math.random() * unknownSigns.length)]
        if(!selectedSignsGlossNames.includes(randomSign.g)) {
            selectedSigns.push(randomSign)
            selectedSignsGlossNames.push(randomSign.g)
            noOfRandomSigns --
        }
    }

    // Render signs grid
    const discoverSignsGrid = document.querySelector('.signs-grid.discover-signs')
    renderSignsGrid(selectedSigns, discoverSignsGrid)
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

function toggleSignBookmark(signToToggle, signElement) {
    const currentStoredBookmarks = getBookmarkedSigns()

    const isSignBookmarked = currentStoredBookmarks.map(bookmark => bookmark.g).includes(signToToggle.g)
    if(!isSignBookmarked) {
        bookmarkSign(currentStoredBookmarks, signToToggle, signElement)
    } else {
        removeSignFromBookmarks(currentStoredBookmarks, signToToggle, signElement)
    }

    updateBookmarkedTab()
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
    const bookmarkButtonElement = signElement.querySelector('.bookmark')
    if(bookmarked === true) {
        bookmarkButtonElement.classList.add('bookmarked')
    } else {
        bookmarkButtonElement.classList.remove('bookmarked')
    }
}

function showSignInfoPopup(event, sign) {
    const signInfoPopup = document.querySelector('.sign-info-popup')

    signInfoPopup.insertAdjacentHTML('beforeend', `
        <div class="sign-popup-header">
            <button class="sign-popup-header-button bookmark">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                    <path class="fill" d="M192,48V224l-64-40L64,224V48a8,8,0,0,1,8-8H184A8,8,0,0,1,192,48Z"/>
                    <path class="stroke" d="M184,32H72A16,16,0,0,0,56,48V224a8,8,0,0,0,12.24,6.78L128,193.43l59.77,37.35A8,8,0,0,0,200,224V48A16,16,0,0,0,184,32Zm0,177.57-51.77-32.35a8,8,0,0,0-8.48,0L72,209.57V48H184Z"/>
                </svg>
            </button>
            <h2 class="sign-name"></h2>
            <button class="sign-popup-header-button close-popup">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                    <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path>
                </svg>
            </button>
        </div>
        <div class="sign-info">
            <video autoplay loop muted class="sign-video">
                <source type="video/mp4" />
            </video>
            <ul class="sign-regions-list"></ul>
        </div>
    `)

    signInfoPopup.querySelector('.bookmark').addEventListener('click', () => {
        toggleSignBookmark(sign, signInfoPopup)
    })
    
    const signName = signInfoPopup.querySelector('.sign-name')
    signName.textContent = sign.t.join(', ')

    const signRegionsList = signInfoPopup.querySelector('.sign-regions-list')
    const signRegionListItems = sign.s.map((signSign, index) => {
        const regions = signSign.r.map(region => {
            if(region === '*') return 'Vlaanderen'
            if(region === 'A') return 'Antwerpen'
            if(region === 'O') return 'Oost-Vlaanderen'
            if(region === 'W') return 'West-Vlaanderen'
            if(region === 'V') return 'Vlaams-Brabant'
            if(region === 'L') return 'Limburg'
            if(region === '?') return 'Regio niet gekend'
        })
        return `<li class="sign-regions-list-item" data-sign-index=[${index}]>
            <button>
                ${regions.join(', ')}
            </button>
        </li>`
    }).join('')
    signRegionsList.insertAdjacentHTML('beforeend', signRegionListItems)

    const signVideo = signInfoPopup.querySelector('.sign-video')
    const signVideoSource = signInfoPopup.querySelector('.sign-video source')
    signVideoSource.src = `https://vlaamsegebarentaal.be/signbank/dictionary/protected_media/glossvideo/${sign.s[0].v}-${sign.s[0].id}.mp4`
    signVideo.load()

    
    signInfoPopup.showModal()

    signInfoPopup.querySelector('.close-popup').addEventListener('click', () => {
        signInfoPopup.close()
        signInfoPopup.innerHTML = ''
    })

    // Close popup when the backdrop is clicked
    signInfoPopup.addEventListener('click', (event) => {
        var rect = signInfoPopup.getBoundingClientRect();
        var isClickInsidePopup = (rect.top <= event.clientY && event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX && event.clientX <= rect.left + rect.width)
        if (!isClickInsidePopup) {
            signInfoPopup.close()
            signInfoPopup.innerHTML = ''
        }
    })
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

function searchSigns(query, signs, resultsList) {
    const filteredSigns = signs.filter(sign => {
        return sign.t.some(translation => {
            return translation.toLowerCase().includes(query.toLowerCase())
        })
    }).sort((signA, signB) => signA.t[0].length - signB.t[0].length)
        .slice(0, 9)

    const noQueryEmptyState = document.querySelector('.empty-state.search-no-query')
    const noResultsEmptyState = document.querySelector('.empty-state.search-no-results')

    if(query.length === 0) {
        noQueryEmptyState.classList.remove('hidden')
        noResultsEmptyState.classList.add('hidden')
        resultsList.classList.add('hidden')
    } else {
        if(filteredSigns.length === 0) {
            noQueryEmptyState.classList.add('hidden')
            noResultsEmptyState.classList.remove('hidden')
            resultsList.classList.add('hidden')

            const similarSigns = signs
                .map(sign => {
                    const translations = sign.t
                    const levenshteinDistances = translations.map(translation => calculateLevenshteinDistance(query.toLowerCase(), translation.toLowerCase()))
                    const shortestLevenshteinDistance = Math.min(...levenshteinDistances)
                    return {
                        ...sign,
                        d: shortestLevenshteinDistance
                    }
                })
                .sort((signA, signB) => signA.d - signB.d)
                .filter(sign => sign.d === 1)
            let suggestion = 'Probeer eens een synoniem?'
            if(similarSigns.length > 0) {
                const suggestionLinks = similarSigns.map(similarSign => `<a class="suggested-sign-link">${similarSign.t.join(', ')}</a>`)
                const formattedLinks = new Intl.ListFormat('nl-BE', { type: "disjunction" }).format(suggestionLinks)
                suggestion = `Bedoelde je misschien ${formattedLinks}?`
            }
            const noResultsSuggestion = document.querySelector('.no-results-suggestion')
            noResultsSuggestion.innerHTML = suggestion
            ;[...noResultsSuggestion.querySelectorAll('.suggested-sign-link')].forEach(suggestedSignLink => {
                suggestedSignLink.addEventListener('click', (event) => {
                    document.querySelector('.search-input').value = event.target.innerText
                    searchSigns(event.target.innerText, signs, resultsList)
                })
            })
        } else {
            noQueryEmptyState.classList.add('hidden')
            noResultsEmptyState.classList.add('hidden')
            resultsList.classList.remove('hidden')
            renderSignsGrid(filteredSigns, resultsList)
        }
    }
}

function calculateLevenshteinDistance(left, right) {
    const array = []
    const charCodeCache = []
    if (left.length > right.length) [left, right] = [right, left]
    let leftLength = left.length - 1
    let rightLength = right.length - 1
    while (leftLength > 0 && left.charCodeAt(leftLength) === right.charCodeAt(rightLength)) {
        leftLength -= 1
        rightLength -= 1
    }
    leftLength += 1
    rightLength += 1
    let start = 0
    while (start < leftLength && left.charCodeAt(start) === right.charCodeAt(start)) {
        start += 1
    }
    leftLength -= start
    rightLength -= start
    if (leftLength === 0) return rightLength
    for (let i = 0; i < leftLength; i += 1) {
        charCodeCache[i] = left.charCodeAt(start + i)
        array[i] = i + 1
    }
    let bCharCode
    let result
    let temp
    let temp2
    let j = 0
    while (j < rightLength) {
        bCharCode = right.charCodeAt(start + j)
        temp = j
        j += 1
        result = j
        for (let i = 0; i < leftLength; i += 1) {
            temp2 = temp + (bCharCode !== charCodeCache[i]) | 0
            temp = array[i]
            if (temp > result) {
                array[i] = temp2 > result ? result + 1 : temp2
            } else {
                array[i] = temp2 > temp ? temp + 1 : temp2
            }
            result = array[i]
        }
    }
    return result
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

function setupDiscoverTab() {
    const loadMoreSignsButton = document.querySelector('.load-more-signs-button')
    const diceIconWrapper = loadMoreSignsButton.querySelector('.icon-wrapper')
    const diceIcon = diceIconWrapper.querySelector('svg')
    document.querySelector('.load-more-signs-button').addEventListener('click', () => {
        // Run dice animation
        diceIconWrapper.classList.add('bounce')
        diceIcon.classList.add('spin')
        setTimeout(() => {
            diceIconWrapper.classList.remove('bounce')
            diceIcon.classList.remove('spin')
        }, 1000)

        // Show a random unknown sign
        showRandomUnknownSign()
    })

    showRandomUnknownSign()
}

function setupBookmarkedTab() {
    updateBookmarkedTab()
}

function updateBookmarkedTab() {
    const bookmarkedSigns = getBookmarkedSigns()
    const bookmarkedSignsEmptyState = document.querySelector('.empty-state.bookmarks-empty-state')
    const bookmarkedSignsGrid = document.querySelector('.signs-grid.bookmarked-signs')

    // Show/hide empty state
    if(bookmarkedSigns.length === 0) {
        bookmarkedSignsEmptyState.classList.remove('hidden')
        bookmarkedSignsGrid.classList.add('hidden')
    } else {
        bookmarkedSignsEmptyState.classList.add('hidden')
        bookmarkedSignsGrid.classList.remove('hidden')
        renderSignsGrid(bookmarkedSigns, bookmarkedSignsGrid)
    }
}

function setupSearchTab(signs) {
    totalNoOfSigns = signs.length
    const randomSign = signs[Math.floor(Math.random() * signs.length)]
    const randomSignName = randomSign.t[0].replaceAll(/ \(.*\)/g, '')

    // Show the no query empty state with the total number of signs
    const noQueryEmptyState = document.querySelector('.empty-state.search-no-query')
    noQueryEmptyState.querySelector('.total-no-of-signs').innerText = totalNoOfSigns

    // Show the no results found empty state with suggestions for related queries
    const noResultsEmptyState = document.querySelector('.empty-state.search-no-results')
    noResultsEmptyState.classList.add('hidden')

    const searchInput = document.querySelector('.search-input')
    searchInput.placeholder = `Zoekterm (bv. '${randomSignName}')`
    const debouncedSearchSigns = debounce(searchSigns, 300)

    searchInput.addEventListener('input', (event) => {
        const searchResultsGrid = document.querySelector('.signs-grid.search-results')
        const query = event.target.value
        document.querySelector('.empty-state.search-no-results .search-query').innerText = query
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