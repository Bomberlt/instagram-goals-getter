import 'dotenv/config';
import { IgApiClient } from 'instagram-private-api';

import express from 'express';
 
console.log('Hello Node.js project.');
 
console.log(process.env.MY_SECRET);
const ig = new IgApiClient();

async function asyncCall() {
    ig.state.generateDevice(process.env.instagram_username);
    ig.simulate.preLoginFlow();
    const loggedInUser = await ig.account.login(process.env.instagram_username, process.env.password);
    process.nextTick(async () => await ig.simulate.postLoginFlow());
    console.log('Logged in to Instagram');

    // Create UserFeed instance to get loggedInUser's posts
    const targetUser = await ig.user.searchExact('250pix'); // getting exact user by login
    const userFeed = ig.feed.user(targetUser.pk);
    let posts = [];
    let count = 0;
    do {
        const page = await userFeed.items();
        count = page.length;
        const pagePosts =page.map(post => {
            const caption = post.caption.text;
            const datePart = caption.split(' ')[0];
            const month = datePart.split('-')[0].padStart(2, '0');
            const day = datePart.split('-')[1];
            const date = `2021-${month}-${day}`;
            const title = caption.substring(datePart.length + 1).includes('#')
                ? `${caption.substring(datePart.length + 1).split('.')[0]}.`
                : caption.substring(datePart.length + 1)
            return {
                value: title,
                date: date,
                imageUrl: post.image_versions2.candidates[0].url,
                timestamp: post.taken_at
            }
        });
        posts = posts.concat(pagePosts);
    } while (count === 18);
    console.log(posts);
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
   
  app.listen(3003, () => {
    console.log('Example app listening on port 3003!');
  });