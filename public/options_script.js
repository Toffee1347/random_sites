function onload() {
    if (localStorage.getItem('bgcolor')) {
        document.body.style.background = localStorage.getItem('bgcolor')
    }
    const history_url = document.location.href.split('?')[0]
    history.pushState(null, null, 'http://www.' + history_url + '/..');
    if (page_onload()) page_onload()
}