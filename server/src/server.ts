import initApp from './app';
import dotenv from 'dotenv';

dotenv.config();

initApp().then((app) => {
    const port = process.env.PORT;
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });
});