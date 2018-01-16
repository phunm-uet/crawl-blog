var rp = require('request-promise')
var request = require('request')
var cheerio = require('cheerio')
const fs = require('fs');
require('dotenv').config({path: '.env'})

/**
 * Function support crawl link 
 * @param {string} url : url want to crawl
 * @param {string} classBody : class body content want crawl
 * @param {array} classRemove : list class want remove into content body (eg : class ads,social sharing)
 */
var crawl = function(url,classBody,classRemove)
{
    return new Promise((resolve, reject) => {
        rp.get(url).then(html => {
            var $ = cheerio.load(html)
            classRemove.forEach(element => {
                $(element).remove()
            });
            let body = $(classBody).html()
            let title = $('meta[property="og:title"]').attr('content')
            let description = $('meta[property="og:description"]').attr('content')
            let urlImage = $('meta[property="og:image"]').attr('content')
            let slug = url.match(/([^\/]*)\/*$/)[1]
            let fileName = urlImage.split('/').pop().split('#')[0].split('?')[0];
            let filePath = process.env.FOLDER_IMG+fileName
            download(urlImage,filePath)
            return resolve({
                title : title,
                description : description,
                slug : slug,
                body : body,
                filePath : filePath
            })
        })
        .catch(err => {
            return reject(err)
        })
    })
}

var download = function(url,filePath){
    request(url).pipe(fs.createWriteStream(filePath))
}
module.exports = crawl