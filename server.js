const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const PORT = 3001;
const app = express();
const dbPath = path.join(__dirname, 'db.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'notes.html'));
});


app.get('/api/notes', (req, res) => {
    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Error reading file');
        try {
            const notes = JSON.parse(data);
            res.json(notes);
        } catch (error) {
            res.status(500).send('Error parsing JSON');
        }
    });
});

app.post('/api/notes', (req, res) => {
    const newNote = req.body;
    if (!newNote.title || !newNote.text) return res.status(400).send('Note must have a title and text');

    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Error reading file');
        try {
            const notes = JSON.parse(data);
            newNote.id = uuidv4();
            notes.push(newNote);
            fs.writeFile(dbPath, JSON.stringify(notes, null, 2), (err) => {
                if (err) return res.status(500).send('Error saving note');
                res.status(201).json(newNote);
            });
        } catch (error) {
            res.status(500).send('Error parsing JSON');
        }
    });
});

app.delete('/api/notes/:id', (req, res) => {
    const noteId = req.params.id;
    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Error reading file');
        try {
            let notes = JSON.parse(data);
            notes = notes.filter(note => note.id !== noteId);
            fs.writeFile(dbPath, JSON.stringify(notes, null, 2), (err) => {
                if (err) return res.status(500).send('Error deleting note');
                res.status(204).end();
            });
        } catch (error) {
            res.status(500).send('Error parsing JSON');
        }
    });
});