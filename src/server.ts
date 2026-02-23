// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable no-console */

// import http, { Server } from 'http';
// import mongoose from 'mongoose';
// import app from './app';
// import config from './app/config';
// import seedAdmin from './app/seed';
// import colors from 'colors';

// let server: Server | null = null;

// // bootstrap function
// async function bootstrap() {
//   try {
//     // Connect to MongoDB
//     await mongoose.connect(config.db_url as string);
//     console.log(colors.green('🛢 Database connected successfully').bold);

//     // Seed initial admin if not already present
//     await seedAdmin();

//     // Start the HTTP server
//     const port = config.port;
//     server = http.createServer(app);

//     server.listen(port, () => {
//       console.log(
//         colors.green(
//           `🚀 ${config.preffered_website_name} server is running on port ${port}!`
//         )
//       );
//     });

//     // Handle connection errors gracefully
//     server.on('error', (err) => {
//       console.error('❌ Server error:', err);
//       shutdown('SERVER_ERROR', err);
//     });
//   } catch (error) {
//     console.error('❌ Failed to start the application:', error);
//     process.exit(1);
//   }
// }

// // Boot up
// bootstrap();

// // Global process event handlers
// ['SIGTERM', 'SIGINT', 'uncaughtException', 'unhandledRejection'].forEach(
//   (signal) => {
//     process.on(signal as NodeJS.Signals, (err?: any) => {
//       shutdown(signal, err instanceof Error ? err : undefined);
//     });
//   }
// );

// // Gracefully closes the HTTP server and MongoDB connection.
// async function shutdown(signal: string, error?: Error) {
//   console.log(`\n⚠️  Received ${signal}. Shutting down gracefully...`);

//   if (error) {
//     console.error('Reason:', error.message);
//   }

//   try {
//     if (server) {
//       await new Promise<void>((resolve, reject) => {
//         server!.close((err) => (err ? reject(err) : resolve()));
//       });
//       console.log('🧩 Server closed.');
//     }

//     await mongoose.connection.close();
//     console.log('🧩 MongoDB connection closed.');

//     process.exit(error ? 1 : 0);
//   } catch (err) {
//     console.error('Error during shutdown:', err);
//     process.exit(1);
//   }
// }

/* eslint-disable no-console */
import { Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import config from './app/config';
import seedSuperAdmin from './app/seed';
import colors from 'colors';

let server: Server | null = null;

// Database connection function
async function connectToDatabase() {
  try {
    await mongoose.connect(config.db_url as string);
    console.log(colors.green('✅ Database connected successfully!  🛢').bold);
  } catch (err) {
    console.error(colors.red('Failed to connect to database:'), err);
    process.exit(1); // Database কানেক্টেড না থাকলে অ্যাপ চালানোর দরকার নেই, তাই অ্যাপ বন্ধ করে দেওয়া হচ্ছে
  }
}

// Graceful shutdown function to close the server properly
function gracefulShutdown(signal: string) {
  console.log(colors.red(`Received ${signal}. Closing server... 🤷‍♂️ `));
  if (server) {
    server.close(() => {
      console.log(colors.red('Server closed gracefully! ✅'));
      process.exit(0); // সবকিছু ঠিকঠাক বন্ধ হলে অ্যাপ সম্পূর্ণভাবে বন্ধ করে দেওয়া হচ্ছে
    });
  } else {
    process.exit(0);
  }
}

// Application bootstrap function
async function main() {
  try {
    await connectToDatabase();
    // Seed function
    await seedSuperAdmin();

    server = app.listen(config.port, () => {
      console.log(
        colors.green(
          `🚀 ${config.preffered_website_name} server is running on port ${config.port}! ✨  ⚡`
        )
      );
    });

    // Listen for OS termination signals (Ctrl+C or server stop)
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handling uncaught exceptions (যদি কোডে কোনো অপ্রত্যাশিত ভুল হয়)
    process.on('uncaughtException', (error) => {
      console.error(colors.red('😈 Uncaught Exception:'), error);
      // সার্ভার চলছে, তাই অ্যাপ বন্ধ করে দেওয়া হচ্ছে
      gracefulShutdown('uncaughtException');
    });

    // Handling unhandled promise rejections (যদি কোনো প্রমিস রিজেক্ট হয় কিন্তু ক্যাচ করা না হয়)
    process.on('unhandledRejection', (error) => {
      console.error(colors.red('😈 Unhandled Rejection:'), error);
      // সার্ভার চলছে, তাই অ্যাপ বন্ধ করে দেওয়া হচ্ছে
      gracefulShutdown('unhandledRejection');
    });
  } catch (error) {
    console.error(colors.red('😈 Error during bootstrap:'), error);
    // যদি সার্ভার চালু না হয়, তাহলে অ্যাপ সাথে সাথে বন্ধ করে দেওয়া হবে
    process.exit(1);
  }
}

main();
