var rp = require('request-promise')
var request = require('request')
var cheerio = require('cheerio')
const fs = require('fs');
var slug = require('slug')
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
        let tags = []
        rp.get(url).then(html => {
            var $ = cheerio.load(html)
            classRemove.forEach(element => {
                $(element).remove()
            });
            let body = $(classBody).html()
            let title = $('meta[property="og:title"]').attr('content')
            let description = $('meta[property="og:description"]').attr('content')
            let urlImage = $('meta[property="og:image"]').attr('content')
            let linkSlug = url.match(/([^\/]*)\/*$/)[1]
            $('meta[property="article:tag"]').each((i,el) => {
                let tagName = $(el).attr('content')
                let tagSlug = slug(tagName)
                tags.push({
                    "name" : tagName,
                    "slug" : tagSlug.toLowerCase(),
                    "user_id" : 1
                })
            })
            let fileName = urlImage.split('/').pop().split('#')[0].split('?')[0];
            let filePath = process.env.FOLDER_IMG_SAVE + fileName
            let realFilePath = process.env.REAL_FOLDER_IMG + fileName
            download(urlImage,realFilePath)
            return resolve({
                "title" : title,
                "description" : description,
                "slug" : linkSlug,
                "tags" : tags,
                "body" : body,
                "filePath" : filePath
            })
        })
        .catch(err => {
            return reject(err)
        })
    })
}
/**
 * Function download image 
 * @param {string} url 
 * @param {string} filePath 
 */
var download = function(url,filePath){
    request(url).pipe(fs.createWriteStream(filePath))
}
module.exports = crawl