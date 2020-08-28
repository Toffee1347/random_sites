function onload() {
    if (localStorage.getItem('bgcolor')) {
        document.body.style.background = localStorage.getItem('bgcolor')
    }
}