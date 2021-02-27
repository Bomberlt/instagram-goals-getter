import 'dotenv/config';
import Instagram from 'instagram-web-api';
import express from 'express';
 
console.log('Hello Node.js project.');
 
console.log(process.env.MY_SECRET);

const client = new Instagram({ username: process.env.username, password: process.env.password });

async function asyncCall() {
    const photos = await client.getPhotosByUsername({ username: '250pix', first: 250 });
    const nodes = photos.user.edge_owner_to_timeline_media.edges;
    const posts = nodes.map(node => {
        const caption = node.node.edge_media_to_caption
            ? node.node.edge_media_to_caption.edges[0].node
            : 'no-title'
        const datePart = caption.text.split(' ')[0];
        const month = datePart.split('-')[0].padStart(2, '0');
        const day = datePart.split('-')[1];
        const date = `2021-${month}-${day}`;
        const title = caption.text.substring(datePart.length + 1).includes('#')
            ? `${caption.text.substring(datePart.length + 1).split('.')[0]}.`
            : caption.text.substring(datePart.length + 1)
        return {
            value: title,
            date: date,
            imageUrl: node.node.display_url,
            timestamp: node.node.taken_at_timestamp
        }
    });
    return posts;
  }

  const app = express();

  app.get('/data', async (req, res) => {
    const posts = await asyncCall();
    const data = {      
        title: "2021 Goals",
        goals: [{
            name: "Take 250 pics",
            type: "COMPLETE_N_ITEMS",
            hideItems: false,
            data: {
                itemCountToComplete: 250,
                entries: posts.slice()
            }
        }]
    };
    res.send(data);
  });
   
  app.listen(3001, () => {
    console.log('Example app listening on port 3001!');
    client.login();
    console.log('Logged in to Instagram');
  });