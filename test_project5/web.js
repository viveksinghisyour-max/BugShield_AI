app.get('/search', (req, res) => {
    res.send(req.query.q)
})