function handleMessage(request, sender, sendResponse) {
    console.log(request)
    const matchingSigns = request.matchingSigns
    if(request.matchingSigns.length > 0) {
        const signsList = document.querySelector('.signs')
        matchingSigns.forEach(sign => {
            signsList.insertAdjacentHTML('beforeend', 
                `<li>
                    <h2>${new Intl.ListFormat('nl-BE', { style: 'short', type: 'conjunction' }).format(sign.r)}</h2>
                    <video controls>
                        <source src="https://vlaamsegebarentaal.be/signbank/dictionary/protected_media/glossvideo/${sign.v}-${sign.s}.mp4" />
                    </video>
                </li>`
            )
        })
    }
}
  
chrome.runtime.onMessage.addListener(handleMessage)