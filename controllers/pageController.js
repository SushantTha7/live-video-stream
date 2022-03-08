const pageIndex = (req, res) => {
    res.render('home', {title: 'Home'});
}

const recongnizeFace = (req, res) => {
    res.render('recognizeFace', {title: 'Face recognition'});
}

const client = (req, res) => {
    res.render('client', {title: 'Client'});
}
const aboutus = (req, res) => {
    res.render('aboutUs', {title: 'About us'})
}
module.exports = {
    pageIndex,
    recongnizeFace, 
    client,
    aboutus
}