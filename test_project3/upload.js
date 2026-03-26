app.post('/upload', (req, res) => {
    const file = req.files.file
    file.mv("./uploads/" + file.name)
})