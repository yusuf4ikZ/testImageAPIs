const express = require("express");
const { google } = require("googleapis");
const vision = require("@google-cloud/vision");
const config = require("./config");
const detectObject = require("object-detection");

const app = express();

const customsearch = google.customsearch("v1");

app.get("/search", (req, res, next) => {
    const { q, start, num } = req.query;

    console.log(q, start, num);

    customsearch.cse
        .list({
            auth: config.API_KEY,
            cx: config.CX,
            q,
            searchType: "image",
            // num: 30
            // start, num
        })
        .then((result) => result.data)
        .then((result) => {
            const { queries, items, searchInformation } = result;

            const page = (queries.request || [])[0] || {};
            const previousPage = (queries.previousPage || [])[0] || {};
            const nextPage = (queries.nextPage || [])[0] || {};

            const data = {
                q,
                totalResults: page.totalResults,
                count: page.count,
                startIndex: page.startIndex,
                nextPage: nextPage.startIndex,
                previousPage: previousPage.startIndex,
                time: searchInformation.searchTime,
                items: items.map((o) => ({
                    link: o.link,
                    title: o.title,
                    snippet: o.snippet,
                    img: (((o.pagemap || {}).cse_image || {})[0] || {}).src,
                })),
            };
            // res.status(200).send(result)
            res.status(200).send(data);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send(err);
        });
});

app.get("/detect", async (req, res) => {
    // try {
    //     const config = {
    //         imageName: "./test_img.jpg", // preferrably in JPG format and less than 100 kB
    //         sensitivity: 80, // ranges from 1 to 100
    //         tolerance: 50, // ranges from 1 to 100
    //     };

    //     detectObject(config).then(function (response) {
    //         var base64Img = response.base64Img;

    //         // use base64Img in html image tag ...
    //         imageElement.setAttribute(
    //             "src",
    //             "data:image/jpeg;base64," + base64Img,
    //         );

    //         // save base64Img as image file ...
    //         fs.writeFile(
    //             "object.jpg",
    //             base64Img,
    //             { encoding: "base64" },
    //             function () {
    //                 console.log("Saved object image");
    //             },
    //         );
    //     });
    // } catch (e) {
    //     console.log(e);
    // }

    const client = new vision.ImageAnnotatorClient({
    	keyFilename: './google_creds.json'
    })
    // const [result] = await client.logoDetection('./test_img.jpg')

    const [result] = await client.labelDetection('./test_img.jpg');
    const labels = result.labelAnnotations;
    console.log('Labels:');
    labels.forEach(label => console.log(label.description));

    res.status(200).send({ a: 1 });
});

app.listen(3000, () => {
    console.log("Server running in port = 3000");
});
