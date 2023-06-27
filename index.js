const express = require('express');
const app = express();
const cors = require('cors');
const Queue = require('./queue');
app.use(express.json());

const oneTenthOfASecond = 100;
const messages = new Queue(); // could use an array with push and shift instead, but this is more fun
messages.enqueue('Hello');
messages.enqueue('World');

// cors anywhere
app.use(cors());

app.post('/messages', (req, res) => {
  const message = req.body.message;
  // messages.push(message);
  messages.enqueue(message);
  console.log(`Message received: ${message}`, messages);
  res.status(201).json({ message });
});

app.get('/progress', async function (req, res) {
  res.set({
    'Cache-Control': 'no-cache',
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
  });

  res.write('');

  for await (let i of Array(100).keys()) {
    res.write(JSON.stringify({ progress: i }));
    res.emit('data', JSON.stringify({ progress: i }));
    res.write('\n');

    await sleep(oneTenthOfASecond);
  }

  res.write(JSON.stringify({ progress: 100 }));
  // }, 1000);

  req.on('close', () => {
    console.log('Client closed connection. Aborting.');

    res.end();
    // clearInterval(intervalId);
  });
});

app.get('/messages', async function (req, res) {
  res.set({
    'Cache-Control': 'no-cache',
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
  });

  res.write('');

  const intervalId = setInterval(async () => {
    // const message = messages.shift();
    const message = messages.front();

    if (message) {
      try {
        res.write('\n');
        res.write(message);
        res.emit('data', message);
        messages.dequeue(); // remove the message from the queue, could'dve deequeued it earlier but its async so it might not have been sent yet, catch error.
      } catch (error) {
        console.error(error);
      }
    }

    await sleep(oneTenthOfASecond);
  }, oneTenthOfASecond);

  req.on('close', () => {
    console.log('Client closed connection. Aborting.');

    res.end();
    clearInterval(intervalId);
  });
});

const sleep = async (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

app.listen(3000, () => {
  console.log('Listening on port 3000...');
});
