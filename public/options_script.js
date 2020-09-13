function onload() {
    let color = false
    if (localStorage.getItem('bgcolor')) {
        document.body.style.background = localStorage.getItem('bgcolor')
        color = localStorage.getItem('bgcolor')
    }
    if (page_onload()) page_onload(color)
    const history_url = document.location.href.split('?')[0]
    history.pushState('back', null, 'http://www.' + history_url + '/..');
}