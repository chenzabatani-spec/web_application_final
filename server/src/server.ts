import './loadEnv';
import initApp from './app';
import './common/passport';
import https from 'https';
import http from 'http';
import fs from 'fs';

initApp().then((app) => {
    const port = process.env.PORT || 4000;
    const env = process.env.NODE_ENV || 'development';

    console.log('----------------------------------------');
    console.log(`🌍 Current Environment: ${env.toUpperCase()}`);
    console.log('----------------------------------------');

    if (process.env.NODE_ENV !== 'production') {
        http.createServer(app).listen(port, () => {
            console.log(`✅ HTTP Server is running at http://localhost:${port}`);
        });
    } else {
        const options = {
            key: fs.readFileSync('ssl/client-key.pem'),
            cert: fs.readFileSync('ssl/client-cert.pem')
        };
        
        https.createServer(options, app).listen(port, () => {
            console.log(`🔒 HTTPS Server is running on port ${port}`);
        });
    }
});