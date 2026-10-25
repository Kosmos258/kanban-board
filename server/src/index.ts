import { createApp } from './app';
import { env } from './config/env';

createApp().listen(env.port, () => {
  console.log(`Server is running on http://localhost:${env.port}`);
});
