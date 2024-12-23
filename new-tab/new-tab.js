document.querySelector('.date').textContent = new Intl.DateTimeFormat('nl-BE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
}).format(new Date());

const noOfDailySigns = 9;
let selectedSigns = []

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
    selectedSigns.forEach(sign => {
        const noOfSigns = sign.s.length

        let selectDisabled = ''
        if(noOfSigns === 1) selectDisabled = 'disabled'

        let regionSelectControls = ''
        if(noOfSigns > 1) {
            regionSelectControls = `
                <svg viewBox="0 0 24 24" id="magicoon-Filled" xmlns="http://www.w3.org/2000/svg">
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
                    <div class="sign-regions">
                        <select class="sign-region-select" ${selectDisabled} onchange="showRegionalSign(event)">
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
    })
})()