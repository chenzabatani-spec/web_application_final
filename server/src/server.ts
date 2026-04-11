import initApp from './app';
import dotenv from 'dotenv';
import './common/passport';

dotenv.config();

initApp().then((app) => {
    const port = process.env.BACKEND_PORT || 4000;
    app.listen(port, () => {
        console.log(`Server is running on port: ${port}`);
        console.log(`Node Environment: ${process.env.NODE_ENV}`);
    });
});