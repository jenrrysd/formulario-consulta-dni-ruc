const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Habilitar CORS para todas las peticiones
app.use(cors());
app.use(express.json());

// Servir archivos estáticos (HTML, CSS, JS)
app.use(express.static(__dirname));

// Ruta proxy para consultas SUNAT
app.get('/api/consulta', async (req, res) => {
    const { tipo, numero } = req.query;
    const TOKEN = "sk_10921.ytFcmj7MvF6ZVKoEKmL9P2aAixNO8fRV";
    
    let url = "";
    if(tipo === "ruc"){
        url = `https://api.decolecta.com/v1/sunat/ruc?numero=${numero}&token=${TOKEN}`;
    } else if(tipo === "dni"){
        url = `https://api.decolecta.com/v1/sunat/dni?numero=${numero}&token=${TOKEN}`;
    }

    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: 'Error al consultar la API' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
