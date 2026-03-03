import initApp from './app';
import dotenv from 'dotenv';
import './common/passport';

dotenv.config();

initApp().then((app) => {
    const port = process.env.PORT;
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });
});